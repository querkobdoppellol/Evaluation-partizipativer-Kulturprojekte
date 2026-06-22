-- Optionale Demo-Projekte – nur für lokale Entwicklung / Testinstanz
-- Ausführen: npm run db:seed:local  oder  npm run db:seed:remote

INSERT OR IGNORE INTO projekte (id, name, aktiv, traeger) VALUES
  ('00000000-0001-0000-0000-000000000001', '7×7×7 – Kunst/Raum/Wochen', 1, 'Jederkann e.V.'),
  ('00000000-0002-0000-0000-000000000002', 'Klangreise Erfurt',           1, 'VSBI e.V.'),
  ('00000000-0003-0000-0000-000000000003', 'Theater der Dinge',           1, 'Jederkann e.V.');
