import type { Item } from '../../types/instrument';
import type { useTTS } from '../../hooks/useTTS';
import { ItemShell } from './ItemShell';

interface Props {
  item: Item;
  nummer: number;
  gesamt: number;
  value: string[];
  onChange: (v: string[]) => void;
  tts: ReturnType<typeof useTTS>;
}

export function FreiItem({ item, nummer, gesamt, value, onChange, tts }: Props) {
  const max = item.max_eintraege ?? 1;
  const slots = Array.from({ length: max }, (_, i) => value[i] ?? '');

  function update(index: number, text: string) {
    const next = [...slots];
    next[index] = text;
    onChange(next.filter((_, i) => i <= index || next[i] !== ''));
  }

  return (
    <ItemShell item={item} nummer={nummer} gesamt={gesamt} tts={tts}>
      <div className="flex flex-col gap-4">
        {slots.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            {max > 1 && (
              <span className="text-gray-400 text-sm w-5 shrink-0">{i + 1}.</span>
            )}
            <textarea
              rows={2}
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder="Hier schreiben …"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg resize-none
                focus:outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>
        ))}
      </div>
    </ItemShell>
  );
}
