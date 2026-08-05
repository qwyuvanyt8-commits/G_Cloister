import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "node:crypto";
import { config, assertConfig } from "./config.js";
import { db } from "./db.js";
import {
  buildAuthUrl,
  exchangeCode,
  handleGoogleTokens,
  createSession,
  destroySession,
  publicUser,
  requireAuth,
} from "./auth.js";
import { roomsRouter } from "./rooms.js";
import { setupSocket } from "./socket.js";

assertConfig();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true);

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-File-Name", "Content-Length"],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

const rateLimit = (windowMs, max) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) {
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }
    arr.push(now);
    hits.set(key, arr);
    next();
  };
};

// ---- Auth routes ----
app.get("/api/auth/google", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("gcl_oauth_state", state, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(buildAuthUrl(state));
});

app.get("/api/auth/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const expected = req.cookies?.gcl_oauth_state;
  res.clearCookie("gcl_oauth_state", { path: "/" });
  if (error || !code) {
    return res.redirect(`${config.frontendUrl}?auth=error`);
  }
  if (!state || !expected || state !== expected) {
    return res.redirect(`${config.frontendUrl}?auth=error`);
  }
  try {
    const tokens = await exchangeCode(code);
    const user = await handleGoogleTokens(tokens);
    const sessionToken = createSession(user.google_id);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie(config.cookieName, sessionToken, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      path: "/",
      maxAge: config.sessionTtlMs,
    });
    res.redirect(`${config.frontendUrl}/home?auth=success&token=${sessionToken}`);
  } catch (err) {
    console.error("[auth] callback error:", err?.message);
    res.redirect(`${config.frontendUrl}?auth=error`);
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post("/api/auth/logout", (req, res) => {
  destroySession(req.cookies?.[config.cookieName]);
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(config.cookieName, {
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
  res.json({ ok: true });
});

// ---- Rooms ----
app.use("/api/rooms", rateLimit(60_000, 120), roomsRouter);

// ---- Misc ----
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "gcloister", time: Date.now() });
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error("[server] error:", err?.message);
  res.status(500).json({ error: "Internal server error" });
});

const server = http.createServer(app);
setupSocket(server);

server.listen(config.port, () => {
  console.log(`[gcloister] server ready on http://localhost:${config.port}`);
  console.log(`[gcloister] frontend: ${config.frontendUrl}`);
  console.log(
    config.missing.length
      ? `[gcloister] WARNING: missing env vars: ${config.missing.join(", ")}`
      : "[gcloister] env ok"
  );
});

process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandled rejection:", reason);
});
