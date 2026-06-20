import type { Item } from '../../types/instrument';
import type { useTTS } from '../../hooks/useTTS';
import { ItemShell } from './ItemShell';

interface Props {
  item: Item;
  optionen: string[];
  nummer: number;
  gesamt: number;
  value: string[];
  onChange: (v: string[]) => void;
  tts: ReturnType<typeof useTTS>;
}

export function MultiItem({ item, optionen, nummer, gesamt, value, onChange, tts }: Props) {
  const optionenText = optionen.join(', ');

  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }

  return (
    <ItemShell item={item} nummer={nummer} gesamt={gesamt} tts={tts} optionenText={optionenText}>
      <p className="text-sm text-gray-500 -mt-2">Mehrere Antworten möglich</p>
      <div className="flex flex-col gap-3">
        {optionen.map((opt) => {
          const checked = value.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              aria-pressed={checked}
              className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-lg transition-all flex items-center gap-3
                ${checked
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}
            >
              <span className="text-xl">{checked ? '✅' : '⬜'}</span>
              {opt}
            </button>
          );
        })}
      </div>
    </ItemShell>
  );
}
