import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dir, '..', 'data');
const DB_FILE  = join(DATA_DIR, 'wertapp.db');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(DB_FILE);

// ── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
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
    instrument     TEXT NOT NULL,
    zeitpunkt      TEXT NOT NULL CHECK(zeitpunkt IN ('pre','post')),
    token_hash     TEXT,
    schema_version TEXT NOT NULL,
    antworten      TEXT NOT NULL,
    submitted_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_antworten_projekt
    ON antworten(projekt_id, zeitpunkt);
`);

// ── Seed (einmalig beim ersten Start) ─────────────────────────────────────────

const count = (db.prepare('SELECT COUNT(*) AS n FROM projekte').get() as { n: number }).n;
if (count === 0) {
  const ins = db.prepare(
    'INSERT INTO projekte (id, name, aktiv, traeger) VALUES (?, ?, ?, ?)'
  );
  ins.run(randomUUID(), '7×7×7 – Kunst/Raum/Wochen', 1, 'Jederkann e.V.');
  ins.run(randomUUID(), 'Klangreise Erfurt',           1, 'VSBI e.V.');
  ins.run(randomUUID(), 'Theater der Dinge',           1, 'Jederkann e.V.');
  console.log('[db] Seed: 3 Demo-Projekte angelegt.');
}

console.log(`[db] SQLite: ${DB_FILE}`);
