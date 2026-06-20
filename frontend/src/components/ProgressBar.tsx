interface Props {
  aktuell: number;
  gesamt: number;
}

export function ProgressBar({ aktuell, gesamt }: Props) {
  const pct = gesamt > 0 ? Math.round((aktuell / gesamt) * 100) : 0;
  return (
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={aktuell}
        aria-valuemin={0}
        aria-valuemax={gesamt}
        aria-label={`Frage ${aktuell} von ${gesamt}`}
      />
    </div>
  );
}
