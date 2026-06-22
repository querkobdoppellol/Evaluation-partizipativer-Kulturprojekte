import { useEffect, useState } from 'react';
import {
  fetchStatistik,
  fetchAntworten,
  fetchAntwortenDetail,
  type AntwortenMeta,
  type AntwortenDetail,
  type Statistik,
} from '../../api/adminAntworten';

function rolleLabel(rolle: string | null) {
  if (rolle === 'leitung')       return '🎯 Leitung';
  if (rolle === 'unterstuetzung') return '🤝 Unterstützung';
  if (rolle === 'teilnehmer')    return '🙋 Teilnehmer*in';
  return rolle ?? '—';
}

function instrumentLabel(instrument: string) {
  if (instrument === 'B')   return 'B (Teilnehmer*in)';
  if (instrument === 'B-E') return 'B-E (Einschätzung)';
  if (instrument === 'C')   return 'C (Leitungs-Reflexion)';
  return instrument;
}

function kbLabel(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

export function AdminAntworten() {
  const [statistik, setStatistik] = useState<Statistik[]>([]);
  const [antworten, setAntworten] = useState<AntwortenMeta[]>([]);
  const [detail, setDetail]       = useState<AntwortenDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([fetchStatistik(), fetchAntworten()])
      .then(([stat, ant]) => { setStatistik(stat); setAntworten(ant); })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(id: string) {
    try {
      setDetail(await fetchAntwortenDetail(id));
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  if (loading) return <p className="text-gray-400 text-center py-10">Lade Einreichungen …</p>;
  if (error)   return <p className="text-red-500 py-4">{error}</p>;

  if (detail) {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => setDetail(null)}
          className="self-start text-sm text-blue-600 hover:underline"
        >
          ← Zurück zur Liste
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <span className="text-gray-500">Projekt</span>
            <span className="font-medium">{detail.projekt_name}</span>
            <span className="text-gray-500">Instrument</span>
            <span>{instrumentLabel(detail.instrument)}</span>
            <span className="text-gray-500">Rolle</span>
            <span>{rolleLabel(detail.rolle)}</span>
            <span className="text-gray-500">Zeitpunkt</span>
            <span className="capitalize">{detail.zeitpunkt}</span>
            <span className="text-gray-500">Eingereicht</span>
            <span>{detail.submitted_at}</span>
            <span className="text-gray-500">ID</span>
            <span className="font-mono text-xs text-gray-400 break-all">{detail.id}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Antworten</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(detail.antworten).map(([key, val]) => {
              if (key === 'frei_malschreib') return null; // Canvas-PNG weglassen
              const isDrawing = typeof val === 'string' && val.startsWith('data:image');
              return (
                <div key={key} className="grid grid-cols-[1fr_2fr] gap-2 text-sm border-b border-gray-100 pb-2">
                  <span className="font-mono text-xs text-gray-400 self-start pt-0.5">{key}</span>
                  {isDrawing ? (
                    <img src={val as string} alt="Zeichnung" className="max-h-32 rounded-lg border border-gray-200" />
                  ) : (
                    <span className="text-gray-800 break-words">
                      {Array.isArray(val)
                        ? (val as unknown[]).join(', ')
                        : String(val ?? '—')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Statistik */}
      {statistik.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Übersicht</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Projekt</th>
                  <th className="pb-2 font-medium">Instrument</th>
                  <th className="pb-2 font-medium">Rolle</th>
                  <th className="pb-2 font-medium">Zeitpunkt</th>
                  <th className="pb-2 font-medium text-right">Anzahl</th>
                </tr>
              </thead>
              <tbody>
                {statistik.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2">{row.projekt}</td>
                    <td className="py-2 text-xs">{instrumentLabel(row.instrument)}</td>
                    <td className="py-2">{rolleLabel(row.rolle)}</td>
                    <td className="py-2 capitalize">{row.zeitpunkt}</td>
                    <td className="py-2 text-right font-bold text-blue-600">{row.anzahl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Alle Einreichungen ({antworten.length})
        </h2>
        {antworten.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Einreichungen.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {antworten.map((a) => (
              <button
                key={a.id}
                onClick={() => openDetail(a.id)}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl
                  border border-gray-100 hover:border-blue-200 hover:bg-blue-50
                  text-left transition-all group"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-gray-900 truncate">{a.projekt_name}</span>
                  <span className="text-xs text-gray-400">
                    {instrumentLabel(a.instrument)} · {rolleLabel(a.rolle)} · {a.zeitpunkt}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-xs text-gray-400">{a.submitted_at.slice(0, 16)}</span>
                  <span className="text-xs text-gray-300">{kbLabel(a.antworten_bytes)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
