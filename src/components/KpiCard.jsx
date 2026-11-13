const TONES = {
  green: 'text-green',
  red: 'text-red',
  amber: 'text-amber',
  cyan: 'text-cyan',
  ink: 'text-ink',
}

export default function KpiCard({ label, value, sub, tone = 'ink', accent = 'green' }) {
  const accentBar = {
    green: 'bg-green',
    red: 'bg-red',
    amber: 'bg-amber',
    cyan: 'bg-cyan',
    ink: 'bg-dim',
  }[accent]

  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-panel p-4">
      <span className={`absolute inset-y-0 left-0 w-[2px] ${accentBar}`} />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          {label}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-dim" />
      </div>
      <div className={`mt-3 font-mono text-[28px] font-bold leading-none ${TONES[tone]}`}>
        {value}
      </div>
      {sub ? <div className="mt-2 text-[11px] text-muted">{sub}</div> : null}
    </div>
  )
}
