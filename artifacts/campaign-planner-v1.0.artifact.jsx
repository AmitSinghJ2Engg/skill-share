/**
 * Campaign Planner v1.0 -- Ismokraft Product Testing System
 * Domain 2.5 "Plan + Run" PPC Test Campaign Planner for Amazon India
 *
 * Single-file React JSX artifact for Claude.ai.
 * No external imports except React (globally available).
 *
 * Wizard steps:
 *   1. Mode Selection  -- Data-Buying (Phase 1) vs Conversion Testing (Phase 2)
 *   2. Budget & Targeting -- bid strategy, bid, budget, duration, keywords
 *   3. TestPlan Review & Approval -- summary card, human gate
 *   4. Live Test Tracker -- daily metrics input, running totals, data quality
 *
 * Configuration defaults match ppc-test-campaign-config.ctx.json:
 *   Phase 1: auto campaign, dynamic-down-only, INR 5 bid, INR 500/day, 10 days
 *   Phase 2: manual exact, dynamic-up-and-down, INR 8 bid, INR 1000/day, 14 days
 *   Data quality: HIGH=5kw x 1000imp, MEDIUM=3kw x 500imp, LOW=1kw x 100imp
 */

/* ================================================================== */
/* Constants & Configuration                                           */
/* ================================================================== */

const COLORS = {
  pri:  '#2563eb',   // Primary blue
  priL: '#dbeafe',   // Primary light
  priD: '#1d4ed8',   // Primary dark
  ok:   '#16a34a',   // Success green
  okL:  '#dcfce7',   // Success light
  warn: '#d97706',   // Warning amber
  warnL:'#fef3c7',   // Warning light
  err:  '#dc2626',   // Danger red
  errL: '#fee2e2',   // Danger light
  g50:  '#f9fafb',
  g100: '#f3f4f6',
  g200: '#e5e7eb',
  g300: '#d1d5db',
  g400: '#9ca3af',
  g500: '#6b7280',
  g600: '#4b5563',
  g700: '#374151',
  g800: '#1f2937',
  g900: '#111827',
  w:    '#ffffff',
};

/** Phase configuration -- values from ppc-test-campaign-config.ctx.json */
const PHASES = {
  phase_1_discovery: {
    label: 'Phase 1: Data-Buying (Keyword Discovery)',
    short: 'Data-Buying',
    goal: 'Keyword discovery -- which keywords Amazon associates with the product',
    type: 'auto',
    suffix: 'SP_Auto',
    bid: 'dynamic-down-only',
    defaultBid: 5,
    daily: 500,
    days: 10,
    qc: 'WAIVED permitted (with human approval)',
    dur: '7-10 days',
    desc: 'Run an automatic Sponsored Products campaign so Amazon reveals which search '
      + 'terms it associates with your product. No keyword input needed -- Amazon does '
      + 'the matching. Output: raw search term report with impressions, clicks, CTR per keyword.',
  },
  phase_2_validation: {
    label: 'Phase 2: Conversion Testing (Validation)',
    short: 'Conversion Testing',
    goal: 'Bottom-line unit economics validation per keyword -- actual CVR, ACoS, margin',
    type: 'manual (exact match)',
    suffix: 'SP_Manual_Exact',
    bid: 'dynamic-up-and-down',
    defaultBid: 8,
    daily: 1000,
    days: 14,
    qc: 'PASS mandatory',
    dur: '10-14 days',
    desc: 'Run manual exact-match campaigns targeting winner keywords from Phase 1. '
      + 'Validates actual conversion rate, cost-per-click, and ACoS at keyword level. '
      + 'Output: per-keyword margin viability data for Gate 2 scale decision.',
  },
};

/** Data quality thresholds -- from ppc-test-campaign-config.ctx.json */
const DQ_THRESHOLDS = {
  HIGH:   { kw: 5, imp: 1000, c: COLORS.ok,   bg: COLORS.okL,
            desc: 'Sufficient data across enough keywords for confident margin decisions' },
  MEDIUM: { kw: 3, imp: 500,  c: COLORS.warn, bg: COLORS.warnL,
            desc: 'Directional signal present but some keywords lack volume' },
  LOW:    { kw: 1, imp: 100,  c: COLORS.err,  bg: COLORS.errL,
            desc: 'Insufficient data to draw conclusions' },
};

/** Bid strategy options for Amazon Sponsored Products */
const BID_OPTIONS = [
  { v: 'dynamic-down-only',   l: 'Dynamic Bids - Down Only' },
  { v: 'dynamic-up-and-down', l: 'Dynamic Bids - Up and Down' },
  { v: 'fixed',               l: 'Fixed Bids' },
];

const STEP_LABELS = ['Mode Selection', 'Budget & Targeting', 'TestPlan Review', 'Live Tracker'];

/** Contextual hints shown in the AI Context banner per step */
const AI_HINTS = [
  'Select the test phase for your product. Phase 1 (Discovery) should run first for new products; Phase 2 (Validation) follows after harvesting keywords.',
  'Configure campaign parameters. Defaults are loaded from ppc-test-campaign-config. Adjust bid and budget based on category competitiveness.',
  'Review all campaign parameters before approval. Approving this plan authorizes real ad spend. Campaign will be created manually in Seller Central.',
  'Track daily campaign performance. Enter metrics from Seller Central reports. Running totals update automatically. Export search term report when complete.',
];

/** Column headers for the daily metrics table */
const TABLE_COLS = ['Day', 'Impressions', 'Clicks', 'Orders', 'Spend (INR)', 'Revenue (INR)'];
const TABLE_FIELDS = ['impressions', 'clicks', 'orders', 'spend', 'revenue'];

/* ================================================================== */
/* Helpers                                                             */
/* ================================================================== */

const h = React.createElement;
const C = COLORS;

/** Format number as Indian Rupees */
function inr(amount) {
  if (amount == null || isNaN(amount)) return '--';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format number as percentage */
function pct(value, decimals) {
  if (value == null || isNaN(value)) return '--';
  return Number(value).toFixed(decimals != null ? decimals : 1) + '%';
}

/** Format number with Indian locale grouping */
function fmtN(n) {
  return (n || 0).toLocaleString('en-IN');
}

/** Generate standardized campaign name from product name and phase suffix */
function campName(productName, suffix) {
  var safe = (productName || 'Product').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  return 'Test_' + safe + '_' + suffix;
}

/**
 * Assess data quality based on estimated keyword coverage and impression volume.
 * Heuristic: estimate keywords from clicks (approx 1 keyword per 5 clicks),
 * then check against HIGH/MEDIUM/LOW thresholds.
 */
function assessDataQuality(rows) {
  if (!rows || !rows.length) return 'LOW';
  var totalImp = rows.reduce(function(s, r) { return s + (r.impressions || 0); }, 0);
  var totalCl = rows.reduce(function(s, r) { return s + (r.clicks || 0); }, 0);
  var estKW = totalCl > 0 ? Math.min(Math.ceil(totalCl / 5), 20) : 0;
  var avgImpPerKW = estKW > 0 ? totalImp / estKW : 0;
  if (estKW >= DQ_THRESHOLDS.HIGH.kw && avgImpPerKW >= DQ_THRESHOLDS.HIGH.imp) return 'HIGH';
  if (estKW >= DQ_THRESHOLDS.MEDIUM.kw && avgImpPerKW >= DQ_THRESHOLDS.MEDIUM.imp) return 'MEDIUM';
  return 'LOW';
}

/** Create an empty daily metrics row */
function emptyRow() {
  return { impressions: 0, clicks: 0, orders: 0, spend: 0, revenue: 0 };
}

/** Count non-empty lines in a newline-separated string */
function countLines(text) {
  return (text || '').split('\n').filter(function(k) { return k.trim(); }).length;
}

/** Split a newline-separated string into trimmed non-empty items */
function splitLines(text) {
  return (text || '').split('\n').filter(function(k) { return k.trim(); }).map(function(k) { return k.trim(); });
}

/* ================================================================== */
/* Shared inline styles                                                */
/* ================================================================== */

var S = {
  card: {
    background: C.w,
    borderRadius: '10px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: C.g900,
    marginTop: 0,
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: C.g700,
    marginBottom: '6px',
  },
  inp: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    color: C.g800,
    border: '1px solid ' + C.g300,
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  sel: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    color: C.g800,
    background: C.w,
    border: '1px solid ' + C.g300,
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  ta: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    color: C.g800,
    fontFamily: 'inherit',
    border: '1px solid ' + C.g300,
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px',
  },
  btn: function(bg, fg) {
    return {
      background: bg,
      color: fg,
      border: 'none',
      borderRadius: '8px',
      padding: '10px 24px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
    };
  },
  btnOut: {
    background: C.w,
    color: C.g700,
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid ' + C.g300,
  },
  badge: function(bg, color) {
    return {
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      background: bg,
      color: color,
    };
  },
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    background: C.g100,
    color: C.g600,
    marginRight: '4px',
    marginBottom: '4px',
  },
  negTag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    background: C.errL,
    color: C.err,
    marginRight: '4px',
    marginBottom: '4px',
  },
  hr: {
    height: '1px',
    background: C.g200,
    margin: '16px 0',
    border: 'none',
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  col: {
    flex: 1,
    minWidth: '180px',
  },
  fg: {
    marginBottom: '16px',
  },
  cellInput: {
    width: '100%',
    padding: '5px 8px',
    fontSize: 13,
    textAlign: 'right',
    border: '1px solid ' + C.g200,
    borderRadius: 4,
    background: C.w,
    outline: 'none',
    boxSizing: 'border-box',
  },
};

/* ================================================================== */
/* Micro-components                                                    */
/* ================================================================== */

/** Summary row: label on left, value on right, optional highlight color */
function SummaryRow({ label, value, highlight }) {
  return h('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid ' + C.g100,
      fontSize: '14px',
    },
  },
    h('span', { style: { color: C.g500, fontWeight: 500 } }, label),
    h('span', { style: { color: highlight || C.g900, fontWeight: 600 } }, value)
  );
}

/** Metric display card for the tracker dashboard */
function MetricCard({ label, value, color }) {
  return h('div', {
    style: {
      background: C.g50,
      borderRadius: '8px',
      padding: '14px 16px',
      textAlign: 'center',
      border: '1px solid ' + C.g200,
      minWidth: '110px',
      flex: 1,
    },
  },
    h('div', { style: { fontSize: '22px', fontWeight: 700, color: color || C.g900 } }, value),
    h('div', { style: { fontSize: '12px', color: C.g500, marginTop: '2px' } }, label)
  );
}

/* ================================================================== */
/* Stepper navigation                                                  */
/* ================================================================== */

function Stepper({ step }) {
  return h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 24px',
      background: C.w,
      borderBottom: '1px solid ' + C.g200,
    },
  },
    STEP_LABELS.map(function(lbl, i) {
      var done = i < step;
      var act = i === step;
      var last = i === STEP_LABELS.length - 1;
      var cc = done ? C.ok : act ? C.pri : C.g300;
      return h(React.Fragment, { key: i },
        h('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            minWidth: '100px',
          },
        },
          h('div', {
            style: {
              width: 30, height: 30, borderRadius: '50%',
              background: done || act ? cc : C.w,
              border: '2px solid ' + cc,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
              color: done || act ? C.w : C.g400,
            },
          }, done ? '\u2713' : i + 1),
          h('span', {
            style: {
              fontSize: 12,
              fontWeight: act ? 700 : 500,
              textAlign: 'center',
              color: done ? C.ok : act ? C.pri : C.g400,
            },
          }, lbl)
        ),
        !last && h('div', {
          style: {
            flex: 1, height: 2, minWidth: 40,
            alignSelf: 'flex-start', marginTop: 16,
            background: done ? C.ok : C.g200,
          },
        })
      );
    })
  );
}

/* ================================================================== */
/* Step 1 -- Mode Selection                                            */
/* ================================================================== */

function StepModeSelection({ mode, onSelect }) {
  return h('div', null,
    h('h2', { style: { ...S.title, fontSize: 18, marginBottom: 20 } },
      'Select Test Mode'),
    h('div', { style: { display: 'flex', gap: 20, flexWrap: 'wrap' } },
      Object.entries(PHASES).map(function([key, ph]) {
        var sel = mode === key;
        return h('div', {
          key: key,
          onClick: function() { onSelect(key); },
          style: {
            ...S.card,
            flex: 1,
            minWidth: 280,
            cursor: 'pointer',
            marginBottom: 0,
            border: sel ? '2px solid ' + C.pri : '2px solid transparent',
            boxShadow: sel
              ? '0 0 0 3px ' + C.priL + ', 0 1px 3px rgba(0,0,0,0.08)'
              : S.card.boxShadow,
            transition: 'box-shadow 0.15s, border-color 0.15s',
          },
        },
          // Radio indicator + phase title
          h('div', {
            style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
          },
            h('div', {
              style: {
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: '2px solid ' + (sel ? C.pri : C.g300),
                background: sel ? C.pri : C.w,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              },
            },
              sel && h('div', {
                style: { width: 8, height: 8, borderRadius: '50%', background: C.w },
              })
            ),
            h('h3', { style: { margin: 0, fontSize: 15, fontWeight: 700, color: C.g900 } },
              ph.short)
          ),
          // Description paragraph
          h('p', {
            style: { fontSize: 13, color: C.g600, margin: '0 0 14px', lineHeight: 1.5 },
          }, ph.desc),
          h('hr', { style: S.hr }),
          // Info summary rows
          h(SummaryRow, { label: 'Goal', value: ph.goal }),
          h(SummaryRow, { label: 'Campaign Type', value: ph.type }),
          h(SummaryRow, { label: 'QC Requirement', value: ph.qc }),
          h(SummaryRow, { label: 'Typical Duration', value: ph.dur }),
          h(SummaryRow, { label: 'Default Budget', value: inr(ph.daily) + '/day' })
        );
      })
    )
  );
}

/* ================================================================== */
/* Step 2 -- Budget & Targeting                                        */
/* ================================================================== */

function StepBudgetTargeting({ cfg, onChange, mode, prodName }) {
  var ph = PHASES[mode];
  var cn = campName(prodName, ph.suffix);
  var total = (cfg.dailyBudget || 0) * (cfg.durationDays || 0);
  var isP2 = mode === 'phase_2_validation';
  var kwCount = countLines(cfg.keywords);

  return h('div', null,
    h('h2', { style: { ...S.title, fontSize: 18, marginBottom: 20 } },
      'Budget & Targeting'),

    // -- Campaign Identity Card --
    h('div', { style: S.card },
      h('h3', { style: S.title }, 'Campaign Identity'),
      h('div', { style: S.fg },
        h('label', { style: S.label }, 'Campaign Name (auto-generated)'),
        h('input', {
          style: { ...S.inp, background: C.g50, color: C.g500 },
          value: cn,
          readOnly: true,
        })
      ),
      h('div', { style: S.row },
        h('span', { style: S.tag }, 'Type: ' + ph.type),
        h('span', { style: S.tag }, 'Platform: Amazon India')
      )
    ),

    // -- Bid & Budget Configuration Card --
    h('div', { style: S.card },
      h('h3', { style: S.title }, 'Bid & Budget Configuration'),

      // Bid strategy + default bid
      h('div', { style: S.row },
        h('div', { style: S.col },
          h('div', { style: S.fg },
            h('label', { style: S.label }, 'Bid Strategy'),
            h('select', {
              style: S.sel,
              value: cfg.bidStrategy,
              onChange: function(e) { onChange({ ...cfg, bidStrategy: e.target.value }); },
            },
              BID_OPTIONS.map(function(b) {
                return h('option', { key: b.v, value: b.v }, b.l);
              })
            )
          )
        ),
        h('div', { style: S.col },
          h('div', { style: S.fg },
            h('label', { style: S.label }, 'Default Bid (INR)'),
            h('input', {
              style: S.inp,
              type: 'number',
              min: 1,
              value: cfg.defaultBid,
              onChange: function(e) { onChange({ ...cfg, defaultBid: Number(e.target.value) }); },
            })
          )
        )
      ),

      // Daily budget + duration
      h('div', { style: S.row },
        h('div', { style: S.col },
          h('div', { style: S.fg },
            h('label', { style: S.label }, 'Daily Budget (INR)'),
            h('input', {
              style: S.inp,
              type: 'number',
              min: 100,
              step: 100,
              value: cfg.dailyBudget,
              onChange: function(e) { onChange({ ...cfg, dailyBudget: Number(e.target.value) }); },
            })
          )
        ),
        h('div', { style: S.col },
          h('div', { style: S.fg },
            h('label', { style: S.label }, 'Duration (days)'),
            h('input', {
              style: S.inp,
              type: 'number',
              min: 1,
              max: 30,
              value: cfg.durationDays,
              onChange: function(e) { onChange({ ...cfg, durationDays: Number(e.target.value) }); },
            })
          )
        )
      ),

      // Budget summary highlight
      h('hr', { style: S.hr }),
      h('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: C.priL,
          borderRadius: 8,
        },
      },
        h('span', { style: { fontSize: 14, fontWeight: 600, color: C.priD } },
          'Total Estimated Spend'),
        h('span', { style: { fontSize: 20, fontWeight: 700, color: C.priD } },
          inr(total))
      ),
      h('p', {
        style: { fontSize: 12, color: C.g400, marginTop: 8, marginBottom: 0 },
      },
        inr(cfg.dailyBudget) + '/day x ' + cfg.durationDays + ' days = ' + inr(total) + ' total'
      )
    ),

    // -- Phase 2: Keyword Input Card --
    isP2 && h('div', { style: S.card },
      h('h3', { style: S.title }, 'Keywords (from Phase 1 Discovery)'),
      h('div', { style: S.fg },
        h('label', { style: S.label }, 'Target Keywords (one per line)'),
        h('textarea', {
          style: { ...S.ta, minHeight: 120 },
          placeholder: 'keyword 1\nkeyword 2\nkeyword 3',
          value: cfg.keywords || '',
          onChange: function(e) { onChange({ ...cfg, keywords: e.target.value }); },
        }),
        h('span', { style: { fontSize: 12, color: C.g400 } },
          kwCount + ' keywords entered')
      ),
      h('div', { style: S.fg },
        h('label', { style: S.label }, 'Negative Keywords (one per line, optional)'),
        h('textarea', {
          style: S.ta,
          placeholder: 'negative keyword 1\nnegative keyword 2',
          value: cfg.negativeKeywords || '',
          onChange: function(e) { onChange({ ...cfg, negativeKeywords: e.target.value }); },
        })
      )
    )
  );
}

/* ================================================================== */
/* Step 3 -- TestPlan Review & Approval                                */
/* ================================================================== */

function StepReview({ cfg, mode, prodName, onApprove, approved }) {
  var ph = PHASES[mode];
  var cn = campName(prodName, ph.suffix);
  var total = (cfg.dailyBudget || 0) * (cfg.durationDays || 0);
  var bidLabel = (BID_OPTIONS.find(function(b) { return b.v === cfg.bidStrategy; }) || {}).l
    || cfg.bidStrategy;
  var isP2 = mode === 'phase_2_validation';
  var kwList = isP2 ? splitLines(cfg.keywords) : [];
  var negList = isP2 ? splitLines(cfg.negativeKeywords) : [];

  return h('div', null,
    h('h2', { style: { ...S.title, fontSize: 18, marginBottom: 20 } },
      'TestPlan Review'),

    // -- Summary Card --
    h('div', { style: { ...S.card, border: '2px solid ' + C.g200 } },
      // Header with status badge
      h('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        },
      },
        h('h3', { style: { ...S.title, marginBottom: 0 } }, 'Campaign TestPlan'),
        h('span', {
          style: S.badge(approved ? C.okL : C.warnL, approved ? C.ok : C.warn),
        }, approved ? 'APPROVED' : 'PENDING APPROVAL')
      ),

      // Configuration summary rows
      h(SummaryRow, { label: 'Product', value: prodName || '(unnamed)' }),
      h(SummaryRow, { label: 'Campaign Name', value: cn }),
      h(SummaryRow, { label: 'Test Phase', value: ph.label }),
      h(SummaryRow, { label: 'Campaign Type', value: ph.type }),
      h(SummaryRow, { label: 'Bid Strategy', value: bidLabel }),
      h(SummaryRow, { label: 'Default Bid', value: inr(cfg.defaultBid) }),
      h(SummaryRow, { label: 'Daily Budget', value: inr(cfg.dailyBudget) }),
      h(SummaryRow, { label: 'Duration', value: cfg.durationDays + ' days' }),
      h(SummaryRow, { label: 'Total Spend', value: inr(total), highlight: C.pri }),
      h(SummaryRow, { label: 'QC Requirement', value: ph.qc }),

      // Phase 2: keyword tags
      isP2 && h('hr', { style: S.hr }),
      isP2 && h(SummaryRow, { label: 'Target Keywords', value: kwList.length + ' keywords' }),
      isP2 && kwList.length > 0 && h('div', {
        style: { marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 },
      },
        kwList.map(function(kw, i) { return h('span', { key: i, style: S.tag }, kw); })
      ),

      // Phase 2: negative keyword tags
      isP2 && negList.length > 0 && h('div', { style: { marginTop: 12 } },
        h('span', { style: { ...S.label, marginBottom: 8 } }, 'Negative Keywords'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
          negList.map(function(kw, i) {
            return h('span', { key: i, style: S.negTag }, kw);
          })
        )
      )
    ),

    // -- Warning Banner (before approval) --
    !approved && h('div', {
      style: {
        background: C.warnL,
        border: '1px solid ' + C.warn,
        borderRadius: 8,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      },
    },
      h('span', { style: { fontSize: 20, flexShrink: 0, lineHeight: 1 } }, '\u26A0'),
      h('div', null,
        h('strong', { style: { color: C.warn, fontSize: 14 } },
          'Ad Spend Authorization'),
        h('p', {
          style: { margin: '4px 0 0', fontSize: 13, color: C.g700, lineHeight: 1.5 },
        },
          'Approving this plan authorizes ad spend of ',
          h('strong', null, inr(total)),
          ' over ',
          h('strong', null, cfg.durationDays + ' days'),
          '. Team will execute the campaign manually in Amazon Seller Central ',
          'based on these parameters.'
        )
      )
    ),

    // -- Approve Button --
    !approved && h('div', { style: { textAlign: 'center' } },
      h('button', {
        style: {
          ...S.btn(C.ok, C.w),
          padding: '12px 32px',
          fontSize: 15,
          fontWeight: 700,
        },
        onClick: onApprove,
      }, 'Approve TestPlan')
    ),

    // -- Approved Confirmation --
    approved && h('div', {
      style: {
        background: C.okL,
        border: '1px solid ' + C.ok,
        borderRadius: 8,
        padding: '14px 18px',
        textAlign: 'center',
        fontSize: 14,
        color: C.ok,
        fontWeight: 600,
      },
    }, 'TestPlan approved. Proceed to Live Tracker to monitor campaign performance.')
  );
}

/* ================================================================== */
/* Step 4 -- Live Test Tracker                                         */
/* ================================================================== */

function StepTracker({ cfg, mode, prodName, daily, onDaily, status, onStatus }) {
  var ph = PHASES[mode];
  var totalDays = cfg.durationDays || 1;

  // Compute running totals from daily entries
  var tot = React.useMemo(function() {
    var t = { imp: 0, cl: 0, ord: 0, sp: 0, rev: 0, n: 0 };
    daily.forEach(function(d) {
      if (d.impressions || d.clicks || d.orders || d.spend || d.revenue) {
        t.imp += d.impressions || 0;
        t.cl += d.clicks || 0;
        t.ord += d.orders || 0;
        t.sp += d.spend || 0;
        t.rev += d.revenue || 0;
        t.n++;
      }
    });
    // Derived metrics
    t.ctr = t.imp > 0 ? (t.cl / t.imp) * 100 : 0;
    t.cvr = t.cl > 0 ? (t.ord / t.cl) * 100 : 0;
    t.cpc = t.cl > 0 ? t.sp / t.cl : 0;
    t.acos = t.rev > 0 ? (t.sp / t.rev) * 100 : 0;
    t.roas = t.sp > 0 ? t.rev / t.sp : 0;
    return t;
  }, [daily]);

  var dq = assessDataQuality(daily);
  var dqInfo = DQ_THRESHOLDS[dq];
  var isDone = status === 'complete';

  // Status display configuration
  var stMap = {
    'not-started': { bg: C.g100, c: C.g500, l: 'Not Started' },
    running:       { bg: C.priL, c: C.pri,  l: 'Running' },
    complete:      { bg: C.okL,  c: C.ok,   l: 'Complete' },
  };
  var st = stMap[status] || stMap['not-started'];

  /** Update a single field in a daily row */
  function setField(dayIdx, field, value) {
    var updated = daily.slice();
    updated[dayIdx] = { ...updated[dayIdx], [field]: Number(value) || 0 };
    onDaily(updated);
  }

  return h('div', null,
    h('h2', { style: { ...S.title, fontSize: 18, marginBottom: 20 } },
      'Live Test Tracker'),

    // ---- Status & Day Counter ----
    h('div', { style: S.card },
      h('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        },
      },
        // Status badge
        h('div', null,
          h('h3', { style: { ...S.title, marginBottom: 4 } }, 'Campaign Status'),
          h('span', {
            style: { ...S.badge(st.bg, st.c), fontSize: 14, padding: '5px 14px' },
          }, st.l)
        ),
        // Day counter with progress bar
        h('div', { style: { textAlign: 'center' } },
          h('div', { style: { fontSize: 28, fontWeight: 700, color: C.g900 } },
            'Day ' + tot.n + ' of ' + totalDays),
          h('div', {
            style: {
              width: 200, height: 6, background: C.g200,
              borderRadius: 3, overflow: 'hidden', marginTop: 6,
            },
          },
            h('div', {
              style: {
                width: Math.min((tot.n / totalDays) * 100, 100) + '%',
                height: '100%',
                background: isDone ? C.ok : C.pri,
                borderRadius: 3,
                transition: 'width 0.3s',
              },
            })
          )
        ),
        // Status action buttons
        h('div', { style: { display: 'flex', gap: 8 } },
          status === 'not-started' && h('button', {
            style: S.btn(C.pri, C.w),
            onClick: function() { onStatus('running'); },
          }, 'Start Campaign'),
          status === 'running' && h('button', {
            style: { ...S.btnOut, borderColor: C.ok, color: C.ok },
            onClick: function() { onStatus('complete'); },
          }, 'Mark Complete'),
          status === 'complete' && h('button', {
            style: S.btnOut,
            onClick: function() { onStatus('running'); },
          }, 'Reopen')
        )
      )
    ),

    // ---- Running Totals ----
    h('div', { style: S.card },
      h('h3', { style: S.title }, 'Running Totals'),
      // Raw metrics
      h('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 } },
        h(MetricCard, { label: 'Impressions', value: fmtN(tot.imp) }),
        h(MetricCard, { label: 'Clicks', value: fmtN(tot.cl) }),
        h(MetricCard, { label: 'Orders', value: fmtN(tot.ord) }),
        h(MetricCard, { label: 'Spend', value: inr(tot.sp) }),
        h(MetricCard, { label: 'Revenue', value: inr(tot.rev) })
      ),
      // Computed metrics
      h('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
        h(MetricCard, {
          label: 'Blended ACoS',
          value: pct(tot.acos),
          color: tot.acos > 30 ? C.err : tot.acos > 20 ? C.warn : C.ok,
        }),
        h(MetricCard, {
          label: 'ROAS',
          value: tot.roas ? tot.roas.toFixed(2) + 'x' : '--',
          color: tot.roas >= 3 ? C.ok : tot.roas >= 2 ? C.warn : C.err,
        }),
        h(MetricCard, {
          label: 'CTR',
          value: pct(tot.ctr),
          color: tot.ctr >= 0.5 ? C.ok : C.warn,
        }),
        h(MetricCard, {
          label: 'CVR',
          value: pct(tot.cvr),
          color: tot.cvr >= 5 ? C.ok : tot.cvr >= 2 ? C.warn : C.err,
        }),
        h(MetricCard, {
          label: 'CPC',
          value: tot.cpc ? inr(Math.round(tot.cpc * 100) / 100) : '--',
        })
      )
    ),

    // ---- Data Quality Indicator ----
    h('div', { style: S.card },
      h('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
      },
        h('div', null,
          h('h3', { style: { ...S.title, marginBottom: 4 } }, 'Data Quality'),
          h('p', { style: { margin: 0, fontSize: 13, color: C.g500 } },
            'Based on estimated keyword coverage and impressions volume')
        ),
        h('span', { style: S.badge(dqInfo.bg, dqInfo.c) }, dq)
      ),
      h('hr', { style: S.hr }),
      // Threshold reference cards
      h('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap' } },
        Object.entries(DQ_THRESHOLDS).map(function([level, info]) {
          var active = level === dq;
          return h('div', {
            key: level,
            style: {
              flex: 1,
              minWidth: 160,
              padding: '10px 14px',
              borderRadius: 6,
              background: active ? info.bg : C.g50,
              border: '1px solid ' + (active ? info.c : C.g200),
            },
          },
            h('div', {
              style: { fontWeight: 700, fontSize: 13, color: info.c, marginBottom: 4 },
            }, level),
            h('div', { style: { fontSize: 12, color: C.g500 } },
              info.kw + '+ keywords, ' + info.imp.toLocaleString() + '+ imp/kw'),
            h('div', { style: { fontSize: 11, color: C.g400, marginTop: 2 } },
              info.desc)
          );
        })
      )
    ),

    // ---- Daily Metrics Input Table ----
    h('div', { style: { ...S.card, overflowX: 'auto' } },
      h('h3', { style: S.title }, 'Daily Metrics Input'),
      h('p', {
        style: { fontSize: 13, color: C.g500, marginTop: 0, marginBottom: 14 },
      },
        'Enter daily metrics from Seller Central campaign reports. Scroll right for all columns.'
      ),
      h('table', {
        style: {
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
          minWidth: 640,
        },
      },
        // Header
        h('thead', null,
          h('tr', null,
            TABLE_COLS.map(function(hd) {
              return h('th', {
                key: hd,
                style: {
                  padding: '8px 10px',
                  textAlign: hd === 'Day' ? 'center' : 'right',
                  borderBottom: '2px solid ' + C.g200,
                  color: C.g600,
                  fontWeight: 600,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                },
              }, hd);
            })
          )
        ),
        // Body
        h('tbody', null,
          daily.map(function(row, i) {
            return h('tr', {
              key: i,
              style: { background: i % 2 === 0 ? C.w : C.g50 },
            },
              // Day number cell
              h('td', {
                style: {
                  padding: '6px 10px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: C.g500,
                  borderBottom: '1px solid ' + C.g100,
                },
              }, i + 1),
              // Data input cells
              TABLE_FIELDS.map(function(f) {
                return h('td', {
                  key: f,
                  style: {
                    padding: '4px 6px',
                    borderBottom: '1px solid ' + C.g100,
                  },
                },
                  h('input', {
                    type: 'number',
                    min: 0,
                    value: row[f] || '',
                    placeholder: '0',
                    onChange: function(e) { setField(i, f, e.target.value); },
                    style: S.cellInput,
                  })
                );
              })
            );
          }),
          // Totals row
          h('tr', { style: { background: C.priL } },
            h('td', {
              style: {
                padding: '8px 10px',
                textAlign: 'center',
                fontWeight: 700,
                color: C.priD,
                borderTop: '2px solid ' + C.pri,
              },
            }, 'Total'),
            [fmtN(tot.imp), fmtN(tot.cl), fmtN(tot.ord), inr(tot.sp), inr(tot.rev)].map(
              function(v, i) {
                return h('td', {
                  key: i,
                  style: {
                    padding: '8px 10px',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: C.priD,
                    borderTop: '2px solid ' + C.pri,
                  },
                }, v);
              }
            )
          )
        )
      )
    ),

    // ---- Export Prompt (shown when campaign is marked complete) ----
    isDone && h('div', {
      style: {
        ...S.card,
        background: C.okL,
        border: '2px solid ' + C.ok,
      },
    },
      h('h3', { style: { ...S.title, color: C.ok } },
        'Campaign Complete -- Export Search Term Report'),
      h('p', {
        style: { fontSize: 14, color: C.g700, margin: '0 0 12px', lineHeight: 1.6 },
      },
        'The campaign has completed its full ',
        h('strong', null, totalDays + '-day'),
        ' run. To proceed with analysis, export the Search Term Report ',
        'from Amazon Seller Central:'
      ),
      h('ol', {
        style: {
          margin: '0 0 12px',
          paddingLeft: 20,
          fontSize: 13,
          color: C.g700,
          lineHeight: 1.8,
        },
      },
        h('li', null, 'Go to Seller Central > Advertising > Campaign Manager'),
        h('li', null, 'Select the campaign: ',
          h('strong', null, campName(prodName, ph.suffix))),
        h('li', null, 'Navigate to "Search Terms" tab'),
        h('li', null, 'Set date range to cover the full campaign period'),
        h('li', null, 'Click "Download Report" (CSV format)')
      ),
      h('p', { style: { fontSize: 13, color: C.g600, margin: 0 } },
        'Provide the exported CSV to the ads-ops skill for keyword analysis ',
        'and bucket classification.')
    )
  );
}

/* ================================================================== */
/* Main App Component                                                  */
/* ================================================================== */

function CampaignPlanner() {
  // Product list state
  var [products, setProducts] = React.useState([{ name: '' }]);
  var [pidx, setPidx] = React.useState(0);

  // Wizard state
  var [step, setStep] = React.useState(0);
  var [mode, setMode] = React.useState(null);
  var [approved, setApproved] = React.useState(false);
  var [status, setStatus] = React.useState('not-started');

  // Campaign configuration state
  var [cfg, setCfg] = React.useState({
    bidStrategy: 'dynamic-down-only',
    defaultBid: 5,
    dailyBudget: 500,
    durationDays: 10,
    keywords: '',
    negativeKeywords: '',
  });

  // Daily tracker data
  var [daily, setDaily] = React.useState([]);

  var prod = products[pidx] || { name: '' };

  // Reset configuration when mode changes
  React.useEffect(function() {
    if (mode) {
      var d = PHASES[mode];
      setCfg({
        bidStrategy: d.bid,
        defaultBid: d.defaultBid,
        dailyBudget: d.daily,
        durationDays: d.days,
        keywords: '',
        negativeKeywords: '',
      });
      setApproved(false);
      setStatus('not-started');
    }
  }, [mode]);

  // Sync daily data rows to match configured duration
  React.useEffect(function() {
    var n = cfg.durationDays || 1;
    setDaily(function(prev) {
      return Array.from({ length: n }, function(_, i) {
        return prev[i] || emptyRow();
      });
    });
  }, [cfg.durationDays]);

  /** Update a product name by index */
  function setProdName(i, name) {
    setProducts(function(p) {
      var u = p.slice();
      u[i] = { ...u[i], name: name };
      return u;
    });
  }

  /** Reset the wizard to step 0 */
  function resetWizard() {
    setStep(0);
    setMode(null);
    setApproved(false);
    setStatus('not-started');
  }

  /** Determine if the user can advance to the next step */
  function canNext() {
    if (step === 0) return mode !== null;
    if (step === 1) {
      var valid = cfg.defaultBid > 0 && cfg.dailyBudget > 0 && cfg.durationDays > 0;
      if (mode === 'phase_2_validation') {
        valid = valid && countLines(cfg.keywords) > 0;
      }
      return valid;
    }
    if (step === 2) return approved;
    return false;
  }

  /** Render the active step component */
  function renderStep() {
    if (step === 0) {
      return h(StepModeSelection, { mode: mode, onSelect: setMode });
    }
    if (step === 1) {
      return h(StepBudgetTargeting, {
        cfg: cfg, onChange: setCfg, mode: mode, prodName: prod.name,
      });
    }
    if (step === 2) {
      return h(StepReview, {
        cfg: cfg,
        mode: mode,
        prodName: prod.name,
        onApprove: function() { setApproved(true); },
        approved: approved,
      });
    }
    if (step === 3) {
      return h(StepTracker, {
        cfg: cfg,
        mode: mode,
        prodName: prod.name,
        daily: daily,
        onDaily: setDaily,
        status: status,
        onStatus: setStatus,
      });
    }
    return null;
  }

  // ---- Render ----
  return h('div', {
    style: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: C.g800,
      minHeight: '100%',
      background: C.g50,
    },
  },

    // ---- Header ----
    h('div', {
      style: {
        background: C.w,
        borderBottom: '1px solid ' + C.g200,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      },
    },
      h('div', null,
        h('h1', {
          style: { fontSize: 20, fontWeight: 700, color: C.g900, margin: 0 },
        }, 'Campaign Planner'),
        h('p', {
          style: { fontSize: 13, color: C.g500, margin: 0 },
        }, 'Ismokraft Product Testing System -- Domain 2.5 Plan + Run')
      ),
      // AI Context banner
      h('div', {
        style: {
          background: C.priL,
          border: '1px solid ' + C.pri,
          borderRadius: 8,
          padding: '10px 16px',
          fontSize: 13,
          color: C.priD,
          lineHeight: 1.5,
          maxWidth: 480,
        },
      },
        h('strong', null, 'AI Context: '),
        AI_HINTS[step] || ''
      )
    ),

    // ---- Stepper ----
    h(Stepper, { step: step }),

    // ---- Body Layout ----
    h('div', { style: { display: 'flex', minHeight: 'calc(100vh - 120px)' } },

      // ---- Left Panel: Product Nav ----
      h('div', {
        style: {
          width: 240,
          minWidth: 240,
          background: C.w,
          borderRight: '1px solid ' + C.g200,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        },
      },
        h('h3', {
          style: { margin: '0 0 12px', fontSize: 14, color: C.g700 },
        }, 'Products'),

        // Active product name input
        h('div', { style: S.fg },
          h('label', { style: { ...S.label, fontSize: 12 } }, 'Active Product'),
          h('input', {
            style: { ...S.inp, fontSize: 13 },
            placeholder: 'Enter product name...',
            value: prod.name,
            onChange: function(e) { setProdName(pidx, e.target.value); },
          })
        ),

        h('hr', { style: S.hr }),

        // Product list
        h('div', { style: { flex: 1, overflowY: 'auto' } },
          h('div', {
            style: { fontSize: 12, color: C.g400, marginBottom: 8 },
          }, 'Product List'),

          products.map(function(p, i) {
            var active = i === pidx;
            return h('button', {
              key: i,
              onClick: function() { setPidx(i); resetWizard(); },
              style: {
                display: 'block',
                width: '100%',
                borderRadius: 6,
                padding: '8px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 13,
                marginBottom: 4,
                background: active ? C.priL : 'transparent',
                border: active ? '1px solid ' + C.pri : '1px solid transparent',
                fontWeight: active ? 600 : 400,
                color: active ? C.pri : C.g600,
              },
            }, p.name || 'Product ' + (i + 1));
          }),

          // Add product button
          h('button', {
            onClick: function() {
              setProducts(function(p) { return p.concat([{ name: '' }]); });
              setPidx(products.length);
              resetWizard();
            },
            style: {
              display: 'block',
              width: '100%',
              background: 'transparent',
              border: '1px dashed ' + C.g300,
              borderRadius: 6,
              padding: '8px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: 13,
              color: C.g400,
              marginTop: 8,
            },
          }, '+ Add Product')
        ),

        // Active mode indicator (bottom of left panel)
        mode && h('div', {
          style: {
            marginTop: 'auto',
            padding: '10px 12px',
            background: C.g50,
            borderRadius: 6,
            border: '1px solid ' + C.g200,
          },
        },
          h('div', { style: { fontSize: 11, color: C.g400, marginBottom: 4 } },
            'Active Mode'),
          h('div', { style: { fontSize: 13, fontWeight: 600, color: C.g700 } },
            PHASES[mode].short)
        )
      ),

      // ---- Main Content Area ----
      h('div', { style: { flex: 1, padding: 24, overflowY: 'auto' } },

        // Render current wizard step
        renderStep(),

        // ---- Navigation Footer ----
        h('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid ' + C.g200,
          },
        },
          // Back button
          h('div', null,
            step > 0 && h('button', {
              style: S.btnOut,
              onClick: function() { setStep(step - 1); },
            }, 'Back')
          ),
          // Step indicator + Next button
          h('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } },
            h('span', { style: { fontSize: 12, color: C.g400 } },
              'Step ' + (step + 1) + ' of ' + STEP_LABELS.length),
            step < 3 && h('button', {
              style: {
                ...S.btn(C.pri, C.w),
                opacity: canNext() ? 1 : 0.5,
                cursor: canNext() ? 'pointer' : 'not-allowed',
              },
              onClick: function() { if (canNext()) setStep(step + 1); },
              disabled: !canNext(),
            }, step === 2 ? 'Go to Tracker' : 'Next')
          )
        )
      )
    )
  );
}

export default CampaignPlanner;