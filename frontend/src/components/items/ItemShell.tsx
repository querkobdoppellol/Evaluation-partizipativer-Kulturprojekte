import type { ReactNode } from 'react';
import type { Item } from '../../types/instrument';
import { useTTS } from '../../hooks/useTTS';

interface Props {
  item: Item;
  nummer: number;
  gesamt: number;
  tts: ReturnType<typeof useTTS>;
  children: ReactNode;
  optionenText?: string;
}

export function ItemShell({ item, nummer, gesamt, tts, children, optionenText }: Props) {
  const itemText = item.text ?? '';

  function handleSpeak() {
    const toRead = optionenText
      ? `${itemText}. Mögliche Antworten: ${optionenText}`
      : itemText;
    tts.speak(toRead);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <span className="text-sm text-gray-400 mt-1 shrink-0">
          {nummer}/{gesamt}
        </span>
        <h2 className="text-2xl font-semibold leading-snug text-gray-900 flex-1">
          {itemText}
        </h2>
        {tts.supported && (
          <button
            onClick={handleSpeak}
            aria-label="Vorlesen"
            title="Vorlesen"
            className={`shrink-0 mt-1 w-10 h-10 rounded-full flex items-center justify-center transition-colors
              ${tts.speaking ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-100'}`}
          >
            🔊
          </button>
        )}
      </div>

      {/* Item-specific content */}
      {children}

      {/* Optional hint */}
      {item.hinweis && (
        <p className="text-sm text-gray-400 italic">{item.hinweis}</p>
      )}
    </div>
  );
}
