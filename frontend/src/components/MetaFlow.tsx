import type { Projekt } from '../types/instrument';
import { ProjektSelectItem } from './items/ProjektSelectItem';

export type Rolle = 'teilnehmer' | 'leitung';
type Step = 'rolle' | 'projekt' | 'zeitpunkt' | 'consent';

interface Props {
  step: Step;
  rolle: Rolle | undefined;
  projekte: Projekt[];
  projekteLoading?: boolean;
  projekteError?: string;
  projektId: string | undefined;
  zeitpunkt: 'pre' | 'post' | undefined;
  onRolle: (r: Rolle) => void;
  onProjekt: (id: string) => void;
  onZeitpunkt: (z: 'pre' | 'post') => void;
  onConsent: (ok: boolean) => void;
  onWeiter: () => void;
}

export function MetaFlow({
  step,
  rolle,
  projekte,
  projekteLoading = false,
  projekteError = '',
  projektId,
  zeitpunkt,
  onRolle,
  onProjekt,
  onZeitpunkt,
  onConsent,
  onWeiter,
}: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-blue-600 text-white px-6 py-4">
        <h1 className="text-xl font-bold">Befragung</h1>
      </header>

      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full flex flex-col gap-8">

        {/* ── Rollenwahl ─────────────────────────────────────────────── */}
        {step === 'rolle' && (
          <>
            <h2 className="text-2xl font-semibold text-gray-900">Wer bist du?</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => { onRolle('teilnehmer'); onWeiter(); }}
                aria-pressed={rolle === 'teilnehmer'}
                className="flex items-center gap-5 px-6 py-6 rounded-2xl border-2 text-left
                  transition-all bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <span className="text-5xl">🙋</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">Ich nehme teil</div>
                  <div className="text-sm text-gray-500 mt-1">Ich mache beim Projekt mit</div>
                </div>
              </button>
              <button
                onClick={() => { onRolle('leitung'); onWeiter(); }}
                aria-pressed={rolle === 'leitung'}
                className="flex items-center gap-5 px-6 py-6 rounded-2xl border-2 text-left
                  transition-all bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
              >
                <span className="text-5xl">🎯</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">Ich leite das Projekt</div>
                  <div className="text-sm text-gray-500 mt-1">Leitung, künstlerisches oder pädagogisches Team</div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── Projektauswahl ─────────────────────────────────────────── */}
        {step === 'projekt' && (
          <>
            {projekteLoading && (
              <p className="text-gray-400 text-center py-4">Lade Projekte …</p>
            )}
            {projekteError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                Projekte konnten nicht geladen werden: {projekteError}
              </div>
            )}
            {!projekteLoading && (
              <ProjektSelectItem
                projekte={projekte}
                value={projektId}
                onChange={onProjekt}
              />
            )}
            <button
              onClick={onWeiter}
              disabled={!projektId}
              className="mt-auto w-full py-5 rounded-2xl text-xl font-bold transition-all
                bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Weiter →
            </button>
          </>
        )}

        {/* ── Zeitpunkt (nur Teilnehmer*in) ──────────────────────────── */}
        {step === 'zeitpunkt' && (
          <>
            <h2 className="text-2xl font-semibold text-gray-900">
              Wann füllst du den Fragebogen aus?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onZeitpunkt('pre')}
                aria-pressed={zeitpunkt === 'pre'}
                className={`flex flex-col items-center gap-3 py-10 rounded-2xl border-2 text-xl font-bold transition-all
                  ${zeitpunkt === 'pre'
                    ? 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-300'
                    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}
              >
                <span className="text-5xl">🌅</span>
                Am Anfang
              </button>
              <button
                onClick={() => onZeitpunkt('post')}
                aria-pressed={zeitpunkt === 'post'}
                className={`flex flex-col items-center gap-3 py-10 rounded-2xl border-2 text-xl font-bold transition-all
                  ${zeitpunkt === 'post'
                    ? 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-300'
                    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}
              >
                <span className="text-5xl">🌆</span>
                Am Ende
              </button>
            </div>
            <button
              onClick={onWeiter}
              disabled={!zeitpunkt}
              className="mt-auto w-full py-5 rounded-2xl text-xl font-bold transition-all
                bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Weiter →
            </button>
          </>
        )}

        {/* ── Einwilligung ───────────────────────────────────────────── */}
        {step === 'consent' && (
          <>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="text-7xl">🔒</span>
              <h2 className="text-2xl font-semibold text-gray-900">
                {rolle === 'leitung'
                  ? 'Deine Reflexion wird anonym gespeichert.'
                  : 'Wir merken uns deine Antworten ohne Namen.'}
              </h2>
              <p className="text-gray-500 text-lg">
                {rolle === 'leitung'
                  ? 'Kein Name, kein Kontakt — nur deine Einschätzungen zum Projekt.'
                  : 'Niemand weiß, wer was gesagt hat. Du kannst jederzeit aufhören.'}
              </p>
              <p className="text-lg font-medium text-gray-700">Ist das ok für dich?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { onConsent(true); onWeiter(); }}
                className="flex flex-col items-center gap-2 py-8 rounded-2xl border-2 text-xl font-bold
                  bg-green-500 text-white border-green-600 hover:bg-green-600 transition-all"
              >
                <span className="text-4xl">👍</span>
                Ja, ok!
              </button>
              <button
                onClick={() => { onConsent(false); onWeiter(); }}
                className="flex flex-col items-center gap-2 py-8 rounded-2xl border-2 text-xl font-bold
                  bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-all"
              >
                <span className="text-4xl">➡️</span>
                Weiter so
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
