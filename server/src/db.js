import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new DatabaseSync(config.databasePath);

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

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
  room_id        TEXT PRIMARY KEY,
  host_user_id   TEXT NOT NULL REFERENCES users(google_id),
  password_hash  TEXT NOT NULL,
  folder_id      TEXT NOT NULL,
  total_bytes    INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL
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
`);
