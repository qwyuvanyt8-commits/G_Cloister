import { OAuth2Client } from "google-auth-library";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { db } from "./db.js";
import { encrypt, decrypt } from "./crypto.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

function baseError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function oauthClient() {
  return new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}

export function buildAuthUrl(state) {
  return oauthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: config.google.scopes,
    state,
  });
}

export async function exchangeCode(code) {
  const { tokens } = await oauthClient().getToken(code);
  return tokens;
}

export async function handleGoogleTokens(tokens) {
  const client = oauthClient();
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.google.clientId,
  });
  const payload = ticket.getPayload();
  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name || email;
  const avatar = payload.picture || null;
  const accessEnc = encrypt(tokens.access_token);
  const refreshEnc = encrypt(tokens.refresh_token);
  const expiry = tokens.expiry_date || null;

  // Existing Google account — refresh its profile and tokens.
  let existing = await db.get("SELECT * FROM users WHERE google_id = ?", [googleId]);
  if (existing) {
    await db.run(
      `UPDATE users SET
         email=?, name=?, avatar=?,
         access_token=?,
         refresh_token=CASE WHEN ? IS NOT NULL THEN ? ELSE refresh_token END,
         token_expiry=?
       WHERE google_id=?`,
      [email, name, avatar, accessEnc, refreshEnc, refreshEnc, expiry, googleId]
    );
    return getStoredUser(googleId);
  }

  // No Google-linked account yet — check whether the email already signed up
  // with email/password so we can link this Google account to it (preserving
  // their memberships and room history instead of creating a duplicate).
  const byEmail = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (byEmail) {
    if (byEmail.auth_type === "email") {
      await db.run(
        `UPDATE users SET
           email=?, name=?, avatar=?,
           access_token=?, refresh_token=?, token_expiry=?,
           auth_type='google'
         WHERE google_id=?`,
        [email, name, avatar, accessEnc, refreshEnc, expiry, byEmail.google_id]
      );
      return getStoredUser(byEmail.google_id);
    }
    await db.run(
      `UPDATE users SET
         access_token=?,
         refresh_token=CASE WHEN ? IS NOT NULL THEN ? ELSE refresh_token END,
         token_expiry=?
       WHERE google_id=?`,
      [accessEnc, refreshEnc, refreshEnc, expiry, byEmail.google_id]
    );
    return getStoredUser(byEmail.google_id);
  }

  // Brand-new Google user.
  await db.run(
    `INSERT INTO users (google_id, email, name, avatar, access_token, refresh_token, token_expiry, auth_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'google', ?)`,
    [googleId, email, name, avatar, accessEnc, refreshEnc, expiry, Date.now()]
  );
  return getStoredUser(googleId);
}

export async function registerUser({ name = "", email = "", password = "" }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim().slice(0, 60);
  if (!EMAIL_RE.test(cleanEmail)) {
    throw baseError("Enter a valid email address.", 400);
  }
  if (password.length < MIN_PASSWORD) {
    throw baseError(`Password must be at least ${MIN_PASSWORD} characters.`, 400);
  }

  const existing = await db.get("SELECT * FROM users WHERE email = ?", [cleanEmail]);
  if (existing) {
    if (existing.auth_type === "google") {
      throw baseError(
        "This email is already connected to a Google account. Sign in with Google instead.",
        409
      );
    }
    throw baseError(
      "An account with this email already exists. Sign in instead.",
      409
    );
  }

  const googleId = crypto.randomUUID();
  await db.run(
    `INSERT INTO users (google_id, email, name, avatar, password_hash, access_token, refresh_token, token_expiry, auth_type, created_at)
     VALUES (?, ?, ?, NULL, ?, NULL, NULL, NULL, 'email', ?)`,
    [googleId, cleanEmail, cleanName || cleanEmail.split("@")[0], bcrypt.hashSync(password, 10), Date.now()]
  );
  return { user: publicUser(await getStoredUser(googleId)) };
}

export async function loginUser(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) {
    throw baseError("Enter a valid email address.", 400);
  }
  const user = await db.get("SELECT * FROM users WHERE email = ?", [cleanEmail]);
  if (!user) {
    throw baseError("No account found with this email. Create one first.", 401);
  }
  if (!user.password_hash) {
    throw baseError(
      "This email is connected to a Google account. Sign in with Google instead.",
      400
    );
  }
  if (!bcrypt.compareSync(password, user.password_hash)) {
    throw baseError("Incorrect email or password.", 401);
  }
  return { user: publicUser(user) };
}

export async function getStoredUser(googleId) {
  return (await db.get("SELECT * FROM users WHERE google_id = ?", [googleId])) || null;
}

export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.google_id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    authType: row.auth_type === "email" ? "email" : "google",
    hasDrive: !!(row.refresh_token || row.access_token),
  };
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  await db.run(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [token, userId, now, now + config.sessionTtlMs]
  );
  return token;
}

export async function destroySession(token) {
  if (!token) return;
  await db.run("DELETE FROM sessions WHERE token = ?", [token]);
}

export async function sessionUserFromToken(token) {
  if (!token) return null;
  const session = await db.get(
    "SELECT s.user_id, s.expires_at FROM sessions s WHERE s.token = ?",
    [token]
  );
  if (!session) return null;
  if (Number(session.expires_at) < Date.now()) {
    await db.run("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }
  return getStoredUser(session.user_id);
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = bearerToken || req.cookies?.[config.cookieName];
  const user = await sessionUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.user = user;
  req.sessionToken = token;
  next();
}

export function decryptTokens(user) {
  if (!user) return { accessToken: null, refreshToken: null };
  return {
    accessToken: decrypt(user.access_token),
    refreshToken: decrypt(user.refresh_token),
  };
}
