import type { Projekt } from '../../types/instrument';

interface Props {
  projekte: Projekt[];
  value: string | undefined;
  onChange: (id: string) => void;
}

export function ProjektSelectItem({ projekte, value, onChange }: Props) {
  // API already returns only active projects; filter only for mock-data fallback
  const visible = projekte.filter((p) => p.aktiv !== false);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-gray-900">Um welches Projekt geht es?</h2>
      <div className="flex flex-col gap-3">
        {visible.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            aria-pressed={value === p.id}
            className={`w-full text-left px-5 py-5 rounded-2xl border-2 transition-all
              ${value === p.id
                ? 'bg-blue-600 text-white border-blue-700 ring-4 ring-blue-300'
                : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}
          >
            <div className="text-xl font-semibold">{p.name}</div>
            {p.traeger && (
              <div className={`text-sm mt-1 ${value === p.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {p.traeger}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
