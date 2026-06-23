import { useMemo, useState } from 'react';
import type { Instrument, Item, Answers, AnswerValue, MalSchreibAnswer } from '../types/instrument';
import { useTTS } from '../hooks/useTTS';
import { ProgressBar } from './ProgressBar';
import { LikertItem } from './items/LikertItem';
import { JaNeinItem } from './items/JaNeinItem';
import { SingleItem } from './items/SingleItem';
import { MultiItem } from './items/MultiItem';
import { FreiItem } from './items/FreiItem';
import { MalSchreibItem } from './items/MalSchreibItem';

interface Props {
  instrument: Instrument;
  zeitpunkt: 'pre' | 'post';
  onAbgeben: (answers: Answers, scanData: Record<string, boolean>) => void;
}

// Returns the ordered visible items for the current answers
function getVisibleItems(formItems: Item[], answers: Answers): Item[] {
  return formItems.filter((item) => {
    if (!item.sichtbar_wenn) return true;
    const gateAnswer = answers[item.sichtbar_wenn.item];
    return gateAnswer === item.sichtbar_wenn.gleich;
  });
}

export function BogenRenderer({ instrument, zeitpunkt, onAbgeben }: Props) {
  const tts = useTTS();
  const [answers, setAnswers] = useState<Answers>({});
  const [scanData, setScanData] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [freiEckeBenutzt, setFreiEckeBenutzt]       = useState(false);
  const [freiPngDownloaded, setFreiPngDownloaded]   = useState(false);

  // Build the item pool for this zeitpunkt
  const allItems: Item[] = useMemo(() => {
    const ids = instrument.forms[zeitpunkt];
    const byId = Object.fromEntries(instrument.items.map((i) => [i.id, i]));
    return ids.map((id) => byId[id]).filter(Boolean);
  }, [instrument, zeitpunkt]);

  // Exclude scan items from the navigable sequence
  const navigableItems = useMemo(
    () => allItems.filter((i) => i.typ !== 'scan'),
    [allItems],
  );

  // Compute visible items based on current answers
  const visibleItems = useMemo(
    () => getVisibleItems(navigableItems, answers),
    [navigableItems, answers],
  );

  const gesamt = visibleItems.length;
  const item = visibleItems[currentIndex] as Item | undefined;

  function setAnswer(id: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function goNext() {
    // Recompute visible after potential gate change
    const nextVisible = getVisibleItems(navigableItems, answers);
    if (currentIndex < nextVisible.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Done – merge scan data and submit
      const finalScan = {
        ...scanData,
        frei_mehrfarbig: ((answers['frei_text'] as MalSchreibAnswer | undefined)?.farben_genutzt ?? 0) > 1,
        frei_ecke: freiEckeBenutzt,
        frei_png_download: freiPngDownloaded,
      };
      onAbgeben(answers, finalScan);
    }
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleFreiEcke() {
    setFreiEckeBenutzt(true);
    setScanData((s) => ({ ...s, frei_ecke: true }));
  }

  if (!item) return null;

  const optionen = item.liste
    ? (instrument.lists[item.liste] ?? [])
    : (item.optionen ?? []);

  const answerValue = answers[item.id];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-xs">
          <ProgressBar aktuell={currentIndex + 1} gesamt={gesamt} />
        </div>
        {tts.supported && (
          <button
            onClick={tts.toggle}
            title={tts.enabled ? 'Vorlesen aus' : 'Vorlesen an'}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors
              ${tts.enabled ? 'bg-white text-blue-600' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
          >
            🔊
          </button>
        )}
      </header>

      {/* Item */}
      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
        {item.typ === 'likert4' && (
          <LikertItem
            item={item}
            stufen={instrument.scale.stufen}
            nummer={currentIndex + 1}
            gesamt={gesamt}
            value={answerValue as number | undefined}
            onChange={(v) => setAnswer(item.id, v as AnswerValue)}
            tts={tts}
          />
        )}

        {item.typ === 'ja_nein' && (
          <JaNeinItem
            item={item}
            nummer={currentIndex + 1}
            gesamt={gesamt}
            value={answerValue as 'ja' | 'nein' | undefined}
            onChange={(v) => setAnswer(item.id, v)}
            tts={tts}
          />
        )}

        {item.typ === 'single' && (
          <SingleItem
            item={item}
            optionen={optionen}
            nummer={currentIndex + 1}
            gesamt={gesamt}
            value={answerValue as string | undefined}
            onChange={(v) => setAnswer(item.id, v)}
            tts={tts}
          />
        )}

        {item.typ === 'multi' && (
          <MultiItem
            item={item}
            optionen={optionen}
            nummer={currentIndex + 1}
            gesamt={gesamt}
            value={(answerValue as string[] | undefined) ?? []}
            onChange={(v) => setAnswer(item.id, v)}
            tts={tts}
          />
        )}

        {item.typ === 'frei' && (
          <FreiItem
            item={item}
            nummer={currentIndex + 1}
            gesamt={gesamt}
            value={(answerValue as string[] | undefined) ?? []}
            onChange={(v) => setAnswer(item.id, v)}
            tts={tts}
          />
        )}

        {item.typ === 'mal_schreib' && (
          <>
            <MalSchreibItem
              item={item}
              nummer={currentIndex + 1}
              gesamt={gesamt}
              value={(answerValue as MalSchreibAnswer | undefined) ?? { farben_genutzt: 1 }}
              onChange={(v) => setAnswer(item.id, v)}
              onDownload={() => setFreiPngDownloaded(true)}
              tts={tts}
            />
            {/* frei_ecke: passive tap element shown alongside mal_schreib */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleFreiEcke}
                className={`text-xs px-3 py-1 rounded-lg transition-colors
                  ${freiEckeBenutzt ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400 hover:bg-purple-50'}`}
              >
                {freiEckeBenutzt ? '✨ Tipp!' : 'Tipp hier, wenn du magst'}
              </button>
            </div>
          </>
        )}
      </main>

      {/* Navigation */}
      <footer className="px-6 py-5 border-t border-gray-100 flex flex-col gap-2 max-w-xl mx-auto w-full">
        <div className="flex gap-3">
          {currentIndex > 0 && (
            <button
              onClick={goBack}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600
                text-lg font-medium hover:bg-gray-50 transition-all"
            >
              ← Zurück
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 py-4 rounded-2xl bg-blue-600 text-white text-lg font-bold
              hover:bg-blue-700 transition-all"
          >
            {currentIndex < gesamt - 1 ? 'Weiter →' : 'Abschicken ✓'}
          </button>
        </div>
        {currentIndex < gesamt - 1 && (
          <button
            onClick={goNext}
            className="text-sm text-gray-400 hover:text-gray-600 py-1 transition-colors"
          >
            Überspringen
          </button>
        )}
      </footer>
    </div>
  );
}
