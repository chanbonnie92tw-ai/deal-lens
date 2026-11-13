import { fmtCO2, fmtUnit } from '../lib/model.js'

function CompareBar({ label, value, max, color, unit, muted }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
        <span className={muted ? 'text-muted' : 'text-ink'}>{label}</span>
        <span className={muted ? 'text-muted' : 'text-ink'}>{fmtUnit(value, unit)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-sm bg-[#101a20]">
        <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function CostCarbon({ deal, unit }) {
  const max = Math.max(deal.lcoxTech, deal.lcoxIncumbent) * 1.12
  const adv = deal.costAdvantage
  const mac = deal.mac
  const macTxt =
    mac == null
      ? 'n/a'
      : mac < 0
        ? `-$${Math.abs(mac).toFixed(0)}/tCO₂`
        : `$${mac.toFixed(0)}/tCO₂`
  const macTone = mac == null ? 'text-muted' : mac < 0 ? 'text-green' : 'text-amber'
  const macNote =
    mac == null
      ? 'No carbon benefit modelled.'
      : mac < 0
        ? 'Negative-cost abatement — cheaper AND cleaner than the incumbent.'
        : 'Costs money to abate — needs a carbon price or policy support above this level.'

  return (
    <div className="flex flex-col rounded-md border border-line bg-panel p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
        Cost & carbon
      </div>

      <div className="mt-4 space-y-3">
        <CompareBar
          label="This tech (LCOX)"
          value={deal.lcoxTech}
          max={max}
          color="#22e39a"
          unit={unit}
        />
        <CompareBar
          label="Incumbent (delivered cost)"
          value={deal.lcoxIncumbent}
          max={max}
          color="#3a5158"
          unit={unit}
          muted
        />
      </div>

      <div className="mt-4 flex items-center justify-between rounded border border-line bg-panel2 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Cost advantage
        </span>
        <span
          className={`font-mono text-base font-bold ${
            adv == null ? 'text-muted' : adv >= 0 ? 'text-green' : 'text-red'
          }`}
        >
          {adv == null ? 'n/a' : `${adv >= 0 ? '+' : ''}${(adv * 100).toFixed(0)}%`}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded border border-line bg-panel2 px-3 py-2">
          <div className="font-mono text-[9px] uppercase tracking-wider text-dim">CO₂ avoided / yr</div>
          <div className="mt-1 font-mono text-[13px] text-ink">{fmtCO2(deal.annualTCO2)}</div>
        </div>
        <div className="rounded border border-line bg-panel2 px-3 py-2">
          <div className="font-mono text-[9px] uppercase tracking-wider text-dim">Lifetime CO₂</div>
          <div className="mt-1 font-mono text-[13px] text-ink">{fmtCO2(deal.totalTCO2)}</div>
        </div>
      </div>

      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
            Abatement cost
          </span>
          <span className={`font-mono text-lg font-bold ${macTone}`}>{macTxt}</span>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-muted">{macNote}</p>
      </div>
    </div>
  )
}
