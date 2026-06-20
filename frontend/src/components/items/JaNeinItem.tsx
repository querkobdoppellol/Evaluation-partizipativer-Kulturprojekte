import type { Item } from '../../types/instrument';
import type { useTTS } from '../../hooks/useTTS';
import { ItemShell } from './ItemShell';

interface Props {
  item: Item;
  nummer: number;
  gesamt: number;
  value: 'ja' | 'nein' | undefined;
  onChange: (v: 'ja' | 'nein') => void;
  tts: ReturnType<typeof useTTS>;
}

export function JaNeinItem({ item, nummer, gesamt, value, onChange, tts }: Props) {
  return (
    <ItemShell item={item} nummer={nummer} gesamt={gesamt} tts={tts} optionenText="Ja, Nein">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onChange('ja')}
          aria-pressed={value === 'ja'}
          className={`flex flex-col items-center gap-2 py-8 rounded-2xl border-2 text-xl font-bold transition-all
            ${value === 'ja'
              ? 'bg-green-500 text-white border-green-600 ring-4 ring-green-700'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-300'}`}
        >
          <span className="text-5xl">✅</span>
          Ja
        </button>
        <button
          onClick={() => onChange('nein')}
          aria-pressed={value === 'nein'}
          className={`flex flex-col items-center gap-2 py-8 rounded-2xl border-2 text-xl font-bold transition-all
            ${value === 'nein'
              ? 'bg-red-500 text-white border-red-600 ring-4 ring-red-700'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-red-50 hover:border-red-300'}`}
        >
          <span className="text-5xl">❌</span>
          Nein
        </button>
      </div>
    </ItemShell>
  );
}
