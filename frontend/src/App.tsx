import { useEffect, useState } from 'react';
import type { AppPhase, Answers, Projekt } from './types/instrument';
import type { Instrument } from './types/instrument';
import bogenBData from './data/bogen_b.instrument.json';
import bogenCData from './data/bogen_c.instrument.json';
import { MetaFlow } from './components/MetaFlow';
import type { Rolle } from './components/MetaFlow';
import { BogenRenderer } from './components/BogenRenderer';
import { AdminPage } from './components/admin/AdminPage';
import { fetchAktiveProjekte } from './api/projekte';
import { submitAntworten, buildPayload } from './api/antworten';

const BOGEN_B = bogenBData as unknown as Instrument;
const BOGEN_C = bogenCData as unknown as Instrument;

const IS_ADMIN = window.location.pathname.startsWith('/admin');

export default function App() {
  if (IS_ADMIN) return <AdminPage />;
  return <FormFlow />;
}

type MetaStep = 'rolle' | 'projekt' | 'zeitpunkt' | 'consent';

function FormFlow() {
  const [phase, setPhase]       = useState<AppPhase>('meta_projekt');
  const [metaStep, setMetaStep] = useState<MetaStep>('rolle');
  const [rolle, setRolle]       = useState<Rolle | undefined>();
  const [projektId, setProjektId] = useState<string | undefined>();
  const [zeitpunkt, setZeitpunkt] = useState<'pre' | 'post' | undefined>();

  const [projekte, setProjekte]               = useState<Projekt[]>([]);
  const [projekteLoading, setProjekteLoading] = useState(true);
  const [projekteError, setProjekteError]     = useState('');

  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitId, setSubmitId]       = useState<string | undefined>();

  useEffect(() => {
    fetchAktiveProjekte()
      .then((list) => { setProjekte(list); setProjekteLoading(false); })
      .catch((err: unknown) => { setProjekteError(String(err)); setProjekteLoading(false); });
  }, []);

  // Wähle das Instrument basierend auf der Rolle
  const instrument = rolle === 'leitung' ? BOGEN_C : BOGEN_B;

  async function handleAbgeben(answers: Answers, scanData: Record<string, boolean>) {
    if (!projektId || !zeitpunkt || !rolle) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = buildPayload(
        projektId,
        zeitpunkt,
        answers,
        scanData,
        instrument.schema_version,
        instrument.instrument,
      );
      const result = await submitAntworten(payload);
      setSubmitId(result.id);
      setPhase('done');
    } catch (err: unknown) {
      setSubmitError(`Speichern fehlgeschlagen: ${String(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleMetaWeiter() {
    if (metaStep === 'rolle') {
      setMetaStep('projekt');
    } else if (metaStep === 'projekt') {
      // Leitung → immer "post", Zeitpunkt-Screen überspringen
      if (rolle === 'leitung') {
        setZeitpunkt('post');
        setMetaStep('consent');
      } else {
        setMetaStep('zeitpunkt');
      }
    } else if (metaStep === 'zeitpunkt') {
      setMetaStep('consent');
    } else {
      setPhase('form');
    }
  }

  function handleNeuStart() {
    setPhase('meta_projekt');
    setMetaStep('rolle');
    setRolle(undefined);
    setProjektId(undefined);
    setZeitpunkt(undefined);
    setSubmitId(undefined);
    setSubmitError('');
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const istLeitung = rolle === 'leitung';
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 px-6">
        <span className="text-8xl">🎉</span>
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          {istLeitung ? 'Danke für deine Reflexion!' : 'Danke für deine Antworten!'}
        </h1>
        <p className="text-lg text-gray-500 text-center max-w-sm">Alles wurde gespeichert.</p>
        {submitId && <p className="text-xs text-gray-300 font-mono">ID: {submitId}</p>}
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

  if (submitError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6">
        <span className="text-6xl">⚠️</span>
        <p className="text-red-600 text-lg font-semibold text-center">{submitError}</p>
        <button onClick={() => setSubmitError('')} className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700">
          Zurück
        </button>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500">Wird gespeichert …</p>
      </div>
    );
  }

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
      rolle={rolle}
      projekte={projekte}
      projekteLoading={projekteLoading}
      projekteError={projekteError}
      projektId={projektId}
      zeitpunkt={zeitpunkt}
      onRolle={setRolle}
      onProjekt={setProjektId}
      onZeitpunkt={setZeitpunkt}
      onConsent={() => {}}
      onWeiter={handleMetaWeiter}
    />
  );
}
