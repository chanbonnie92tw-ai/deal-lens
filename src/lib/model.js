// ---------------------------------------------------------------------------
// Deal Lens — climate-tech unit-economics screener.
//
// Given a technology and the fossil/incumbent solution it displaces, the model
// works out whether the technology is (a) cheaper per functional unit, (b) a
// real carbon-abatement story, and (c) financeable — then maps all of it onto an
// APAC climate-tech investment thesis.
//
// All figures are illustrative sample data for demonstration only.
// ---------------------------------------------------------------------------

export const MATURITY_STAGES = [
  { id: 'lab', label: 'Lab', score: 20 },
  { id: 'pilot', label: 'Pilot', score: 40 },
  { id: 'first', label: 'First commercial', score: 60 },
  { id: 'scaling', label: 'Scaling', score: 80 },
  { id: 'proven', label: 'Proven at scale', score: 100 },
]

export const PRESETS = [
  {
    id: 'ci-bess',
    name: 'C&I BESS · diesel offset',
    tag: 'Electrification & storage',
    sector: 'Energy Efficiency & Electrification',
    values: {
      label: 'C&I battery storage replacing a diesel genset',
      unit: 'MWh',
      outputPerYear: 5000,
      capexM: 8,
      opexPct: 2,
      price: 220,
      incumbentCost: 320,
      incumbentIntensity: 700,
      techIntensity: 60,
      lifetime: 10,
      hurdle: 8,
      apacScore: 85,
      maturity: 'scaling',
    },
    ranges: {
      output: [1000, 20000, 250],
      capex: [2, 20, 0.5],
      price: [80, 400, 5],
      incumbentCost: [100, 500, 5],
      incInt: [400, 1000, 10],
      techInt: [0, 400, 10],
    },
  },
  {
    id: 'second-life',
    name: 'Second-life BESS',
    tag: 'Circular / storage',
    sector: 'Energy Efficiency & Electrification',
    values: {
      label: 'Repurposed EV batteries as stationary storage',
      unit: 'MWh',
      outputPerYear: 12000,
      capexM: 5,
      opexPct: 2.5,
      price: 150,
      incumbentCost: 320,
      incumbentIntensity: 700,
      techIntensity: 40,
      lifetime: 8,
      hurdle: 8,
      apacScore: 70,
      maturity: 'first',
    },
    ranges: {
      output: [2000, 40000, 500],
      capex: [1, 20, 0.5],
      price: [60, 400, 5],
      incumbentCost: [100, 500, 5],
      incInt: [400, 1000, 10],
      techInt: [0, 400, 10],
    },
  },
  {
    id: 'hvac',
    name: 'HVAC efficiency retrofit',
    tag: 'Industrial efficiency',
    sector: 'Energy Efficiency & Electrification',
    values: {
      label: 'High-efficiency distributed cooling retrofit',
      unit: 'MWh cooling',
      outputPerYear: 8000,
      capexM: 2.5,
      opexPct: 1.5,
      price: 90,
      incumbentCost: 140,
      incumbentIntensity: 500,
      techIntensity: 150,
      lifetime: 15,
      hurdle: 8,
      apacScore: 75,
      maturity: 'scaling',
    },
    ranges: {
      output: [1000, 30000, 250],
      capex: [0.5, 10, 0.5],
      price: [20, 200, 5],
      incumbentCost: [40, 300, 5],
      incInt: [200, 800, 10],
      techInt: [0, 400, 10],
    },
  },
  {
    id: 'saf',
    name: 'SAF blending terminal',
    tag: 'Sustainable transport',
    sector: 'Sustainable Transport',
    values: {
      label: 'Modular sustainable aviation fuel blending',
      unit: 't SAF',
      outputPerYear: 20000,
      capexM: 120,
      opexPct: 3,
      price: 1450,
      incumbentCost: 2100,
      incumbentIntensity: 3200,
      techIntensity: 800,
      lifetime: 15,
      hurdle: 8,
      apacScore: 80,
      maturity: 'first',
    },
    ranges: {
      output: [1000, 60000, 1000],
      capex: [60, 180, 5],
      price: [800, 3000, 50],
      incumbentCost: [1000, 3500, 50],
      incInt: [2000, 4000, 50],
      techInt: [0, 1500, 50],
    },
  },
  {
    id: 'ccs',
    name: 'Membrane carbon capture',
    tag: 'Industrial decarbonisation',
    sector: 'Industrial Decarbonisation',
    values: {
      label: 'Membrane post-combustion CO₂ capture',
      unit: 't CO₂',
      outputPerYear: 200000,
      capexM: 40,
      opexPct: 4,
      price: 85,
      incumbentCost: 20,
      incumbentIntensity: 1000,
      techIntensity: 0,
      lifetime: 15,
      hurdle: 8,
      apacScore: 65,
      maturity: 'pilot',
    },
    ranges: {
      output: [10000, 500000, 5000],
      capex: [5, 120, 1],
      price: [20, 200, 5],
      incumbentCost: [0, 50, 5],
      incInt: [800, 1200, 50],
      techInt: [0, 100, 5],
    },
  },
]

export const DEFAULT_PRESET = PRESETS[0]

// ---- helpers --------------------------------------------------------------

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

function maturityScoreOf(id) {
  const stage = MATURITY_STAGES.find((s) => s.id === id)
  return stage ? stage.score : 0
}

function computeIRR(cashflows) {
  const npvAt = (r) =>
    cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0)

  let lo = -0.9999
  let hi = 5
  let fLo = npvAt(lo)
  const fHi = npvAt(hi)
  if (fLo === 0) return lo
  if (fLo * fHi > 0) return null

  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2
    const fMid = npvAt(mid)
    if (Math.abs(fMid) < 1e-6) return mid
    if (fLo * fMid < 0) {
      hi = mid
    } else {
      lo = mid
      fLo = fMid
    }
  }
  return (lo + hi) / 2
}

function computePayback(rows) {
  for (let i = 1; i < rows.length; i += 1) {
    const prev = rows[i - 1]
    const cur = rows[i]
    if (cur.cumulative >= 0) {
      const gap = cur.cumulative - prev.cumulative
      if (gap === 0) return cur.year
      return prev.year + -prev.cumulative / gap
    }
  }
  return null
}

// ---- main model -----------------------------------------------------------

export function computeDeal(input) {
  const capex = input.capexM * 1e6
  const opex = capex * (input.opexPct / 100)
  const output = input.outputPerYear
  const disc = input.hurdle / 100
  const years = input.lifetime

  // Levelised cost of the technology, per functional unit.
  let pvOutput = 0
  let pvOpex = 0
  for (let y = 1; y <= years; y += 1) {
    const d = Math.pow(1 + disc, y)
    pvOutput += output / d
    pvOpex += opex / d
  }
  const lcoxTech = pvOutput > 0 ? (capex + pvOpex) / pvOutput : 0
  const lcoxIncumbent = input.incumbentCost
  const costAdvantage =
    lcoxIncumbent > 0 ? (lcoxIncumbent - lcoxTech) / lcoxIncumbent : null

  // Carbon.
  const carbonPerUnit =
    Math.max(0, input.incumbentIntensity - input.techIntensity) / 1000 // tCO2 / unit
  const annualTCO2 = carbonPerUnit * output
  const totalTCO2 = annualTCO2 * years
  const mac = carbonPerUnit > 0 ? (lcoxTech - lcoxIncumbent) / carbonPerUnit : null

  // Project cash flows (constant annual output).
  const revenue = output * input.price
  const net = revenue - opex
  const rows = [{ year: 0, annual: -capex, cumulative: -capex, revenue: 0, co2: 0 }]
  let cum = -capex
  let npv = -capex
  for (let y = 1; y <= years; y += 1) {
    cum += net
    npv += net / Math.pow(1 + disc, y)
    rows.push({ year: y, annual: net, cumulative: cum, revenue, co2: annualTCO2 })
  }
  const irr = computeIRR(rows.map((r) => r.annual))
  const irrPct = irr == null ? null : irr * 100
  const payback = computePayback(rows)

  // Thesis-fit scorecard (0-100 per axis).
  const costScore =
    costAdvantage == null ? 50 : clamp(50 + costAdvantage * 100 * 2, 0, 100)
  const profitScore =
    irrPct == null ? 0 : clamp(50 + (irrPct - input.hurdle) * 4, 0, 100)
  const apacScore = clamp(input.apacScore, 0, 100)
  const maturityScore = maturityScoreOf(input.maturity)

  const overall = Math.round(
    0.35 * costScore + 0.25 * profitScore + 0.25 * apacScore + 0.15 * maturityScore,
  )
  const verdict = overall >= 70 ? 'STRONG FIT' : overall >= 50 ? 'WATCHLIST' : 'PASS'
  const verdictTone = overall >= 70 ? 'green' : overall >= 50 ? 'amber' : 'red'

  const scores = [
    { axis: 'Cost vs incumbent', key: 'cost', score: Math.round(costScore) },
    { axis: 'Path to profit', key: 'profit', score: Math.round(profitScore) },
    { axis: 'APAC nexus', key: 'apac', score: Math.round(apacScore) },
    { axis: 'Commercial maturity', key: 'maturity', score: Math.round(maturityScore) },
  ]

  return {
    rows,
    capex,
    opex,
    output,
    years,
    lcoxTech,
    lcoxIncumbent,
    costAdvantage,
    carbonPerUnit,
    annualTCO2,
    totalTCO2,
    mac,
    revenue,
    net,
    npv,
    irr,
    irrPct,
    payback,
    marginPerUnit: input.price - lcoxTech,
    scores,
    costScore,
    profitScore,
    apacScore,
    maturityScore,
    overall,
    verdict,
    verdictTone,
    hurdle: input.hurdle,
  }
}

// ---- formatters -----------------------------------------------------------

export function fmtAxis(v) {
  const abs = Math.abs(v)
  if (abs >= 1e9) return (v / 1e9).toFixed(1) + 'B'
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return (v / 1e3).toFixed(0) + 'K'
  return String(Math.round(v))
}

export function fmtMoney(v) {
  const sign = v < 0 ? '-' : ''
  return sign + '$' + fmtAxis(Math.abs(v))
}

export function fmtUnit(v, unit) {
  if (v == null || Number.isNaN(v)) return 'n/a'
  const abs = Math.abs(v)
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: digits }) + '/' + unit
}

export function fmtNumber(v) {
  return Math.round(v).toLocaleString('en-US')
}

export function fmtCO2(tons) {
  if (Math.abs(tons) >= 1e6) return (tons / 1e6).toFixed(2) + ' MtCO₂'
  if (Math.abs(tons) >= 1e3) return (tons / 1e3).toFixed(1) + ' ktCO₂'
  return Math.round(tons) + ' tCO₂'
}
