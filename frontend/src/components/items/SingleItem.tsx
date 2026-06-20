import type { Item } from '../../types/instrument';
import type { useTTS } from '../../hooks/useTTS';
import { ItemShell } from './ItemShell';

interface Props {
  item: Item;
  optionen: string[];
  nummer: number;
  gesamt: number;
  value: string | undefined;
  onChange: (v: string) => void;
  tts: ReturnType<typeof useTTS>;
}

export function SingleItem({ item, optionen, nummer, gesamt, value, onChange, tts }: Props) {
  const optionenText = optionen.join(', ');

  return (
    <ItemShell item={item} nummer={nummer} gesamt={gesamt} tts={tts} optionenText={optionenText}>
      <div className="flex flex-col gap-3">
        {optionen.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-lg transition-all
              ${value === opt
                ? 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-300'
                : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </ItemShell>
  );
}
