import { useEffect, useState } from 'react';
import type { AppPhase, Answers, Projekt } from './types/instrument';
import type { Instrument } from './types/instrument';
import bogenBData   from './data/bogen_b.instrument.json';
import bogenCData   from './data/bogen_c.instrument.json';
import bogenBEData  from './data/bogen_b_einschaetzung.instrument.json';
import { MetaFlow } from './components/MetaFlow';
import type { Rolle } from './components/MetaFlow';
import { BogenRenderer } from './components/BogenRenderer';
import { AdminPage } from './components/admin/AdminPage';
import { fetchAktiveProjekte } from './api/projekte';
import { submitAntworten, buildPayload } from './api/antworten';

const BOGEN_B  = bogenBData  as unknown as Instrument;
const BOGEN_C  = bogenCData  as unknown as Instrument;
const BOGEN_BE = bogenBEData as unknown as Instrument;

const IS_ADMIN = window.location.pathname.startsWith('/admin');

export default function App() {
  if (IS_ADMIN) return <AdminPage />;
  return <FormFlow />;
}

type MetaStep   = 'rolle' | 'projekt' | 'zeitpunkt' | 'consent';
type LeitSchritt = 'C' | 'B-E-intro' | 'B-E'; // zweistufiger Flow für Leitung

function FormFlow() {
  const [phase, setPhase]         = useState<AppPhase>('meta_projekt');
  const [metaStep, setMetaStep]   = useState<MetaStep>('rolle');
  const [rolle, setRolle]         = useState<Rolle | undefined>();
  const [projektId, setProjektId] = useState<string | undefined>();
  const [zeitpunkt, setZeitpunkt] = useState<'pre' | 'post' | undefined>();
  const [leitSchritt, setLeitSchritt] = useState<LeitSchritt>('C');

  const [projekte, setProjekte]               = useState<Projekt[]>([]);
  const [projekteLoading, setProjekteLoading] = useState(true);
  const [projekteError, setProjekteError]     = useState('');

  const [consentDeclined, setConsentDeclined] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitId, setSubmitId]       = useState<string | undefined>();

  useEffect(() => {
    fetchAktiveProjekte()
      .then((list) => { setProjekte(list); setProjekteLoading(false); })
      .catch((err: unknown) => { setProjekteError(String(err)); setProjekteLoading(false); });
  }, []);

  const istLeitungsRolle = rolle === 'leitung' || rolle === 'unterstuetzung';

  // Aktuelles Instrument je nach Rolle und Schritt
  function aktivesInstrument(): Instrument {
    if (!istLeitungsRolle)        return BOGEN_B;
    if (leitSchritt === 'B-E')    return BOGEN_BE;
    return BOGEN_C;
  }

  async function handleAbgeben(answers: Answers, scanData: Record<string, boolean>) {
    if (!projektId || !zeitpunkt || !rolle) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const instr = aktivesInstrument();
      const payload = buildPayload(
        projektId, zeitpunkt, answers, scanData,
        instr.schema_version, instr.instrument, rolle,
      );
      const result = await submitAntworten(payload);

      // Leitung: nach Bogen C → Übergang zu B-E
      if (istLeitungsRolle && leitSchritt === 'C') {
        setLeitSchritt('B-E-intro');
        setSubmitting(false);
        return;
      }

      // Sonst: fertig
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
      if (istLeitungsRolle) {
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
    setLeitSchritt('C');
    setSubmitId(undefined);
    setSubmitError('');
    setConsentDeclined(false);
  }

  // ── Einwilligung verweigert ────────────────────────────────────────────────
  if (consentDeclined) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 px-6">
        <span className="text-8xl">🙏</span>
        <h1 className="text-3xl font-bold text-gray-900 text-center">Danke für deine Zeit!</h1>
        <p className="text-lg text-gray-500 text-center max-w-sm">
          Kein Problem. Du musst nichts ausfüllen.
        </p>
        <button onClick={handleNeuStart}
          className="px-8 py-4 rounded-2xl bg-gray-100 text-gray-700 text-lg font-semibold hover:bg-gray-200 transition-all">
          Zurück zum Anfang
        </button>
      </div>
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 px-6">
        <span className="text-8xl">🎉</span>
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          {istLeitungsRolle ? 'Danke für deine Einschätzungen!' : 'Danke für deine Antworten!'}
        </h1>
        <p className="text-lg text-gray-500 text-center max-w-sm">Alles wurde gespeichert.</p>
        {submitId && <p className="text-xs text-gray-300 font-mono">ID: {submitId}</p>}
        <button onClick={handleNeuStart}
          className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition-all">
          Neuer Fragebogen
        </button>
      </div>
    );
  }

  // ── Übergang zwischen Bogen C und B-E ─────────────────────────────────────
  if (phase === 'form' && istLeitungsRolle && leitSchritt === 'B-E-intro') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="bg-purple-600 text-white px-6 py-4">
          <p className="text-sm opacity-80">Teil 1 von 2 abgeschlossen</p>
          <h1 className="text-xl font-bold">Jetzt: Einschätzung der Teilnehmer*innen</h1>
        </header>
        <main className="flex-1 px-6 py-10 max-w-xl mx-auto w-full flex flex-col gap-8 justify-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="text-7xl">🔄</span>
            <h2 className="text-2xl font-semibold text-gray-900">Teil 2 von 2</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-6 py-5 text-left">
              <p className="text-gray-700 text-lg leading-relaxed">
                Im Folgenden wollen wir einschätzen, wie das Projekt{' '}
                <strong>für die Teilnehmer*innen</strong> war.
              </p>
              <p className="text-gray-600 mt-3 leading-relaxed">
                Gib bei den Fragen an, was du glaubst, wie die Teilnehmer*innen
                am Projekt die Fragen beantworten würden.
              </p>
            </div>
            <p className="text-sm text-gray-400">
              Die Fragen sind dieselben wie im Teilnehmer*innen-Bogen —
              nur deine Perspektive hat sich geändert.
            </p>
          </div>
          <button
            onClick={() => setLeitSchritt('B-E')}
            className="w-full py-5 rounded-2xl bg-purple-600 text-white text-xl font-bold
              hover:bg-purple-700 transition-all"
          >
            Weiter zu Teil 2 →
          </button>
        </main>
      </div>
    );
  }

  // ── Fehler ─────────────────────────────────────────────────────────────────
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

  // ── Speichern-Spinner ──────────────────────────────────────────────────────
  if (submitting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500">Wird gespeichert …</p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  if (phase === 'form' && zeitpunkt) {
    return (
      <BogenRenderer
        instrument={aktivesInstrument()}
        zeitpunkt={zeitpunkt}
        onAbgeben={handleAbgeben}
      />
    );
  }

  // ── Meta-Flow ──────────────────────────────────────────────────────────────
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
      onConsent={(ok) => { if (!ok) setConsentDeclined(true); }}
      onWeiter={handleMetaWeiter}
    />
  );
}
