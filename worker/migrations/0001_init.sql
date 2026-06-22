-- WertApp – Initiales Datenbankschema
-- Ausführen: wrangler d1 migrations apply wertapp [--local | --remote]

CREATE TABLE IF NOT EXISTS projekte (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  aktiv         INTEGER NOT NULL DEFAULT 1,
  traeger       TEXT,
  steckbrief_id TEXT,
  start         TEXT,
  ende          TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS antworten (
  id             TEXT PRIMARY KEY,
  projekt_id     TEXT NOT NULL REFERENCES projekte(id),
  instrument     TEXT NOT NULL DEFAULT 'B',
  rolle          TEXT,
  zeitpunkt      TEXT NOT NULL CHECK (zeitpunkt IN ('pre', 'post')),
  token_hash     TEXT,
  schema_version TEXT NOT NULL,
  antworten      TEXT NOT NULL,
  submitted_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_antworten_projekt
  ON antworten (projekt_id, zeitpunkt);

CREATE INDEX IF NOT EXISTS idx_antworten_instrument
  ON antworten (instrument, rolle);
