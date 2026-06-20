import type { Projekt } from '../types/instrument';

export const MOCK_PROJEKTE: Projekt[] = [
  { id: 'proj-001', name: '7×7×7 – Kunst/Raum/Wochen', aktiv: true, traeger: 'Jederkann e.V.' },
  { id: 'proj-002', name: 'Klangreise Erfurt',          aktiv: true, traeger: 'VSBI e.V.' },
  { id: 'proj-003', name: 'Theater der Dinge',           aktiv: true, traeger: 'Jederkann e.V.' },
  { id: 'proj-004', name: 'Farben & Formen (abgeschl.)', aktiv: false, traeger: 'Jederkann e.V.' },
];
