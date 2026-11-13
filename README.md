# Deal Lens — Climate-Tech Unit-Economics Screener

An investor-facing terminal that screens a climate-tech company against the fossil/incumbent
solution it displaces, then maps it onto an APAC climate-tech investment thesis. Built with
**React + Vite + Tailwind CSS + Recharts**.

> Illustrative sample data for demonstration only — not investment advice. Profiles are
> representative of Audacy's thematic areas, not real portfolio companies.

## Why this exists

Companion to the BESS bankability terminal. That one answers *"is this asset bankable?"*;
this one answers *"does this deal fit the thesis, and are the unit economics real?"*

It was built ahead of a coffee chat with **Audacy Partners** — an APAC climate-tech VC whose
thesis is backing *proven* energy/industrial technology that is **cost-competitive with
fossil-fuel incumbents** and **deployable in APAC**. The scorecard mirrors those exact axes,
so the tool translates a pitch into the investor's own framework.

## What it does

Given a company profile (technology, output, capex, opex, price, the incumbent's cost and
emissions, and carbon intensity), it computes:

| Output | Meaning |
|---|---|
| **LCOX — this tech** | Levelised cost per functional unit ($/MWh, $/t SAF, $/t CO₂) |
| **Cost advantage** | % cheaper (or dearer) than the incumbent's delivered cost |
| **Project IRR / payback / NPV** | Financeability of the company's own cash flows |
| **Abatement cost ($/tCO₂)** | Marginal cost of each tonne avoided — negative = paid to decarbonise |
| **Thesis-fit scorecard** | Cost vs incumbent · path to profit · APAC nexus · commercial maturity |

The UI: a dark Bloomberg-style terminal with a preset selector, live sliders, KPI cards, a
radar scorecard, an LCOX-vs-incumbent comparison, and a 10-year cash-flow chart.

## Deal profiles (presets)

Representative of Audacy's three themes — **Energy Efficiency & Electrification**,
**Sustainable Transport**, **Industrial Decarbonisation**:

1. **C&I BESS · diesel offset** — electrification & storage
2. **Second-life BESS** — circular / storage
3. **HVAC efficiency retrofit** — industrial efficiency
4. **SAF blending terminal** — sustainable transport
5. **Membrane carbon capture** — industrial decarbonisation

The output range is deliberately mixed — some deals clear the thesis, some don't (the carbon
capture case fails on cost competitiveness but passes on abatement, showing the scorecard
isn't a rubber stamp).

## Model assumptions

```
capex       = capexM × 1e6
opex        = opexPct × capex
LCOX_tech   = (capex + PV(opex)) / PV(annual output)          # levelised, at hurdle
carbon/unit = max(0, incumbentIntensity − techIntensity) / 1000   # tCO₂ per unit
MAC         = (LCOX_tech − incumbentCost) / carbonPerUnit     # $/tCO₂
cashflows   = [−capex, net_1 … net_N],  net = output × price − opex
```

- **IRR** — root of NPV = 0 over the cash flows (bisection).
- **Payback** — first year cumulative cash flow ≥ 0, interpolated.
- **NPV** — discounted at the hurdle rate.
- **Scorecard (0–100)** — cost vs incumbent 35% · path to profit 25% · APAC nexus 25% ·
  commercial maturity 15%. Verdict: ≥70 STRONG FIT, ≥50 WATCHLIST, else PASS.

Simplifications: constant annual output, flat opex, all-equity pre-tax economics, no policy
credits, offtake structure, debt, taxes or terminal value.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

> If `npm install` hits an `EACCES`/`EEXIST` error on `~/.npm/_cacache`, use a writable cache:
> `npm install --cache ./npm-cache`.

## Deploy

`netlify.toml` included (build `npm run build`, publish `dist`). `vite.config.js` uses
`base: './'` so it works from any sub-path.

## Embedding in the portfolio later

1. `npm run build`
2. Copy `dist/` into the portfolio, e.g. `deal-lens/`
3. Add a `deal-lens.html` page and iframe `deal-lens/index.html` — same pattern as the wind
   and BESS tools.
