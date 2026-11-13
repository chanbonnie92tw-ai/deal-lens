import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ScoreRadar from './components/ScoreRadar.jsx'
import CostCarbon from './components/CostCarbon.jsx'
import DealCashflow from './components/DealCashflow.jsx'
import KpiCard from './components/KpiCard.jsx'
import { DEFAULT_PRESET, PRESETS, computeDeal, fmtMoney, fmtUnit } from './lib/model.js'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return (
    <span className="text-muted">
      {hh}:{mm}
      <span className="text-dim">:{ss}</span> <span className="text-dim">LOCAL</span>
    </span>
  )
}

function Ticker({ deal, unit }) {
  const adv = deal.costAdvantage
  const mac = deal.mac
  const items = [
    {
      label: 'LCOX',
      value: fmtUnit(deal.lcoxTech, unit),
      tone: 'text-ink',
    },
    {
      label: 'ADVANTAGE',
      value: adv == null ? 'n/a' : `${adv >= 0 ? '+' : ''}${(adv * 100).toFixed(0)}%`,
      tone: adv == null ? 'text-muted' : adv >= 0 ? 'text-green' : 'text-red',
    },
    {
      label: 'IRR',
      value: deal.irrPct == null ? '—' : `${deal.irrPct.toFixed(1)}%`,
      tone: deal.irrPct != null && deal.irrPct >= deal.hurdle ? 'text-green' : 'text-red',
    },
    {
      label: 'ABATEMENT',
      value:
        mac == null
          ? 'n/a'
          : mac < 0
            ? `-$${Math.abs(mac).toFixed(0)}/t`
            : `$${mac.toFixed(0)}/t`,
      tone: mac == null ? 'text-muted' : mac < 0 ? 'text-green' : 'text-amber',
    },
    {
      label: 'SCORE',
      value: `${deal.overall}/100`,
      tone:
        deal.verdictTone === 'green'
          ? 'text-green'
          : deal.verdictTone === 'amber'
            ? 'text-amber'
            : 'text-red',
    },
  ]

  return (
    <div className="flex h-8 items-center gap-6 overflow-x-auto border-t border-line bg-[#080d11] px-5 font-mono text-[11px]">
      {items.map((it, i) => (
        <div key={it.label} className="flex shrink-0 items-center gap-2">
          {i > 0 && <span className="mr-4 text-line">|</span>}
          <span className="text-dim">{it.label}</span>
          <span className={it.tone}>{it.value}</span>
        </div>
      ))}
      <div className="ml-auto flex shrink-0 items-center gap-2 pl-6">
        <span className="text-dim">VERDICT</span>
        <span
          className={
            deal.verdictTone === 'green'
              ? 'text-green'
              : deal.verdictTone === 'amber'
                ? 'text-amber'
                : 'text-red'
          }
        >
          {deal.verdict}
        </span>
      </div>
    </div>
  )
}

function VerdictChip({ deal }) {
  const border =
    deal.verdictTone === 'green'
      ? 'border-green/40 bg-green/5'
      : deal.verdictTone === 'amber'
        ? 'border-amber/40 bg-amber/5'
        : 'border-red/40 bg-red/5'
  const text =
    deal.verdictTone === 'green'
      ? 'text-green glow-green'
      : deal.verdictTone === 'amber'
        ? 'text-amber'
        : 'text-red'

  return (
    <div className={`shrink-0 rounded-md border px-4 py-3 text-right ${border}`}>
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
        Thesis-fit verdict
      </div>
      <div className={`mt-1 font-mono text-lg font-bold ${text}`}>{deal.verdict}</div>
      <div className="mt-0.5 font-mono text-[10px] text-dim">
        Composite {deal.overall}/100
      </div>
    </div>
  )
}

export default function App() {
  const [state, setState] = useState(() => ({
    activeId: DEFAULT_PRESET.id,
    inputs: { ...DEFAULT_PRESET.values },
    ranges: DEFAULT_PRESET.ranges,
  }))

  const deal = useMemo(() => computeDeal(state.inputs), [state.inputs])
  const inputs = state.inputs
  const unit = inputs.unit
  const preset = PRESETS.find((p) => p.id === state.activeId) || DEFAULT_PRESET

  const onChange = (key) => (value) =>
    setState((s) => ({ ...s, inputs: { ...s.inputs, [key]: value } }))

  const onPreset = (p) =>
    setState({ activeId: p.id, inputs: { ...p.values }, ranges: p.ranges })

  const adv = deal.costAdvantage
  const mac = deal.mac
  const irrPct = deal.irrPct
  const paybackTxt =
    deal.payback == null ? `> ${deal.years} yr` : `${deal.payback.toFixed(1)} yr`
  const macKpi =
    mac == null ? 'n/a' : mac < 0 ? `-$${Math.abs(mac).toFixed(0)}` : `$${mac.toFixed(0)}`

  let read = ''
  if (adv != null) {
    const advTxt = `${Math.abs(adv * 100).toFixed(0)}%`
    read += `At ${fmtUnit(deal.lcoxTech, unit)} the technology is ${
      adv >= 0 ? `${advTxt} cheaper` : `${advTxt} more expensive`
    } than the ${fmtUnit(deal.lcoxIncumbent, unit)} incumbent. `
  }
  if (mac != null) {
    read +=
      mac < 0
        ? `It abates at a negative cost (-$${Math.abs(mac).toFixed(0)}/tCO₂), so decarbonising is cash-positive. `
        : `Abatement costs $${mac.toFixed(0)}/tCO₂, so uptake depends on carbon pricing or policy support. `
  }
  read += `At $${inputs.price.toLocaleString()}/${unit} it earns a ${
    irrPct == null ? '—' : `${irrPct.toFixed(1)}%`
  } project IRR and pays back in ${paybackTxt} — ${
    irrPct != null && irrPct >= inputs.hurdle ? 'clearing' : 'below'
  } the ${inputs.hurdle}% hurdle.`

  return (
    <div className="flex h-full flex-col bg-base">
      <header className="shrink-0 border-b border-line">
        <div className="flex h-12 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-sm bg-green shadow-[0_0_8px_#22e39a]" />
            <span className="font-mono text-sm font-bold tracking-[0.18em] text-ink">
              DEAL<span className="text-green">//</span>LENS
            </span>
            <span className="hidden text-[10px] font-mono uppercase tracking-[0.2em] text-muted md:inline">
              climate-tech unit economics · APAC thesis
            </span>
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px]">
            <Clock />
            <span className="flex items-center gap-1.5 text-green">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-green" />
              LIVE SCREEN
            </span>
          </div>
        </div>
        <Ticker deal={deal} unit={unit} />
      </header>

      <div className="flex min-h-0 flex-1">
        <Sidebar
          inputs={inputs}
          ranges={state.ranges}
          activeId={state.activeId}
          onChange={onChange}
          onPreset={onPreset}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] space-y-5 p-6">
            <section className="flex items-start justify-between gap-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-green">
                  {preset.sector}
                </div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                  {preset.name}
                </h1>
                <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
                  {inputs.label}. Screened against the incumbent it displaces on cost per unit,
                  carbon abatement and financeability. Sample test data — not a real company.
                </p>
              </div>
              <VerdictChip deal={deal} />
            </section>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                label="LCOX — this tech"
                value={fmtUnit(deal.lcoxTech, unit)}
                sub={`vs ${fmtUnit(deal.lcoxIncumbent, unit)} incumbent`}
                tone="ink"
                accent="cyan"
              />
              <KpiCard
                label="Cost advantage"
                value={adv == null ? 'n/a' : `${adv >= 0 ? '+' : ''}${(adv * 100).toFixed(0)}%`}
                sub={adv == null ? 'no incumbent cost' : adv >= 0 ? 'cheaper than incumbent' : 'above incumbent cost'}
                tone={adv == null ? 'ink' : adv >= 0 ? 'green' : 'red'}
                accent={adv == null ? 'ink' : adv >= 0 ? 'green' : 'red'}
              />
              <KpiCard
                label="Project IRR"
                value={irrPct == null ? '—' : `${irrPct.toFixed(1)}%`}
                sub={`Hurdle rate ${inputs.hurdle}%`}
                tone={irrPct != null && irrPct >= inputs.hurdle ? 'green' : 'red'}
                accent={irrPct != null && irrPct >= inputs.hurdle ? 'green' : 'red'}
              />
              <KpiCard
                label="Abatement cost"
                value={macKpi === 'n/a' ? 'n/a' : `${macKpi}/tCO₂`}
                sub={mac == null ? 'no carbon benefit' : mac < 0 ? 'paid to decarbonise' : 'cost per tonne'}
                tone={mac == null ? 'ink' : mac < 0 ? 'green' : 'amber'}
                accent={mac == null ? 'ink' : mac < 0 ? 'green' : 'amber'}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <ScoreRadar
                scores={deal.scores}
                overall={deal.overall}
                verdict={deal.verdict}
                verdictTone={deal.verdictTone}
              />
              <CostCarbon deal={deal} unit={unit} />
            </section>

            <section className="rounded-md border border-line bg-panel">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                  Project cash flow & payback
                </div>
                <div className="flex items-center gap-4 font-mono text-[10px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-green/80" />
                    Annual cash flow
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-[2px] w-4 bg-amber" />
                    Cumulative
                  </span>
                </div>
              </div>
              <div className="p-3">
                <DealCashflow rows={deal.rows} />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-line bg-panel p-4 md:col-span-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                  Diligence read
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/90">{read}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-muted">
                  Scorecard weights: cost vs incumbent 35% · path to profit 25% · APAC nexus 25% ·
                  commercial maturity 15%. Maps a deal onto the "proven tech at commercial
                  inflection, cost-competitive with fossil incumbents, APAC deployable" thesis.
                </p>
              </div>

              <div className="rounded-md border border-line bg-panel p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                  Assumption snapshot
                </div>
                <dl className="mt-2 space-y-1.5 font-mono text-[11px]">
                  {[
                    ['Total capex', fmtMoney(deal.capex)],
                    ['Annual opex', fmtMoney(deal.opex)],
                    ['Annual revenue', fmtMoney(deal.revenue)],
                    ['Margin / unit', fmtUnit(deal.marginPerUnit, unit)],
                    ['Lifetime', `${deal.years} yr`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <p className="pb-2 text-[10px] leading-relaxed text-dim">
              Illustrative sample data for demonstration only — not investment advice. Profiles are
              representative of Audacy's thematic areas (electrification & storage, sustainable
              transport, industrial decarbonisation), not real portfolio companies. Simplifications:
              constant annual output, flat opex, all-equity pre-tax economics, no policy credits or
              offtake structure.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
