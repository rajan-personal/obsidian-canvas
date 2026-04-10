CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  picture TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

ALTER TABLE projects ADD COLUMN user_id TEXT REFERENCES users(id);
CREATE INDEX idx_projects_user ON projects(user_id);
