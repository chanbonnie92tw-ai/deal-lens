import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmtAxis, fmtCO2, fmtMoney } from '../lib/model.js'

function TerminalTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded border border-line bg-[#0a1014]/95 px-3 py-2 font-mono text-[11px] shadow-xl backdrop-blur">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-muted">Year {label}</div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted">Annual cash flow</span>
        <span className={point.annual >= 0 ? 'text-green' : 'text-red'}>
          {fmtMoney(point.annual)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted">Cumulative</span>
        <span className={point.cumulative >= 0 ? 'text-green' : 'text-amber'}>
          {fmtMoney(point.cumulative)}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-6 border-t border-line pt-1">
        <span className="text-muted">CO₂ avoided</span>
        <span className="text-ink">{fmtCO2(point.co2)}</span>
      </div>
    </div>
  )
}

export default function DealCashflow({ rows }) {
  const data = rows.slice(1)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="dealBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22e39a" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#22e39a" stopOpacity={0.35} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="2 4" stroke="#16232b" vertical={false} />
          <XAxis
            dataKey="year"
            tickFormatter={(y) => `Y${y}`}
            tick={{ fill: '#6b838c', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1c2b33' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="cf"
            tickFormatter={(v) => '$' + fmtAxis(v)}
            tick={{ fill: '#6b838c', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <YAxis
            yAxisId="cum"
            orientation="right"
            tickFormatter={(v) => '$' + fmtAxis(v)}
            tick={{ fill: '#6b838c', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />

          <ReferenceLine yAxisId="cf" y={0} stroke="#3a5158" strokeDasharray="2 3" />
          <Tooltip content={<TerminalTooltip />} cursor={{ fill: 'rgba(34,227,154,0.06)' }} />

          <Bar yAxisId="cf" dataKey="annual" radius={[2, 2, 0, 0]} maxBarSize={46}>
            {data.map((d) => (
              <Cell
                key={d.year}
                fill={d.annual >= 0 ? 'url(#dealBar)' : '#ff5470'}
                fillOpacity={d.annual >= 0 ? 1 : 0.85}
              />
            ))}
          </Bar>

          <Line
            yAxisId="cum"
            type="monotone"
            dataKey="cumulative"
            stroke="#ffb020"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#ffb020', stroke: '#060a0d', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
