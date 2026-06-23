import type { Projekt } from '../types/instrument';
import { ProjektSelectItem } from './items/ProjektSelectItem';

export type Rolle = 'teilnehmer' | 'leitung' | 'unterstuetzung';
type Step = 'rolle' | 'projekt' | 'consent';

interface Props {
  step: Step;
  rolle: Rolle | undefined;
  projekte: Projekt[];
  projekteLoading?: boolean;
  projekteError?: string;
  projektId: string | undefined;
  onRolleWeiter: (r: Rolle) => void;
  onProjekt: (id: string) => void;
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
  onRolleWeiter,
  onProjekt,
  onConsent,
  onWeiter,
}: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-blue-600 text-white px-6 py-4">
        <h1 className="text-xl font-bold">Befragung</h1>
      </header>

      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full flex flex-col gap-8">

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

        {/* ── Rollenwahl ─────────────────────────────────────────────── */}
        {step === 'rolle' && (
          <>
            <h2 className="text-2xl font-semibold text-gray-900">Wer bist du?</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => onRolleWeiter('teilnehmer')}
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
                onClick={() => onRolleWeiter('leitung')}
                aria-pressed={rolle === 'leitung'}
                className="flex items-center gap-5 px-6 py-6 rounded-2xl border-2 text-left
                  transition-all bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
              >
                <span className="text-5xl">🎯</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">Ich leite das Projekt</div>
                  <div className="text-sm text-gray-500 mt-1">Projektleitung, künstlerische oder pädagogische Leitung</div>
                </div>
              </button>
              <button
                onClick={() => onRolleWeiter('unterstuetzung')}
                aria-pressed={rolle === 'unterstuetzung'}
                className="flex items-center gap-5 px-6 py-6 rounded-2xl border-2 text-left
                  transition-all bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
              >
                <span className="text-5xl">🤝</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">Ich unterstütze die Leitung</div>
                  <div className="text-sm text-gray-500 mt-1">Assistenz, Co-Leitung, Begleitung</div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ── Einwilligung ───────────────────────────────────────────── */}
        {step === 'consent' && (
          <>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="text-7xl">🔒</span>
              <h2 className="text-2xl font-semibold text-gray-900">
                {(rolle === 'leitung' || rolle === 'unterstuetzung')
                  ? 'Deine Reflexion wird anonym gespeichert.'
                  : 'Wir merken uns deine Antworten ohne Namen.'}
              </h2>
              <p className="text-gray-500 text-lg">
                {(rolle === 'leitung' || rolle === 'unterstuetzung')
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
                onClick={() => onConsent(false)}
                className="flex flex-col items-center gap-2 py-8 rounded-2xl border-2 text-xl font-bold
                  bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-all"
              >
                <span className="text-4xl">❌</span>
                Nein
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
