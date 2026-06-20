import { useEffect, useState } from 'react';
import type { ProjektAdmin, ProjektCreateBody } from '../../api/projekte';
import { fetchAllProjekte, createProjekt, patchProjekt, deleteProjekt } from '../../api/projekte';

const EMPTY_FORM: ProjektCreateBody = { name: '', traeger: '' };

export function AdminProjekte() {
  const [projekte, setProjekte]   = useState<ProjektAdmin[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [editId, setEditId]         = useState<string | null>(null);
  const [editName, setEditName]     = useState('');
  const [editTraeger, setEditTraeger] = useState('');
  const [form, setForm]           = useState<ProjektCreateBody>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [busy, setBusy]           = useState(false);

  async function load() {
    setLoading(true);
    try {
      setProjekte(await fetchAllProjekte());
      setError('');
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleToggleAktiv(p: ProjektAdmin) {
    setBusy(true);
    try {
      const updated = await patchProjekt(p.id, { aktiv: !p.aktiv });
      setProjekte((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (e) { setError(String(e)); }
    setBusy(false);
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    setBusy(true);
    try {
      const updated = await patchProjekt(id, {
        name: editName.trim(),
        traeger: editTraeger.trim() || undefined,
      });
      setProjekte((prev) => prev.map((x) => (x.id === id ? updated : x)));
      setEditId(null);
    } catch (e) { setError(String(e)); }
    setBusy(false);
  }

  async function handleDelete(p: ProjektAdmin) {
    if (!confirm(`Projekt „${p.name}" wirklich löschen?`)) return;
    setBusy(true);
    try {
      await deleteProjekt(p.id);
      setProjekte((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) { setError(String(e)); }
    setBusy(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name ist Pflicht'); return; }
    setBusy(true);
    setFormError('');
    try {
      const created = await createProjekt({ ...form, name: form.name.trim() });
      setProjekte((prev) => [...prev, created]);
      setForm(EMPTY_FORM);
    } catch (e) { setFormError(String(e)); }
    setBusy(false);
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Lade Projekte …</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Projektliste */}
      <div className="flex flex-col gap-3">
        {projekte.length === 0 && (
          <p className="text-gray-400 text-sm">Noch keine Projekte.</p>
        )}
        {projekte.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4"
          >
            {/* Name (inline edit) */}
            <div className="flex-1 min-w-0">
              {editId === p.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setEditId(null); }}
                    placeholder="Projektname *"
                    className="border-2 border-blue-400 rounded-lg px-3 py-1.5 text-base
                      focus:outline-none"
                  />
                  <input
                    value={editTraeger}
                    onChange={(e) => setEditTraeger(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setEditId(null); }}
                    placeholder="Träger (optional)"
                    className="border-2 border-blue-200 rounded-lg px-3 py-1.5 text-base
                      focus:outline-none focus:border-blue-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleSaveEdit(p.id)}
                      disabled={busy}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium
                        hover:bg-blue-700 disabled:opacity-40"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  {p.traeger && (
                    <span className="ml-2 text-sm text-gray-400">{p.traeger}</span>
                  )}
                </div>
              )}
            </div>

            {/* Aktiv-Toggle */}
            <button
              onClick={() => void handleToggleAktiv(p)}
              disabled={busy}
              title={p.aktiv ? 'Deaktivieren' : 'Aktivieren'}
              className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all
                ${p.aktiv
                  ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
            >
              {p.aktiv ? '✅ Aktiv' : '⏸ Inaktiv'}
            </button>

            {/* Edit */}
            {editId !== p.id && (
              <button
                onClick={() => { setEditId(p.id); setEditName(p.name); setEditTraeger(p.traeger ?? ''); }}
                className="text-gray-400 hover:text-blue-600 transition-colors text-lg"
                title="Umbenennen"
              >
                ✏️
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => void handleDelete(p)}
              disabled={busy}
              className="text-gray-300 hover:text-red-500 transition-colors text-lg"
              title="Löschen"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Neues Projekt */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Neues Projekt anlegen</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Projektname *"
            className="border-2 border-gray-200 rounded-xl px-4 py-3 text-base
              focus:outline-none focus:border-blue-400 bg-white"
          />
          <input
            type="text"
            value={form.traeger}
            onChange={(e) => setForm((f) => ({ ...f, traeger: e.target.value }))}
            placeholder="Träger (optional)"
            className="border-2 border-gray-200 rounded-xl px-4 py-3 text-base
              focus:outline-none focus:border-blue-400 bg-white"
          />
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <button
            type="submit"
            disabled={busy || !form.name.trim()}
            className="py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700
              disabled:opacity-40 transition-all"
          >
            + Anlegen
          </button>
        </form>
      </div>
    </div>
  );
}
