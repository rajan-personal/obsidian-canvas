CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS nodes (
  id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note',
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  width REAL,
  data TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (id, project_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS edges (
  id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  type TEXT DEFAULT 'floating',
  data TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (id, project_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
