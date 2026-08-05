import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

dotenv.config({ path: path.resolve(root, "../.env") });
dotenv.config({ path: path.resolve(root, ".env") });

const env = process.env;

const missing = [];
const required = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "SESSION_SECRET",
  "ENCRYPTION_KEY",
];
for (const key of required) {
  if (!env[key]) missing.push(key);
}

export const config = {
  port: Number(env.PORT || 4000),
  frontendUrl: env.FRONTEND_URL || "http://localhost:3000",
  databasePath: path.isAbsolute(env.DATABASE_PATH || "")
    ? env.DATABASE_PATH
    : path.resolve(root, env.DATABASE_PATH || "./data/gcloister.db"),
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/drive.file",
    ],
  },
  sessionSecret: env.SESSION_SECRET,
  encryptionKey: env.ENCRYPTION_KEY,
  roomStorageBytes: Number(env.ROOM_STORAGE_BYTES || 5 * 1024 * 1024 * 1024),
  maxFileBytes: Number(env.MAX_FILE_BYTES || 2 * 1024 * 1024 * 1024),
  cookieName: "gcl_session",
  sessionTtlMs: 30 * 24 * 60 * 60 * 1000,
  previewLinkTtlMs: 15 * 60 * 1000,
  missing,
};

export function assertConfig() {
  if (config.missing.length) {
    console.error(
      "[config] Missing required env vars: " + config.missing.join(", ")
    );
    console.error(
      "[config] Copy .env.example to .env and fill in your Google OAuth credentials."
    );
    process.exit(1);
  }
  if (Buffer.from(config.encryptionKey, "base64").length !== 32) {
    console.error(
      "[config] ENCRYPTION_KEY must be 32 random bytes base64-encoded. Generate: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
    process.exit(1);
  }
}
