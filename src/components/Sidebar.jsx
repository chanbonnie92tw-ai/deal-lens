import { MATURITY_STAGES, PRESETS, fmtNumber } from '../lib/model.js'

function Slider({ label, value, min, max, step, onChange, display }) {
  const pct = ((value - min) / (max - min)) * 100
  const track = `linear-gradient(to right, #22e39a 0%, #22e39a ${pct}%, #1c2b33 ${pct}%, #1c2b33 100%)`

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[12px] text-muted">{label}</span>
        <span className="font-mono text-[13px] font-medium text-ink">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: track }}
        aria-label={label}
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-dim">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="border-b border-line px-5 py-4">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{title}</div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

export default function Sidebar({ inputs, ranges, activeId, onChange, onPreset }) {
  const unit = inputs.unit

  return (
    <aside className="flex w-[340px] shrink-0 flex-col overflow-y-auto border-r border-line bg-panel">
      <div className="border-b border-line px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Screen a company
        </div>
        <div className="mt-1 text-[11px] leading-relaxed text-dim">
          Pick a profile, then drag to re-underwrite live.
        </div>
      </div>

      <div className="border-b border-line px-5 py-4">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          Deal profiles
        </div>
        <div className="grid grid-cols-1 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPreset(p)}
              className={`group flex items-center justify-between rounded border px-3 py-2 text-left transition-colors ${
                activeId === p.id
                  ? 'border-green/60 bg-[#0f1a20]'
                  : 'border-line bg-panel2 hover:border-green/40 hover:bg-[#0f1a20]'
              }`}
            >
              <span className="text-[12px] text-ink">{p.name}</span>
              <span
                className={`font-mono text-[9px] uppercase tracking-wider ${
                  activeId === p.id ? 'text-green' : 'text-dim group-hover:text-green'
                }`}
              >
                {p.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Section title="Unit economics">
        <Slider
          label="Annual output"
          value={inputs.outputPerYear}
          min={ranges.output[0]}
          max={ranges.output[1]}
          step={ranges.output[2]}
          onChange={onChange('outputPerYear')}
          display={`${fmtNumber(inputs.outputPerYear)} ${unit}`}
        />
        <Slider
          label="Capex"
          value={inputs.capexM}
          min={ranges.capex[0]}
          max={ranges.capex[1]}
          step={ranges.capex[2]}
          onChange={onChange('capexM')}
          display={`$${inputs.capexM.toFixed(1)}M`}
        />
        <Slider
          label="Opex"
          value={inputs.opexPct}
          min={0.5}
          max={6}
          step={0.1}
          onChange={onChange('opexPct')}
          display={`${inputs.opexPct.toFixed(1)}% capex/yr`}
        />
        <Slider
          label="Selling price"
          value={inputs.price}
          min={ranges.price[0]}
          max={ranges.price[1]}
          step={ranges.price[2]}
          onChange={onChange('price')}
          display={`$${inputs.price.toLocaleString()}/${unit}`}
        />
        <Slider
          label="Incumbent cost"
          value={inputs.incumbentCost}
          min={ranges.incumbentCost[0]}
          max={ranges.incumbentCost[1]}
          step={ranges.incumbentCost[2]}
          onChange={onChange('incumbentCost')}
          display={`$${inputs.incumbentCost.toLocaleString()}/${unit}`}
        />
      </Section>

      <Section title="Carbon">
        <Slider
          label="Incumbent intensity"
          value={inputs.incumbentIntensity}
          min={ranges.incInt[0]}
          max={ranges.incInt[1]}
          step={ranges.incInt[2]}
          onChange={onChange('incumbentIntensity')}
          display={`${fmtNumber(inputs.incumbentIntensity)} kg/${unit}`}
        />
        <Slider
          label="Technology intensity"
          value={inputs.techIntensity}
          min={ranges.techInt[0]}
          max={ranges.techInt[1]}
          step={ranges.techInt[2]}
          onChange={onChange('techIntensity')}
          display={`${fmtNumber(inputs.techIntensity)} kg/${unit}`}
        />
      </Section>

      <Section title="Thesis fit">
        <Slider
          label="APAC market nexus"
          value={inputs.apacScore}
          min={0}
          max={100}
          step={5}
          onChange={onChange('apacScore')}
          display={`${inputs.apacScore}/100`}
        />
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-[12px] text-muted">Commercial maturity</span>
          </div>
          <select
            value={inputs.maturity}
            onChange={(e) => onChange('maturity')(e.target.value)}
            className="w-full rounded border border-line bg-panel2 px-2 py-1.5 font-mono text-[12px] text-ink outline-none focus:border-green/60"
          >
            {MATURITY_STAGES.map((s) => (
              <option key={s.id} value={s.id} className="bg-panel2">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Finance">
        <Slider
          label="Hurdle rate (NPV discount)"
          value={inputs.hurdle}
          min={4}
          max={15}
          step={0.5}
          onChange={onChange('hurdle')}
          display={`${inputs.hurdle}%`}
        />
      </Section>

      <div className="px-5 py-4 text-[10px] leading-relaxed text-dim">
        Illustrative sample data for demonstration only — not investment advice. Profiles are
        representative of Audacy's thematic areas, not real portfolio companies.
      </div>
    </aside>
  )
}
