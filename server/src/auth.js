import { OAuth2Client } from "google-auth-library";
import crypto from "node:crypto";
import { config } from "./config.js";
import { db } from "./db.js";
import { encrypt, decrypt } from "./crypto.js";

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

  await db.run(
    `INSERT INTO users (google_id, email, name, avatar, access_token, refresh_token, token_expiry, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(google_id) DO UPDATE SET
       email=excluded.email,
       name=excluded.name,
       avatar=excluded.avatar,
       access_token=excluded.access_token,
       refresh_token=CASE WHEN excluded.refresh_token IS NOT NULL THEN excluded.refresh_token ELSE users.refresh_token END,
       token_expiry=excluded.token_expiry`,
    [
      googleId,
      email,
      name,
      avatar,
      encrypt(tokens.access_token),
      encrypt(tokens.refresh_token),
      tokens.expiry_date || null,
      Date.now(),
    ]
  );

  return getStoredUser(googleId);
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
  if (session.expires_at < Date.now()) {
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
