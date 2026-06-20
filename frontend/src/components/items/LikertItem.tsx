import type { ScaleStufe } from '../../types/instrument';
import type { useTTS } from '../../hooks/useTTS';
import { ItemShell } from './ItemShell';
import type { Item } from '../../types/instrument';

const COLOR_CLASSES: Record<string, string> = {
  gruen:  'bg-green-500  hover:bg-green-600  text-white   border-green-600',
  gelb:   'bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-500',
  orange: 'bg-orange-400 hover:bg-orange-500 text-white   border-orange-500',
  rot:    'bg-red-500    hover:bg-red-600    text-white   border-red-600',
};

const SELECTED_RING: Record<string, string> = {
  gruen:  'ring-4 ring-green-700',
  gelb:   'ring-4 ring-yellow-600',
  orange: 'ring-4 ring-orange-600',
  rot:    'ring-4 ring-red-700',
};

interface Props {
  item: Item;
  stufen: ScaleStufe[];
  nummer: number;
  gesamt: number;
  value: number | undefined;
  onChange: (v: number) => void;
  tts: ReturnType<typeof useTTS>;
}

export function LikertItem({ item, stufen, nummer, gesamt, value, onChange, tts }: Props) {
  const optionenText = stufen.map((s) => `${s.wert}: ${s.text}`).join(', ');

  return (
    <ItemShell item={item} nummer={nummer} gesamt={gesamt} tts={tts} optionenText={optionenText}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stufen.map((stufe) => {
          const isSelected = value === stufe.wert;
          return (
            <button
              key={stufe.wert}
              onClick={() => onChange(stufe.wert)}
              aria-pressed={isSelected}
              className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2
                transition-all min-h-[100px] text-center
                ${COLOR_CLASSES[stufe.farbe]}
                ${isSelected ? SELECTED_RING[stufe.farbe] : ''}
              `}
            >
              <span className="text-4xl">{stufe.symbol}</span>
              <span className="text-sm font-medium leading-tight">{stufe.text}</span>
            </button>
          );
        })}
      </div>
    </ItemShell>
  );
}
