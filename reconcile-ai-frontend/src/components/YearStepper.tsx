

export function YearStepper({ year, onChange }: { year: number; onChange: (y: number) => void }) {
  const years = Array.from({ length: 11 }, (_, i) => year - 5 + i); // current ±5

  return (
    <select
      value={year}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-sm border border-border rounded-lg px-3 py-1.5"
    >
      {years.map((y) => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}