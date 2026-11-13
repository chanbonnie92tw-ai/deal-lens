import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

export default function ScoreRadar({ scores, overall, verdict, verdictTone }) {
  const tone = {
    green: 'text-green',
    amber: 'text-amber',
    red: 'text-red',
  }[verdictTone]

  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">Thesis fit</div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] text-muted">SCORE</span>
          <span className={`font-mono text-lg font-bold ${tone}`}>{overall}</span>
          <span className="font-mono text-[10px] text-dim">/100</span>
        </div>
      </div>

      <div className="mt-1 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={scores} outerRadius="70%">
            <PolarGrid stroke="#16232b" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: '#6b838c', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="score"
              stroke="#22e39a"
              strokeWidth={2}
              fill="#22e39a"
              fillOpacity={0.22}
              dot={{ r: 2.5, fill: '#22e39a' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {scores.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-2 font-mono text-[10px]">
            <span className="text-muted">{s.axis}</span>
            <span className="text-ink">{s.score}</span>
          </div>
        ))}
      </div>

      <div className={`mt-3 border-t border-line pt-2 font-mono text-[11px] uppercase tracking-[0.18em] ${tone}`}>
        {verdict}
      </div>
    </div>
  )
}
