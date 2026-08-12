import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

const isTurso = !!process.env.TURSO_DATABASE_URL;

if (!isTurso) {
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
}

export const client = isTurso
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
      intMode: "number",
    })
  : createClient({
      url: `file:${config.databasePath}`,
      intMode: "number",
    });

function normalizeRow(row, columns = []) {
  if (!row) return null;
  const out = {};
  columns.forEach((col, i) => {
    const val = row[i] !== undefined ? row[i] : row[col];
    out[col] = typeof val === "bigint" ? Number(val) : val;
  });
  if (typeof row === "object" && !Array.isArray(row)) {
    for (const key of Object.keys(row)) {
      const val = row[key];
      out[key] = typeof val === "bigint" ? Number(val) : val;
    }
  }
  return out;
}

function cleanArgs(args) {
  const arr = Array.isArray(args) ? args : [args];
  return arr.map((v) => (v === undefined ? null : v));
}

export const db = {
  async get(sql, args = []) {
    const res = await client.execute({ sql, args: cleanArgs(args) });
    return res.rows[0] ? normalizeRow(res.rows[0], res.columns) : null;
  },
  async all(sql, args = []) {
    const res = await client.execute({ sql, args: cleanArgs(args) });
    return res.rows.map((r) => normalizeRow(r, res.columns));
  },
  async run(sql, args = []) {
    return client.execute({ sql, args: cleanArgs(args) });
  },
};

export async function initDb() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      google_id       TEXT PRIMARY KEY,
      email           TEXT NOT NULL,
      name            TEXT,
      avatar          TEXT,
      access_token    TEXT,
      refresh_token   TEXT,
      token_expiry    INTEGER,
      root_folder_id  TEXT,
      created_at      INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(google_id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      room_id            TEXT PRIMARY KEY,
      host_user_id       TEXT NOT NULL REFERENCES users(google_id),
      password_hash      TEXT NOT NULL,
      password_encrypted TEXT,
      folder_id          TEXT NOT NULL,
      total_bytes        INTEGER NOT NULL DEFAULT 0,
      created_at         INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS room_members (
      room_id   TEXT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
      user_id   TEXT NOT NULL REFERENCES users(google_id) ON DELETE CASCADE,
      role      TEXT NOT NULL DEFAULT 'member',
      joined_at INTEGER NOT NULL,
      PRIMARY KEY (room_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS files (
      id             TEXT PRIMARY KEY,
      room_id        TEXT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
      drive_file_id  TEXT NOT NULL,
      name           TEXT NOT NULL,
      mime_type      TEXT NOT NULL,
      size_bytes     INTEGER NOT NULL,
      uploader_id    TEXT NOT NULL REFERENCES users(google_id),
      created_at     INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_files_room ON files(room_id);
    CREATE INDEX IF NOT EXISTS idx_members_user ON room_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_rooms_host ON rooms(host_user_id);
  `);

  // Migration: add password_encrypted column if it doesn't exist
  try {
    await db.run("ALTER TABLE rooms ADD COLUMN password_encrypted TEXT");
  } catch { /* column already exists */ }

  // Migration: add auto_sync column to room_members if it doesn't exist
  try {
    await db.run("ALTER TABLE room_members ADD COLUMN auto_sync INTEGER NOT NULL DEFAULT 0");
  } catch { /* column already exists */ }

  // Migration: add left column to room_members if it doesn't exist
  try {
    await db.run("ALTER TABLE room_members ADD COLUMN left INTEGER NOT NULL DEFAULT 0");
  } catch { /* column already exists */ }

  // Migration: add kicked column to room_members if it doesn't exist
  try {
    await db.run("ALTER TABLE room_members ADD COLUMN kicked INTEGER NOT NULL DEFAULT 0");
  } catch { /* column already exists */ }

  // Migration: email/password accounts (hosts must still use Google)
  try {
    await db.run("ALTER TABLE users ADD COLUMN password_hash TEXT");
  } catch { /* column already exists */ }
  try {
    await db.run("ALTER TABLE users ADD COLUMN auth_type TEXT NOT NULL DEFAULT 'google'");
  } catch { /* column already exists */ }
  try {
    await db.run(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)"
    );
  } catch {
    /* duplicate emails may exist in older data; app-level checks still apply */
  }

  // Migration: add banned column to users if it doesn't exist
  try {
    await db.run("ALTER TABLE users ADD COLUMN banned INTEGER NOT NULL DEFAULT 0");
  } catch { /* column already exists */ }
}
