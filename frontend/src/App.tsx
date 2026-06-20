import { useEffect, useState } from 'react';
import type { AppPhase, Answers, Projekt } from './types/instrument';
import type { Instrument } from './types/instrument';
import instrumentData from './data/bogen_b.instrument.json';
import { MetaFlow } from './components/MetaFlow';
import { BogenRenderer } from './components/BogenRenderer';
import { AdminPage } from './components/admin/AdminPage';
import { fetchAktiveProjekte } from './api/projekte';
import { submitAntworten, buildPayload } from './api/antworten';

const instrument = instrumentData as unknown as Instrument;

type MetaStep = 'projekt' | 'zeitpunkt' | 'consent';

// Simple path-based routing: /admin → AdminPage, everything else → form flow
const IS_ADMIN = window.location.pathname.startsWith('/admin');

export default function App() {
  if (IS_ADMIN) return <AdminPage />;

  return <FormFlow />;
}

function FormFlow() {
  const [phase, setPhase]       = useState<AppPhase>('meta_projekt');
  const [metaStep, setMetaStep] = useState<MetaStep>('projekt');
  const [projektId, setProjektId] = useState<string | undefined>();
  const [zeitpunkt, setZeitpunkt] = useState<'pre' | 'post' | undefined>();

  // Live project list from backend
  const [projekte, setProjekte]         = useState<Projekt[]>([]);
  const [projekteLoading, setProjekteLoading] = useState(true);
  const [projekteError, setProjekteError]     = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitId, setSubmitId]       = useState<string | undefined>();

  useEffect(() => {
    fetchAktiveProjekte()
      .then((list) => { setProjekte(list); setProjekteLoading(false); })
      .catch((err: unknown) => {
        setProjekteError(String(err));
        setProjekteLoading(false);
      });
  }, []);

  async function handleAbgeben(answers: Answers, scanData: Record<string, boolean>) {
    if (!projektId || !zeitpunkt) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = buildPayload(projektId, zeitpunkt, answers, scanData);
      const result  = await submitAntworten(payload);
      setSubmitId(result.id);
      setPhase('done');
    } catch (err: unknown) {
      setSubmitError(`Speichern fehlgeschlagen: ${String(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleMetaWeiter() {
    if (metaStep === 'projekt')   setMetaStep('zeitpunkt');
    else if (metaStep === 'zeitpunkt') setMetaStep('consent');
    else setPhase('form');
  }

  function handleNeuStart() {
    setPhase('meta_projekt');
    setMetaStep('projekt');
    setProjektId(undefined);
    setZeitpunkt(undefined);
    setSubmitId(undefined);
    setSubmitError('');
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 px-6">
        <span className="text-8xl">🎉</span>
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Danke für deine Antworten!
        </h1>
        <p className="text-lg text-gray-500 text-center max-w-sm">
          Alles wurde gespeichert.
        </p>
        {submitId && (
          <p className="text-xs text-gray-300 font-mono">ID: {submitId}</p>
        )}
        <button
          onClick={handleNeuStart}
          className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-lg font-bold
            hover:bg-blue-700 transition-all"
        >
          Neuer Fragebogen
        </button>
      </div>
    );
  }

  // ── Absende-Feedback (Fehler) ──────────────────────────────────────────────
  if (submitError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6">
        <span className="text-6xl">⚠️</span>
        <p className="text-red-600 text-lg font-semibold text-center">{submitError}</p>
        <button
          onClick={() => setSubmitError('')}
          className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Zurück
        </button>
      </div>
    );
  }

  // ── Sende-Overlay ──────────────────────────────────────────────────────────
  if (submitting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500">Wird gespeichert …</p>
      </div>
    );
  }

  // ── Form-Flow ──────────────────────────────────────────────────────────────
  if (phase === 'form' && zeitpunkt) {
    return (
      <BogenRenderer
        instrument={instrument}
        zeitpunkt={zeitpunkt}
        onAbgeben={handleAbgeben}
      />
    );
  }

  return (
    <MetaFlow
      step={metaStep}
      projekte={projekte}
      projekteLoading={projekteLoading}
      projekteError={projekteError}
      projektId={projektId}
      zeitpunkt={zeitpunkt}
      onProjekt={setProjektId}
      onZeitpunkt={setZeitpunkt}
      onConsent={() => {}}
      onWeiter={handleMetaWeiter}
    />
  );
}
