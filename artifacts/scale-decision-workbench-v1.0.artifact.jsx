/**
 * Scale Decision Workbench v1.0
 * Domain 2.5 — Analyze + Decide
 *
 * Ismokraft Product Testing System
 * Helps team analyze PPC test results, compare costs, and make Gate 2 scale decisions.
 *
 * Tabs: Cost Comparison | Keyword Analysis | Compliance Timeline | Costing Scenarios | Gate 2 Decision
 * Layout: Left nav product panel, header AI context panel, tabbed main content.
 *
 * Single-file React JSX artifact for Claude.ai. No external imports except React (global).
 */

const COLORS = {
  primary: '#2563eb',
  primaryLight: '#dbeafe',
  primaryDark: '#1d4ed8',
  success: '#16a34a',
  successLight: '#dcfce7',
  successBorder: '#86efac',
  warning: '#d97706',
  warningLight: '#fef3c7',
  warningBorder: '#fcd34d',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  dangerBorder: '#fca5a5',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  white: '#ffffff',
  noData: '#9ca3af',
  noDataLight: '#f3f4f6',
};

const TABS = [
  { id: 'cost', label: 'Cost Comparison' },
  { id: 'keywords', label: 'Keyword Analysis' },
  { id: 'compliance', label: 'Compliance Timeline' },
  { id: 'scenarios', label: 'Costing Scenarios' },
  { id: 'gate2', label: 'Gate 2 Decision' },
];

const DEFAULT_SCENARIOS = [
  { moq: 50, cogs: 650, sp: 1499, fees: 300, fixedCosts: 25000, monthlyUnits: 30 },
  { moq: 100, cogs: 600, sp: 1499, fees: 300, fixedCosts: 25000, monthlyUnits: 60 },
  { moq: 250, cogs: 540, sp: 1499, fees: 300, fixedCosts: 25000, monthlyUnits: 120 },
  { moq: 500, cogs: 490, sp: 1499, fees: 300, fixedCosts: 25000, monthlyUnits: 200 },
  { moq: 1000, cogs: 440, sp: 1499, fees: 300, fixedCosts: 25000, monthlyUnits: 350 },
];

const DEFAULT_COMPLIANCE_ITEMS = [
  { id: 1, name: 'BIS Certification (ISI Mark)', status: 'pending' },
  { id: 2, name: 'FSSAI License (if food contact)', status: 'pending' },
  { id: 3, name: 'Legal Metrology Declaration', status: 'pending' },
  { id: 4, name: 'Product Liability Insurance', status: 'pending' },
  { id: 5, name: 'GST Registration Verification', status: 'pending' },
];

/* ------------------------------------------------------------------ */
/* Utility helpers                                                     */
/* ------------------------------------------------------------------ */

function fmt(n, decimals = 1) {
  if (n === null || n === undefined || isNaN(n)) return '--';
  return Number(n).toFixed(decimals);
}

function fmtINR(n) {
  if (n === null || n === undefined || isNaN(n)) return '--';
  return '\u20B9' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtPct(n) {
  if (n === null || n === undefined || isNaN(n)) return '--';
  return fmt(n) + '%';
}

function parseDateStr(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/* CSV Parser (self-contained, no papaparse)                          */
/* ------------------------------------------------------------------ */

function parseCSV(text) {
  if (!text || !text.trim()) return [];
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = splitCSVLine(headerLine).map(h => h.trim().toLowerCase());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = splitCSVLine(lines[i]);
    if (vals.length === 0 || (vals.length === 1 && vals[0].trim() === '')) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] !== undefined ? vals[idx].trim() : '';
    });
    rows.push(row);
  }
  return rows;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function normalizeKeywordRow(raw) {
  const num = (key) => {
    const v = raw[key];
    if (v === undefined || v === '') return 0;
    return parseFloat(String(v).replace(/[^0-9.\-]/g, '')) || 0;
  };
  const str = (key) => raw[key] || '';

  const searchTerm =
    str('customer search term') || str('search term') || str('query') || str('keyword') || '';
  const impressions = num('impressions');
  const clicks = num('clicks');
  const orders =
    num('7 day total orders (#)') || num('orders') || num('total orders') || num('14 day total orders (#)') || 0;
  const spend = num('spend') || num('cost');
  const revenue =
    num('7 day total sales') || num('sales') || num('revenue') || num('7 day total sales ($)') || num('14 day total sales') || 0;

  const acos = revenue > 0 ? (spend / revenue) * 100 : spend > 0 ? Infinity : 0;
  const cvr = clicks > 0 ? (orders / clicks) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;

  return { searchTerm, impressions, clicks, orders, spend, revenue, acos, cvr, cpc };
}

/* ------------------------------------------------------------------ */
/* Shared style objects                                                */
/* ------------------------------------------------------------------ */

const cardStyle = {
  background: COLORS.white,
  borderRadius: 8,
  border: `1px solid ${COLORS.gray200}`,
  padding: 20,
  marginBottom: 16,
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: COLORS.gray600,
  marginBottom: 4,
};

const inputStyle = {
  width: '100%',
  padding: '6px 10px',
  border: `1px solid ${COLORS.gray300}`,
  borderRadius: 6,
  fontSize: 13,
  color: COLORS.gray800,
  outline: 'none',
  boxSizing: 'border-box',
};

const btnPrimary = {
  padding: '8px 18px',
  background: COLORS.primary,
  color: COLORS.white,
  border: 'none',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const btnDanger = {
  ...btnPrimary,
  background: COLORS.danger,
};

const btnSuccess = {
  ...btnPrimary,
  background: COLORS.success,
};

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: COLORS.gray600,
  borderBottom: `2px solid ${COLORS.gray200}`,
  background: COLORS.gray50,
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '8px 12px',
  fontSize: 13,
  color: COLORS.gray800,
  borderBottom: `1px solid ${COLORS.gray100}`,
};

const sectionTitle = {
  fontSize: 15,
  fontWeight: 700,
  color: COLORS.gray800,
  marginBottom: 12,
  marginTop: 0,
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function DeltaIndicator({ before, after, higherIsBetter }) {
  if (before === null || before === undefined || after === null || after === undefined) return null;
  const bv = parseFloat(before);
  const av = parseFloat(after);
  if (isNaN(bv) || isNaN(av) || bv === 0) return null;
  const pctChange = ((av - bv) / Math.abs(bv)) * 100;
  const improved = higherIsBetter ? av > bv : av < bv;
  const same = Math.abs(pctChange) < 0.5;
  const color = same ? COLORS.gray500 : improved ? COLORS.success : COLORS.danger;
  const arrow = same ? '--' : improved ? '\u25B2' : '\u25BC';
  return React.createElement(
    'span',
    { style: { color, fontWeight: 600, fontSize: 12, marginLeft: 6 } },
    arrow + ' ' + Math.abs(pctChange).toFixed(1) + '%'
  );
}

function StatusBadge({ status }) {
  const map = {
    PASS: { bg: COLORS.successLight, color: COLORS.success, border: COLORS.successBorder },
    WARNING: { bg: COLORS.warningLight, color: COLORS.warning, border: COLORS.warningBorder },
    BLOCK: { bg: COLORS.dangerLight, color: COLORS.danger, border: COLORS.dangerBorder },
    CONDITIONAL: { bg: COLORS.warningLight, color: COLORS.warning, border: COLORS.warningBorder },
    FAIL: { bg: COLORS.dangerLight, color: COLORS.danger, border: COLORS.dangerBorder },
  };
  const s = map[status] || { bg: COLORS.gray100, color: COLORS.gray500, border: COLORS.gray300 };
  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      },
    },
    status
  );
}

function BucketBadge({ bucket }) {
  const map = {
    Winner: { bg: COLORS.successLight, color: COLORS.success },
    Learner: { bg: COLORS.warningLight, color: COLORS.warning },
    Loser: { bg: COLORS.dangerLight, color: COLORS.danger },
    'No Data': { bg: COLORS.noDataLight, color: COLORS.noData },
  };
  const s = map[bucket] || map['No Data'];
  return React.createElement(
    'span',
    {
      style: {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      },
    },
    bucket
  );
}

function InputField({ label, value, onChange, type, placeholder, style: extraStyle }) {
  return React.createElement(
    'div',
    { style: { marginBottom: 10, ...extraStyle } },
    React.createElement('label', { style: labelStyle }, label),
    React.createElement('input', {
      style: inputStyle,
      type: type || 'number',
      value: value,
      onChange: (e) => onChange(e.target.value),
      placeholder: placeholder || '',
    })
  );
}

/* ================================================================== */
/* TAB 1: Cost Comparison                                              */
/* ================================================================== */

function CostComparisonTab({ costData, setCostData }) {
  const est = costData.estimate;
  const act = costData.actual;
  const test = costData.test;

  const update = (section, field, value) => {
    setCostData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const estMarginPct =
    est.sp && est.cogs ? (((est.sp - est.cogs) / est.sp) * 100) : null;
  const actMarginPct =
    act.sp && act.cogs ? (((act.sp - act.cogs) / act.sp) * 100) : null;

  const summaryVerdict = React.useMemo(() => {
    if (estMarginPct === null || actMarginPct === null) return null;
    const diff = actMarginPct - estMarginPct;
    if (Math.abs(diff) < 0.5) return { text: 'Actuals in line with estimates', color: COLORS.gray600 };
    if (diff > 0)
      return {
        text: `Actuals better than estimates by ${fmt(diff)}pp margin`,
        color: COLORS.success,
      };
    return {
      text: `Actuals worse than estimates by ${fmt(Math.abs(diff))}pp margin`,
      color: COLORS.danger,
    };
  }, [estMarginPct, actMarginPct]);

  const acosVerdict = React.useMemo(() => {
    const estBE = est.sp && est.cogs ? (((est.sp - est.cogs - 300) / est.sp) * 100) : null;
    const testAcos = parseFloat(test.acos);
    if (estBE === null || isNaN(testAcos)) return null;
    if (testAcos <= estBE) return { text: `Test ACoS (${fmtPct(testAcos)}) within breakeven (${fmtPct(estBE)})`, color: COLORS.success };
    return { text: `Test ACoS (${fmtPct(testAcos)}) exceeds breakeven (${fmtPct(estBE)})`, color: COLORS.danger };
  }, [est, test]);

  return React.createElement(
    'div',
    null,
    React.createElement('h3', { style: sectionTitle }, 'Cost Comparison: Estimate vs Actual vs Test'),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 } },

      /* CostEstimate (Domain 1) */
      React.createElement(
        'div',
        { style: { ...cardStyle, borderTop: `3px solid ${COLORS.primary}` } },
        React.createElement(
          'div',
          {
            style: {
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.primary,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
          },
          'CostEstimate (D1 Pre-Test)'
        ),
        React.createElement(InputField, {
          label: 'Estimated Selling Price (INR)',
          value: est.sp,
          onChange: (v) => update('estimate', 'sp', v),
          placeholder: '1499',
        }),
        React.createElement(InputField, {
          label: 'Estimated COGS (INR)',
          value: est.cogs,
          onChange: (v) => update('estimate', 'cogs', v),
          placeholder: '600',
        }),
        React.createElement(InputField, {
          label: 'Estimated Margin %',
          value: est.margin !== '' ? est.margin : (estMarginPct !== null ? fmt(estMarginPct) : ''),
          onChange: (v) => update('estimate', 'margin', v),
          placeholder: 'Auto-calculated',
        }),
        React.createElement(
          'div',
          { style: { padding: '8px 12px', background: COLORS.gray50, borderRadius: 6, fontSize: 12, color: COLORS.gray600 } },
          'Gross Margin: ',
          React.createElement('strong', null, estMarginPct !== null ? fmtPct(estMarginPct) : '--')
        )
      ),

      /* MarginRecord (Domain 2) */
      React.createElement(
        'div',
        { style: { ...cardStyle, borderTop: `3px solid ${COLORS.success}` } },
        React.createElement(
          'div',
          {
            style: {
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.success,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
          },
          'MarginRecord (D2 Actual)'
        ),
        React.createElement(InputField, {
          label: 'Confirmed Selling Price (INR)',
          value: act.sp,
          onChange: (v) => update('actual', 'sp', v),
          placeholder: '1499',
        }),
        React.createElement(InputField, {
          label: 'Confirmed COGS (INR)',
          value: act.cogs,
          onChange: (v) => update('actual', 'cogs', v),
          placeholder: '580',
        }),
        React.createElement(InputField, {
          label: 'Vendor Name',
          value: act.vendor,
          onChange: (v) => update('actual', 'vendor', v),
          type: 'text',
          placeholder: 'Supplier name',
        }),
        React.createElement(InputField, {
          label: 'Confirmed Margin %',
          value: act.margin !== '' ? act.margin : (actMarginPct !== null ? fmt(actMarginPct) : ''),
          onChange: (v) => update('actual', 'margin', v),
          placeholder: 'Auto-calculated',
        }),
        React.createElement(
          'div',
          { style: { padding: '8px 12px', background: COLORS.gray50, borderRadius: 6, fontSize: 12, color: COLORS.gray600, display: 'flex', alignItems: 'center' } },
          'Gross Margin: ',
          React.createElement('strong', null, actMarginPct !== null ? fmtPct(actMarginPct) : '--'),
          React.createElement(DeltaIndicator, { before: estMarginPct, after: actMarginPct, higherIsBetter: true })
        )
      ),

      /* TestActuals (Domain 2.5) */
      React.createElement(
        'div',
        { style: { ...cardStyle, borderTop: `3px solid ${COLORS.warning}` } },
        React.createElement(
          'div',
          {
            style: {
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.warning,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
          },
          'TestActuals (D2.5 PPC Results)'
        ),
        React.createElement(InputField, {
          label: 'Actual ACoS %',
          value: test.acos,
          onChange: (v) => update('test', 'acos', v),
          placeholder: '35',
        }),
        React.createElement(InputField, {
          label: 'ROAS',
          value: test.roas,
          onChange: (v) => update('test', 'roas', v),
          placeholder: '2.85',
        }),
        React.createElement(InputField, {
          label: 'Avg CPC (INR)',
          value: test.cpc,
          onChange: (v) => update('test', 'cpc', v),
          placeholder: '8.50',
        }),
        React.createElement(InputField, {
          label: 'CVR %',
          value: test.cvr,
          onChange: (v) => update('test', 'cvr', v),
          placeholder: '12',
        }),
        React.createElement(InputField, {
          label: 'Total Orders',
          value: test.orders,
          onChange: (v) => update('test', 'orders', v),
          placeholder: '15',
        })
      )
    ),

    /* Summary Verdict */
    React.createElement(
      'div',
      { style: { ...cardStyle, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 } },
      React.createElement('h4', { style: { margin: 0, fontSize: 14, color: COLORS.gray700 } }, 'Summary Verdict'),
      summaryVerdict
        ? React.createElement(
            'div',
            { style: { fontSize: 14, fontWeight: 600, color: summaryVerdict.color } },
            summaryVerdict.text
          )
        : React.createElement('div', { style: { fontSize: 13, color: COLORS.gray400 } }, 'Enter estimate and actual values to see comparison.'),
      acosVerdict
        ? React.createElement(
            'div',
            { style: { fontSize: 14, fontWeight: 600, color: acosVerdict.color } },
            acosVerdict.text
          )
        : null,

      /* Delta summary row */
      (est.sp && act.sp)
        ? React.createElement(
            'div',
            { style: { display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap' } },
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray600 } },
              'SP Delta: ',
              React.createElement('strong', null, fmtINR(act.sp - est.sp)),
              React.createElement(DeltaIndicator, { before: est.sp, after: act.sp, higherIsBetter: true })
            ),
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray600 } },
              'COGS Delta: ',
              React.createElement('strong', null, fmtINR(act.cogs - est.cogs)),
              React.createElement(DeltaIndicator, { before: est.cogs, after: act.cogs, higherIsBetter: false })
            ),
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray600 } },
              'Margin Delta: ',
              React.createElement('strong', null, fmtPct(actMarginPct - estMarginPct) + 'pp'),
              React.createElement(DeltaIndicator, { before: estMarginPct, after: actMarginPct, higherIsBetter: true })
            )
          )
        : null
    )
  );
}

/* ================================================================== */
/* TAB 2: Keyword Analysis                                             */
/* ================================================================== */

function KeywordAnalysisTab({ keywordData, setKeywordData, targetAcos }) {
  const [csvText, setCsvText] = React.useState('');
  const [sortCol, setSortCol] = React.useState('orders');
  const [sortDir, setSortDir] = React.useState('desc');

  const parsedRows = keywordData;

  const handleParse = () => {
    const raw = parseCSV(csvText);
    const normalized = raw.map(normalizeKeywordRow).filter((r) => r.searchTerm.trim() !== '');
    setKeywordData(normalized);
  };

  const classify = (row) => {
    const tgt = parseFloat(targetAcos) || 40;
    if (row.orders >= 3 && row.acos <= tgt && row.acos !== Infinity) return 'Winner';
    if (row.orders >= 1) return 'Learner';
    if (row.orders === 0 && row.spend > 100) return 'Loser';
    return 'No Data';
  };

  const sortedRows = React.useMemo(() => {
    if (!parsedRows.length) return [];
    return [...parsedRows].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [parsedRows, sortCol, sortDir]);

  const bucketCounts = React.useMemo(() => {
    const counts = { Winner: 0, Learner: 0, Loser: 0, 'No Data': 0 };
    parsedRows.forEach((r) => {
      counts[classify(r)]++;
    });
    return counts;
  }, [parsedRows, targetAcos]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const cols = [
    { key: 'searchTerm', label: 'Search Term' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'clicks', label: 'Clicks' },
    { key: 'orders', label: 'Orders' },
    { key: 'spend', label: 'Spend' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'acos', label: 'ACoS %' },
    { key: 'cvr', label: 'CVR %' },
    { key: 'cpc', label: 'CPC' },
  ];

  return React.createElement(
    'div',
    null,
    React.createElement('h3', { style: sectionTitle }, 'Keyword Analysis (Search Term Report)'),

    /* CSV Import Panel */
    React.createElement(
      'div',
      { style: cardStyle },
      React.createElement('label', { style: { ...labelStyle, marginBottom: 8 } }, 'Paste Amazon Search Term Report CSV below:'),
      React.createElement('textarea', {
        style: {
          width: '100%',
          minHeight: 120,
          padding: 10,
          border: `1px solid ${COLORS.gray300}`,
          borderRadius: 6,
          fontSize: 12,
          fontFamily: 'monospace',
          resize: 'vertical',
          boxSizing: 'border-box',
        },
        value: csvText,
        onChange: (e) => setCsvText(e.target.value),
        placeholder:
          'Customer Search Term,Impressions,Clicks,Spend,7 Day Total Orders (#),7 Day Total Sales\nwooden tray,12500,180,1520,12,17988\nserving tray wooden,8300,95,760,5,7495\n...',
      }),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' } },
        React.createElement(
          'button',
          { style: btnPrimary, onClick: handleParse },
          'Parse CSV'
        ),
        React.createElement(
          'span',
          { style: { fontSize: 12, color: COLORS.gray500 } },
          parsedRows.length > 0 ? `${parsedRows.length} rows parsed` : 'No data yet'
        ),
        React.createElement(
          'div',
          { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement('label', { style: { fontSize: 12, color: COLORS.gray600, fontWeight: 600 } }, 'Target ACoS %:'),
          React.createElement('input', {
            style: { ...inputStyle, width: 70, textAlign: 'center' },
            type: 'number',
            value: targetAcos,
            readOnly: true,
          })
        )
      )
    ),

    /* Bucket Summary Bar */
    parsedRows.length > 0 &&
      React.createElement(
        'div',
        { style: { ...cardStyle, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' } },
        React.createElement(
          'div',
          {
            style: {
              fontSize: 22,
              fontWeight: 800,
              color: COLORS.success,
              minWidth: 140,
            },
          },
          bucketCounts.Winner,
          React.createElement('span', { style: { fontSize: 13, fontWeight: 600, marginLeft: 6 } }, 'Viable Keywords')
        ),
        React.createElement(
          'div',
          { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
          [
            ['Winner', COLORS.success, COLORS.successLight],
            ['Learner', COLORS.warning, COLORS.warningLight],
            ['Loser', COLORS.danger, COLORS.dangerLight],
            ['No Data', COLORS.noData, COLORS.noDataLight],
          ].map(([label, color, bg]) =>
            React.createElement(
              'div',
              {
                key: label,
                style: {
                  padding: '6px 14px',
                  borderRadius: 8,
                  background: bg,
                  fontSize: 13,
                  fontWeight: 600,
                  color: color,
                },
              },
              bucketCounts[label] + ' ' + label + (bucketCounts[label] !== 1 ? 's' : '')
            )
          )
        )
      ),

    /* Data Table */
    parsedRows.length > 0 &&
      React.createElement(
        'div',
        { style: { ...cardStyle, padding: 0, overflow: 'auto' } },
        React.createElement(
          'table',
          { style: { width: '100%', borderCollapse: 'collapse' } },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement('th', { style: thStyle }, 'Bucket'),
              cols.map((c) =>
                React.createElement(
                  'th',
                  {
                    key: c.key,
                    style: { ...thStyle, cursor: 'pointer', userSelect: 'none' },
                    onClick: () => handleSort(c.key),
                  },
                  c.label,
                  sortCol === c.key
                    ? React.createElement(
                        'span',
                        { style: { marginLeft: 4 } },
                        sortDir === 'asc' ? '\u25B2' : '\u25BC'
                      )
                    : null
                )
              )
            )
          ),
          React.createElement(
            'tbody',
            null,
            sortedRows.map((row, i) => {
              const bucket = classify(row);
              return React.createElement(
                'tr',
                { key: i, style: { background: i % 2 === 0 ? COLORS.white : COLORS.gray50 } },
                React.createElement('td', { style: tdStyle }, React.createElement(BucketBadge, { bucket })),
                React.createElement('td', { style: { ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' } }, row.searchTerm),
                React.createElement('td', { style: { ...tdStyle, textAlign: 'right' } }, row.impressions.toLocaleString()),
                React.createElement('td', { style: { ...tdStyle, textAlign: 'right' } }, row.clicks.toLocaleString()),
                React.createElement('td', { style: { ...tdStyle, textAlign: 'right', fontWeight: 600 } }, row.orders),
                React.createElement('td', { style: { ...tdStyle, textAlign: 'right' } }, fmtINR(row.spend)),
                React.createElement('td', { style: { ...tdStyle, textAlign: 'right' } }, fmtINR(row.revenue)),
                React.createElement(
                  'td',
                  { style: { ...tdStyle, textAlign: 'right', color: row.acos === Infinity ? COLORS.danger : row.acos <= (parseFloat(targetAcos) || 40) ? COLORS.success : COLORS.danger, fontWeight: 600 } },
                  row.acos === Infinity ? 'INF' : fmtPct(row.acos)
                ),
                React.createElement('td', { style: { ...tdStyle, textAlign: 'right' } }, fmtPct(row.cvr)),
                React.createElement('td', { style: { ...tdStyle, textAlign: 'right' } }, fmtINR(row.cpc))
              );
            })
          )
        )
      )
  );
}

/* ================================================================== */
/* TAB 3: Compliance Timeline                                          */
/* ================================================================== */

function ComplianceTimelineTab({ complianceData, setComplianceData }) {
  const {
    expectedCompletion,
    proposedLaunch,
    items,
  } = complianceData;

  const update = (field, value) => {
    setComplianceData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleItem = (id) => {
    setComplianceData((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === id
          ? {
              ...it,
              status: it.status === 'done' ? 'pending' : it.status === 'pending' ? 'in-progress' : it.status === 'in-progress' ? 'done' : 'pending',
            }
          : it
      ),
    }));
  };

  const addItem = () => {
    setComplianceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), name: 'New compliance item', status: 'pending' },
      ],
    }));
  };

  const removeItem = (id) => {
    setComplianceData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const updateItemName = (id, name) => {
    setComplianceData((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, name } : it)),
    }));
  };

  const completionDate = parseDateStr(expectedCompletion);
  const launchDate = parseDateStr(proposedLaunch);

  const timelineStatus = React.useMemo(() => {
    if (!completionDate || !launchDate) return null;
    const gap = daysBetween(completionDate, launchDate);
    if (gap === null) return null;
    if (gap < 0) return 'BLOCK';
    if (gap <= 14) return 'WARNING';
    return 'PASS';
  }, [completionDate, launchDate]);

  const gapDays = completionDate && launchDate ? daysBetween(completionDate, launchDate) : null;

  const statusColorMap = {
    pending: { bg: COLORS.gray100, color: COLORS.gray500, label: 'Pending' },
    'in-progress': { bg: COLORS.warningLight, color: COLORS.warning, label: 'In Progress' },
    done: { bg: COLORS.successLight, color: COLORS.success, label: 'Done' },
  };

  return React.createElement(
    'div',
    null,
    React.createElement('h3', { style: sectionTitle }, 'Compliance Timeline Check'),

    /* Date Inputs */
    React.createElement(
      'div',
      { style: { ...cardStyle, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, alignItems: 'end' } },
      React.createElement(InputField, {
        label: 'Expected Compliance Completion',
        value: expectedCompletion,
        onChange: (v) => update('expectedCompletion', v),
        type: 'date',
      }),
      React.createElement(InputField, {
        label: 'Proposed Launch Date',
        value: proposedLaunch,
        onChange: (v) => update('proposedLaunch', v),
        type: 'date',
      }),
      React.createElement(
        'div',
        { style: { marginBottom: 10 } },
        React.createElement('label', { style: labelStyle }, 'Status'),
        React.createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          timelineStatus
            ? React.createElement(StatusBadge, { status: timelineStatus })
            : React.createElement('span', { style: { fontSize: 13, color: COLORS.gray400 } }, 'Enter both dates'),
          gapDays !== null &&
            React.createElement(
              'span',
              { style: { fontSize: 12, color: COLORS.gray600 } },
              gapDays >= 0
                ? `${gapDays} days buffer`
                : `${Math.abs(gapDays)} days overdue`
            )
        )
      )
    ),

    /* Timeline Visual */
    timelineStatus &&
      React.createElement(
        'div',
        {
          style: {
            ...cardStyle,
            background:
              timelineStatus === 'PASS'
                ? COLORS.successLight
                : timelineStatus === 'WARNING'
                ? COLORS.warningLight
                : COLORS.dangerLight,
          },
        },
        React.createElement(
          'div',
          { style: { fontSize: 14, fontWeight: 600, color: timelineStatus === 'PASS' ? COLORS.success : timelineStatus === 'WARNING' ? COLORS.warning : COLORS.danger } },
          timelineStatus === 'PASS'
            ? 'Compliance is expected to complete before launch date. Clear to proceed.'
            : timelineStatus === 'WARNING'
            ? 'Compliance completion is within 2 weeks of launch. Monitor closely.'
            : 'Compliance will NOT complete before launch. Launch must be delayed or compliance expedited.'
        )
      ),

    /* Compliance Items */
    React.createElement(
      'div',
      { style: cardStyle },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
        React.createElement('h4', { style: { margin: 0, fontSize: 14, color: COLORS.gray700 } }, 'Compliance Items'),
        React.createElement(
          'button',
          {
            style: { ...btnPrimary, padding: '4px 12px', fontSize: 12 },
            onClick: addItem,
          },
          '+ Add Item'
        )
      ),
      items.map((item) => {
        const sc = statusColorMap[item.status] || statusColorMap.pending;
        return React.createElement(
          'div',
          {
            key: item.id,
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              marginBottom: 6,
              background: sc.bg,
              borderRadius: 6,
              border: `1px solid ${COLORS.gray200}`,
            },
          },
          React.createElement(
            'button',
            {
              style: {
                width: 28,
                height: 28,
                borderRadius: 14,
                border: `2px solid ${sc.color}`,
                background: item.status === 'done' ? sc.color : 'transparent',
                color: item.status === 'done' ? COLORS.white : sc.color,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              },
              onClick: () => toggleItem(item.id),
              title: 'Toggle: pending -> in-progress -> done',
            },
            item.status === 'done' ? '\u2713' : item.status === 'in-progress' ? '\u25B6' : ''
          ),
          React.createElement('input', {
            style: {
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 13,
              color: COLORS.gray800,
              outline: 'none',
              textDecoration: item.status === 'done' ? 'line-through' : 'none',
            },
            value: item.name,
            onChange: (e) => updateItemName(item.id, e.target.value),
          }),
          React.createElement(
            'span',
            { style: { fontSize: 11, fontWeight: 600, color: sc.color, minWidth: 70, textAlign: 'center' } },
            sc.label
          ),
          React.createElement(
            'button',
            {
              style: {
                background: 'none',
                border: 'none',
                color: COLORS.gray400,
                cursor: 'pointer',
                fontSize: 16,
                padding: '0 4px',
              },
              onClick: () => removeItem(item.id),
              title: 'Remove item',
            },
            '\u00D7'
          )
        );
      })
    )
  );
}

/* ================================================================== */
/* TAB 4: Costing Scenarios                                            */
/* ================================================================== */

function CostingScenariosTab({ scenarios, setScenarios }) {
  const updateCell = (idx, field, value) => {
    setScenarios((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setScenarios((prev) => [
      ...prev,
      { moq: 0, cogs: 0, sp: 1499, fees: 300, fixedCosts: 25000, monthlyUnits: 0 },
    ]);
  };

  const removeRow = (idx) => {
    setScenarios((prev) => prev.filter((_, i) => i !== idx));
  };

  const computed = React.useMemo(() => {
    return scenarios.map((row) => {
      const sp = parseFloat(row.sp) || 0;
      const cogs = parseFloat(row.cogs) || 0;
      const fees = parseFloat(row.fees) || 0;
      const fixedCosts = parseFloat(row.fixedCosts) || 0;
      const monthlyUnits = parseFloat(row.monthlyUnits) || 0;
      const moq = parseFloat(row.moq) || 0;

      const netMarginPerUnit = sp - cogs - fees;
      const netMarginPct = sp > 0 ? (netMarginPerUnit / sp) * 100 : 0;
      const breakeven = netMarginPerUnit > 0 ? Math.ceil(fixedCosts / netMarginPerUnit) : Infinity;
      const totalInvestment = moq * cogs;
      const monthlyRevenue = monthlyUnits * sp;

      return { netMarginPerUnit, netMarginPct, breakeven, totalInvestment, monthlyRevenue };
    });
  }, [scenarios]);

  const bestIdx = React.useMemo(() => {
    let best = -1;
    let bestVal = -Infinity;
    computed.forEach((c, i) => {
      if (c.netMarginPct > bestVal) {
        bestVal = c.netMarginPct;
        best = i;
      }
    });
    return best;
  }, [computed]);

  const editableCols = [
    { key: 'moq', label: 'MOQ', width: 70 },
    { key: 'cogs', label: 'COGS/Unit (INR)', width: 110 },
    { key: 'sp', label: 'Selling Price (INR)', width: 120 },
    { key: 'fees', label: 'Fees/Unit (INR)', width: 110 },
    { key: 'fixedCosts', label: 'Fixed Costs (INR)', width: 120 },
    { key: 'monthlyUnits', label: 'Monthly Units (Est)', width: 120 },
  ];

  const computedCols = [
    { key: 'netMarginPct', label: 'Net Margin %', format: (v) => fmtPct(v) },
    { key: 'breakeven', label: 'Breakeven Units', format: (v) => (v === Infinity ? '--' : v.toLocaleString()) },
    { key: 'totalInvestment', label: 'Total Investment', format: (v) => fmtINR(v) },
    { key: 'monthlyRevenue', label: 'Monthly Revenue', format: (v) => fmtINR(v) },
  ];

  return React.createElement(
    'div',
    null,
    React.createElement('h3', { style: sectionTitle }, 'Costing Scenarios (Bulk Order Comparison)'),
    React.createElement(
      'div',
      { style: { ...cardStyle, padding: 0, overflow: 'auto' } },
      React.createElement(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement('th', { style: { ...thStyle, width: 36 } }, '#'),
            editableCols.map((c) =>
              React.createElement('th', { key: c.key, style: { ...thStyle, minWidth: c.width } }, c.label)
            ),
            computedCols.map((c) =>
              React.createElement(
                'th',
                { key: c.key, style: { ...thStyle, background: COLORS.primaryLight, color: COLORS.primaryDark } },
                c.label
              )
            ),
            React.createElement('th', { style: { ...thStyle, width: 36 } }, '')
          )
        ),
        React.createElement(
          'tbody',
          null,
          scenarios.map((row, i) => {
            const isBest = i === bestIdx;
            const rowBg = isBest ? '#eff6ff' : i % 2 === 0 ? COLORS.white : COLORS.gray50;
            return React.createElement(
              'tr',
              { key: i, style: { background: rowBg } },
              React.createElement(
                'td',
                { style: { ...tdStyle, textAlign: 'center', fontWeight: 600, color: isBest ? COLORS.primary : COLORS.gray500 } },
                isBest ? '\u2605' : i + 1
              ),
              editableCols.map((c) =>
                React.createElement(
                  'td',
                  { key: c.key, style: { ...tdStyle, padding: '4px 6px' } },
                  React.createElement('input', {
                    style: {
                      ...inputStyle,
                      textAlign: 'right',
                      background: isBest ? '#dbeafe' : COLORS.white,
                      fontWeight: isBest ? 600 : 400,
                    },
                    type: 'number',
                    value: row[c.key],
                    onChange: (e) => updateCell(i, c.key, e.target.value),
                  })
                )
              ),
              computedCols.map((c) =>
                React.createElement(
                  'td',
                  {
                    key: c.key,
                    style: {
                      ...tdStyle,
                      textAlign: 'right',
                      fontWeight: 600,
                      color:
                        c.key === 'netMarginPct'
                          ? computed[i].netMarginPct >= 15
                            ? COLORS.success
                            : computed[i].netMarginPct >= 10
                            ? COLORS.warning
                            : COLORS.danger
                          : COLORS.gray800,
                    },
                  },
                  c.format(computed[i][c.key])
                )
              ),
              React.createElement(
                'td',
                { style: { ...tdStyle, textAlign: 'center' } },
                React.createElement(
                  'button',
                  {
                    style: { background: 'none', border: 'none', color: COLORS.gray400, cursor: 'pointer', fontSize: 16 },
                    onClick: () => removeRow(i),
                    title: 'Remove row',
                  },
                  '\u00D7'
                )
              )
            );
          })
        )
      )
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' } },
      React.createElement('button', { style: { ...btnPrimary, padding: '6px 14px', fontSize: 12 }, onClick: addRow }, '+ Add Scenario'),
      React.createElement(
        'span',
        { style: { fontSize: 12, color: COLORS.gray500 } },
        'Formulas: Net Margin = (SP - COGS - Fees) / SP. Breakeven = Fixed Costs / Margin per unit.'
      )
    ),

    /* Best scenario callout */
    bestIdx >= 0 &&
      React.createElement(
        'div',
        {
          style: {
            ...cardStyle,
            marginTop: 16,
            background: COLORS.primaryLight,
            borderColor: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          },
        },
        React.createElement(
          'div',
          { style: { fontSize: 22, color: COLORS.primary } },
          '\u2605'
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { style: { fontSize: 14, fontWeight: 700, color: COLORS.primaryDark } },
            `Best margin: MOQ ${scenarios[bestIdx].moq} at ${fmtPct(computed[bestIdx].netMarginPct)} net margin`
          ),
          React.createElement(
            'div',
            { style: { fontSize: 12, color: COLORS.gray600 } },
            `Investment: ${fmtINR(computed[bestIdx].totalInvestment)} | Breakeven: ${computed[bestIdx].breakeven === Infinity ? '--' : computed[bestIdx].breakeven + ' units'} | Est Monthly Revenue: ${fmtINR(computed[bestIdx].monthlyRevenue)}`
          )
        )
      )
  );
}

/* ================================================================== */
/* TAB 5: Gate 2 Decision                                              */
/* ================================================================== */

function Gate2DecisionTab({
  costData,
  keywordData,
  complianceData,
  scenarios,
  targetAcos,
  gate2State,
  setGate2State,
}) {
  const { manualOverrides, scaleDecision, killDecision, recordedDecision } = gate2State;

  const update = (field, value) => {
    setGate2State((prev) => ({ ...prev, [field]: value }));
  };

  const updateScale = (field, value) => {
    setGate2State((prev) => ({
      ...prev,
      scaleDecision: { ...prev.scaleDecision, [field]: value },
    }));
  };

  const updateKill = (field, value) => {
    setGate2State((prev) => ({
      ...prev,
      killDecision: { ...prev.killDecision, [field]: value },
    }));
  };

  const toggleManual = (key) => {
    setGate2State((prev) => ({
      ...prev,
      manualOverrides: {
        ...prev.manualOverrides,
        [key]: prev.manualOverrides[key] === 'pass' ? 'fail' : prev.manualOverrides[key] === 'fail' ? 'unset' : 'pass',
      },
    }));
  };

  /* Auto-derive criteria from other tabs */
  const tgt = parseFloat(targetAcos) || 40;

  const winnerCount = React.useMemo(() => {
    return keywordData.filter((r) => r.orders >= 3 && r.acos <= tgt && r.acos !== Infinity).length;
  }, [keywordData, tgt]);

  const blendedAcos = React.useMemo(() => {
    if (keywordData.length === 0) return null;
    const totalSpend = keywordData.reduce((s, r) => s + r.spend, 0);
    const totalRevenue = keywordData.reduce((s, r) => s + r.revenue, 0);
    return totalRevenue > 0 ? (totalSpend / totalRevenue) * 100 : Infinity;
  }, [keywordData]);

  const breakevenAcos = React.useMemo(() => {
    const sp = parseFloat(costData.actual.sp) || parseFloat(costData.estimate.sp) || 0;
    const cogs = parseFloat(costData.actual.cogs) || parseFloat(costData.estimate.cogs) || 0;
    if (sp === 0) return null;
    return ((sp - cogs - 300) / sp) * 100;
  }, [costData]);

  const dataQuality = React.useMemo(() => {
    if (keywordData.length === 0) return null;
    const kwWithData = keywordData.filter((r) => r.impressions >= 100).length;
    const kwHighVol = keywordData.filter((r) => r.impressions >= 1000).length;
    if (kwHighVol >= 5) return 'HIGH';
    if (kwWithData >= 3) return 'MEDIUM';
    return 'LOW';
  }, [keywordData]);

  const complianceStatus = React.useMemo(() => {
    const comp = parseDateStr(complianceData.expectedCompletion);
    const launch = parseDateStr(complianceData.proposedLaunch);
    if (!comp || !launch) return null;
    const gap = daysBetween(comp, launch);
    if (gap < 0) return 'BLOCK';
    if (gap <= 14) return 'WARNING';
    return 'PASS';
  }, [complianceData]);

  /* Criteria evaluation */
  const criteria = [
    {
      key: 'keywords',
      label: 'Keyword-level margin positive on >= 3 keywords',
      auto: keywordData.length > 0 ? (winnerCount >= 3 ? 'pass' : 'fail') : null,
      detail: keywordData.length > 0 ? `${winnerCount} winning keywords found` : 'No keyword data imported',
    },
    {
      key: 'acos',
      label: 'Blended ACoS <= breakeven ACoS',
      auto:
        blendedAcos !== null && breakevenAcos !== null
          ? blendedAcos <= breakevenAcos
            ? 'pass'
            : 'fail'
          : null,
      detail:
        blendedAcos !== null && breakevenAcos !== null
          ? `Blended ACoS: ${blendedAcos === Infinity ? 'INF' : fmtPct(blendedAcos)} vs Breakeven: ${fmtPct(breakevenAcos)}`
          : 'Enter cost data and import keywords',
    },
    {
      key: 'dataQuality',
      label: 'Data quality HIGH or MEDIUM',
      auto: dataQuality ? (dataQuality === 'LOW' ? 'fail' : 'pass') : null,
      detail: dataQuality ? `Data quality: ${dataQuality}` : 'No keyword data imported',
    },
    {
      key: 'compliance',
      label: 'Compliance timeline PASS or accepted WARNING',
      auto: complianceStatus
        ? complianceStatus === 'PASS'
          ? 'pass'
          : complianceStatus === 'WARNING'
          ? 'warning'
          : 'fail'
        : null,
      detail: complianceStatus ? `Timeline status: ${complianceStatus}` : 'Enter compliance dates',
    },
  ];

  const resolvedCriteria = criteria.map((c) => {
    const manual = manualOverrides[c.key];
    const resolved = manual && manual !== 'unset' ? manual : c.auto;
    return { ...c, resolved };
  });

  const overallVerdict = React.useMemo(() => {
    const resolved = resolvedCriteria.map((c) => c.resolved);
    if (resolved.some((r) => r === 'fail')) return 'FAIL';
    if (resolved.some((r) => r === null || r === 'unset' || r === 'warning')) return 'CONDITIONAL';
    return 'PASS';
  }, [resolvedCriteria]);

  const handleRecordScale = () => {
    update('recordedDecision', {
      type: 'SCALE',
      timestamp: new Date().toISOString(),
      verdict: overallVerdict,
      quantity: scaleDecision.quantity,
      targetLandedCost: scaleDecision.targetLandedCost,
      maxMOQ: scaleDecision.maxMOQ,
      launchTimeline: scaleDecision.launchTimeline,
      criteria: resolvedCriteria.map((c) => ({ label: c.label, status: c.resolved })),
    });
  };

  const handleRecordKill = () => {
    update('recordedDecision', {
      type: 'KILL',
      timestamp: new Date().toISOString(),
      verdict: 'FAIL',
      reason: killDecision.reason,
      criteria: resolvedCriteria.map((c) => ({ label: c.label, status: c.resolved })),
    });
  };

  const clearDecision = () => {
    update('recordedDecision', null);
  };

  return React.createElement(
    'div',
    null,
    React.createElement('h3', { style: sectionTitle }, 'Gate 2 Scale Decision'),

    /* Criteria Checklist */
    React.createElement(
      'div',
      { style: cardStyle },
      React.createElement('h4', { style: { margin: '0 0 12px 0', fontSize: 14, color: COLORS.gray700 } }, 'Gate 2 Criteria'),
      resolvedCriteria.map((c) => {
        const isPass = c.resolved === 'pass';
        const isFail = c.resolved === 'fail';
        const isWarning = c.resolved === 'warning';
        const color = isPass ? COLORS.success : isFail ? COLORS.danger : isWarning ? COLORS.warning : COLORS.gray400;
        const icon = isPass ? '\u2713' : isFail ? '\u2717' : isWarning ? '\u26A0' : '\u2014';
        const bg = isPass
          ? COLORS.successLight
          : isFail
          ? COLORS.dangerLight
          : isWarning
          ? COLORS.warningLight
          : COLORS.gray50;

        return React.createElement(
          'div',
          {
            key: c.key,
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              marginBottom: 6,
              background: bg,
              borderRadius: 6,
              border: `1px solid ${COLORS.gray200}`,
            },
          },
          React.createElement(
            'span',
            { style: { fontSize: 18, color, fontWeight: 700, width: 24, textAlign: 'center', flexShrink: 0 } },
            icon
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: COLORS.gray800 } }, c.label),
            React.createElement('div', { style: { fontSize: 11, color: COLORS.gray500, marginTop: 2 } }, c.detail)
          ),
          React.createElement(
            'button',
            {
              style: {
                padding: '4px 10px',
                borderRadius: 4,
                border: `1px solid ${COLORS.gray300}`,
                background: COLORS.white,
                fontSize: 11,
                cursor: 'pointer',
                color: COLORS.gray600,
              },
              onClick: () => toggleManual(c.key),
              title: 'Manual override: cycle pass -> fail -> auto',
            },
            manualOverrides[c.key] && manualOverrides[c.key] !== 'unset' ? `Override: ${manualOverrides[c.key].toUpperCase()}` : 'Manual'
          )
        );
      })
    ),

    /* Overall Verdict */
    React.createElement(
      'div',
      {
        style: {
          ...cardStyle,
          textAlign: 'center',
          background:
            overallVerdict === 'PASS'
              ? COLORS.successLight
              : overallVerdict === 'CONDITIONAL'
              ? COLORS.warningLight
              : COLORS.dangerLight,
          borderColor:
            overallVerdict === 'PASS'
              ? COLORS.successBorder
              : overallVerdict === 'CONDITIONAL'
              ? COLORS.warningBorder
              : COLORS.dangerBorder,
        },
      },
      React.createElement(
        'div',
        { style: { fontSize: 12, color: COLORS.gray600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 } },
        'Overall Verdict'
      ),
      React.createElement(
        'div',
        {
          style: {
            fontSize: 28,
            fontWeight: 800,
            color:
              overallVerdict === 'PASS'
                ? COLORS.success
                : overallVerdict === 'CONDITIONAL'
                ? COLORS.warning
                : COLORS.danger,
          },
        },
        overallVerdict
      ),
      React.createElement(
        'div',
        { style: { fontSize: 12, color: COLORS.gray600, marginTop: 4 } },
        overallVerdict === 'PASS'
          ? 'All criteria met. Ready to commit to scale.'
          : overallVerdict === 'CONDITIONAL'
          ? 'Some criteria require review or override. Proceed with caution.'
          : 'One or more criteria failed. Address issues before scaling.'
      )
    ),

    /* Decision Recording (only show if no recorded decision) */
    !recordedDecision &&
      React.createElement(
        'div',
        { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } },

        /* Scale Decision */
        React.createElement(
          'div',
          { style: { ...cardStyle, borderTop: `3px solid ${COLORS.success}` } },
          React.createElement('h4', { style: { margin: '0 0 12px 0', fontSize: 14, color: COLORS.success } }, 'Record Scale Decision'),
          React.createElement(InputField, {
            label: 'Bulk Order Quantity',
            value: scaleDecision.quantity,
            onChange: (v) => updateScale('quantity', v),
            placeholder: '500',
          }),
          React.createElement(InputField, {
            label: 'Target Landed Cost (INR/unit)',
            value: scaleDecision.targetLandedCost,
            onChange: (v) => updateScale('targetLandedCost', v),
            placeholder: '520',
          }),
          React.createElement(InputField, {
            label: 'Max Acceptable MOQ',
            value: scaleDecision.maxMOQ,
            onChange: (v) => updateScale('maxMOQ', v),
            placeholder: '1000',
          }),
          React.createElement(InputField, {
            label: 'Launch Timeline',
            value: scaleDecision.launchTimeline,
            onChange: (v) => updateScale('launchTimeline', v),
            type: 'text',
            placeholder: '6-8 weeks from order',
          }),
          React.createElement(
            'button',
            {
              style: { ...btnSuccess, width: '100%', marginTop: 8 },
              onClick: handleRecordScale,
            },
            'Record Scale Decision'
          )
        ),

        /* Kill Decision */
        React.createElement(
          'div',
          { style: { ...cardStyle, borderTop: `3px solid ${COLORS.danger}` } },
          React.createElement('h4', { style: { margin: '0 0 12px 0', fontSize: 14, color: COLORS.danger } }, 'Record Kill Decision'),
          React.createElement(
            'div',
            { style: { marginBottom: 10 } },
            React.createElement('label', { style: labelStyle }, 'Reason for Kill'),
            React.createElement('textarea', {
              style: {
                ...inputStyle,
                minHeight: 120,
                resize: 'vertical',
                fontFamily: 'inherit',
              },
              value: killDecision.reason,
              onChange: (e) => updateKill('reason', e.target.value),
              placeholder: 'Unit economics not viable at any MOQ. Blended ACoS 52% vs breakeven 28%. Only 1 winning keyword with insufficient volume for bulk economics.',
            })
          ),
          React.createElement(
            'button',
            {
              style: { ...btnDanger, width: '100%', marginTop: 8 },
              onClick: handleRecordKill,
            },
            'Record Kill Decision'
          )
        )
      ),

    /* Recorded Decision Summary Card */
    recordedDecision &&
      React.createElement(
        'div',
        {
          style: {
            ...cardStyle,
            borderTop: `4px solid ${recordedDecision.type === 'SCALE' ? COLORS.success : COLORS.danger}`,
            background: recordedDecision.type === 'SCALE' ? '#f0fdf4' : '#fef2f2',
          },
        },
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
          React.createElement(
            'div',
            null,
            React.createElement(
              'div',
              {
                style: {
                  fontSize: 18,
                  fontWeight: 800,
                  color: recordedDecision.type === 'SCALE' ? COLORS.success : COLORS.danger,
                  marginBottom: 4,
                },
              },
              recordedDecision.type === 'SCALE' ? 'SCALE DECISION RECORDED' : 'KILL DECISION RECORDED'
            ),
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray500 } },
              'Recorded: ' + new Date(recordedDecision.timestamp).toLocaleString()
            )
          ),
          React.createElement(
            'button',
            {
              style: { background: 'none', border: `1px solid ${COLORS.gray300}`, borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: COLORS.gray500 },
              onClick: clearDecision,
            },
            'Clear & Re-decide'
          )
        ),
        React.createElement('hr', { style: { border: 'none', borderTop: `1px solid ${COLORS.gray200}`, margin: '12px 0' } }),
        recordedDecision.type === 'SCALE'
          ? React.createElement(
              'div',
              { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              [
                ['Quantity', recordedDecision.quantity],
                ['Target Landed Cost', fmtINR(recordedDecision.targetLandedCost)],
                ['Max MOQ', recordedDecision.maxMOQ],
                ['Launch Timeline', recordedDecision.launchTimeline],
                ['Verdict', recordedDecision.verdict],
              ].map(([label, val]) =>
                React.createElement(
                  'div',
                  { key: label },
                  React.createElement('div', { style: { fontSize: 11, color: COLORS.gray500, textTransform: 'uppercase' } }, label),
                  React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: COLORS.gray800 } }, val || '--')
                )
              )
            )
          : React.createElement(
              'div',
              null,
              React.createElement('div', { style: { fontSize: 11, color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 4 } }, 'Kill Reason'),
              React.createElement('div', { style: { fontSize: 13, color: COLORS.gray800, whiteSpace: 'pre-wrap' } }, recordedDecision.reason || '--')
            ),
        React.createElement('hr', { style: { border: 'none', borderTop: `1px solid ${COLORS.gray200}`, margin: '12px 0' } }),
        React.createElement(
          'div',
          { style: { fontSize: 11, color: COLORS.gray500, marginBottom: 6, textTransform: 'uppercase' } },
          'Criteria at Decision Time'
        ),
        recordedDecision.criteria.map((c, i) =>
          React.createElement(
            'div',
            { key: i, style: { display: 'flex', gap: 8, fontSize: 12, color: COLORS.gray600, marginBottom: 2 } },
            React.createElement(
              'span',
              {
                style: {
                  color:
                    c.status === 'pass'
                      ? COLORS.success
                      : c.status === 'fail'
                      ? COLORS.danger
                      : c.status === 'warning'
                      ? COLORS.warning
                      : COLORS.gray400,
                  fontWeight: 700,
                },
              },
              c.status === 'pass' ? '\u2713' : c.status === 'fail' ? '\u2717' : c.status === 'warning' ? '\u26A0' : '\u2014'
            ),
            React.createElement('span', null, c.label)
          )
        )
      )
  );
}

/* ================================================================== */
/* Main Component                                                      */
/* ================================================================== */

function ScaleDecisionWorkbench() {
  const [activeTab, setActiveTab] = React.useState('cost');
  const [productName, setProductName] = React.useState('');
  const [targetAcos, setTargetAcos] = React.useState(40);

  /* Tab 1 state */
  const [costData, setCostData] = React.useState({
    estimate: { sp: '', cogs: '', margin: '' },
    actual: { sp: '', cogs: '', vendor: '', margin: '' },
    test: { acos: '', roas: '', cpc: '', cvr: '', orders: '' },
  });

  /* Tab 2 state */
  const [keywordData, setKeywordData] = React.useState([]);

  /* Tab 3 state */
  const [complianceData, setComplianceData] = React.useState({
    expectedCompletion: '',
    proposedLaunch: '',
    items: DEFAULT_COMPLIANCE_ITEMS.map((it) => ({ ...it })),
  });

  /* Tab 4 state */
  const [scenarios, setScenarios] = React.useState(
    DEFAULT_SCENARIOS.map((s) => ({ ...s }))
  );

  /* Tab 5 state */
  const [gate2State, setGate2State] = React.useState({
    manualOverrides: { keywords: 'unset', acos: 'unset', dataQuality: 'unset', compliance: 'unset' },
    scaleDecision: { quantity: '', targetLandedCost: '', maxMOQ: '', launchTimeline: '' },
    killDecision: { reason: '' },
    recordedDecision: null,
  });

  /* Render tab content */
  const tabContent = React.useMemo(() => {
    switch (activeTab) {
      case 'cost':
        return React.createElement(CostComparisonTab, { costData, setCostData });
      case 'keywords':
        return React.createElement(KeywordAnalysisTab, { keywordData, setKeywordData, targetAcos });
      case 'compliance':
        return React.createElement(ComplianceTimelineTab, { complianceData, setComplianceData });
      case 'scenarios':
        return React.createElement(CostingScenariosTab, { scenarios, setScenarios });
      case 'gate2':
        return React.createElement(Gate2DecisionTab, {
          costData,
          keywordData,
          complianceData,
          scenarios,
          targetAcos,
          gate2State,
          setGate2State,
        });
      default:
        return null;
    }
  }, [activeTab, costData, keywordData, complianceData, scenarios, gate2State, targetAcos]);

  return React.createElement(
    'div',
    {
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: COLORS.gray800,
        background: COLORS.gray50,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      },
    },

    /* ---- Header ---- */
    React.createElement(
      'div',
      {
        style: {
          background: COLORS.white,
          borderBottom: `1px solid ${COLORS.gray200}`,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        },
      },
      React.createElement(
        'div',
        { style: { fontSize: 17, fontWeight: 800, color: COLORS.primary, whiteSpace: 'nowrap' } },
        'Scale Decision Workbench'
      ),
      React.createElement(
        'div',
        {
          style: {
            fontSize: 11,
            color: COLORS.gray500,
            background: COLORS.primaryLight,
            padding: '2px 10px',
            borderRadius: 10,
            fontWeight: 600,
          },
        },
        'Domain 2.5 \u2022 Gate 2'
      ),
      React.createElement('div', { style: { flex: 1 } }),
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement('label', { style: { fontSize: 12, color: COLORS.gray500, fontWeight: 600 } }, 'Target ACoS %:'),
        React.createElement('input', {
          style: { ...inputStyle, width: 60, textAlign: 'center', fontSize: 12 },
          type: 'number',
          value: targetAcos,
          onChange: (e) => setTargetAcos(e.target.value),
        })
      )
    ),

    /* ---- Body: Left Panel + Main Content ---- */
    React.createElement(
      'div',
      { style: { display: 'flex', flex: 1, minHeight: 0 } },

      /* Left Panel: Product Info */
      React.createElement(
        'div',
        {
          style: {
            width: 220,
            background: COLORS.white,
            borderRight: `1px solid ${COLORS.gray200}`,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            flexShrink: 0,
          },
        },
        React.createElement(
          'div',
          null,
          React.createElement('label', { style: { ...labelStyle, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 } }, 'Product'),
          React.createElement('input', {
            style: { ...inputStyle, fontWeight: 600 },
            type: 'text',
            value: productName,
            onChange: (e) => setProductName(e.target.value),
            placeholder: 'Enter product name',
          })
        ),
        React.createElement(
          'div',
          {
            style: {
              padding: 12,
              background: COLORS.gray50,
              borderRadius: 8,
              border: `1px solid ${COLORS.gray200}`,
            },
          },
          React.createElement(
            'div',
            { style: { fontSize: 11, fontWeight: 700, color: COLORS.gray500, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 } },
            'Quick Stats'
          ),
          costData.actual.sp &&
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray600, marginBottom: 4 } },
              'SP: ',
              React.createElement('strong', null, fmtINR(costData.actual.sp))
            ),
          costData.actual.cogs &&
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray600, marginBottom: 4 } },
              'COGS: ',
              React.createElement('strong', null, fmtINR(costData.actual.cogs))
            ),
          costData.test.acos &&
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray600, marginBottom: 4 } },
              'Test ACoS: ',
              React.createElement('strong', null, fmtPct(costData.test.acos))
            ),
          keywordData.length > 0 &&
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray600, marginBottom: 4 } },
              'Keywords: ',
              React.createElement('strong', null, keywordData.length)
            ),
          keywordData.length > 0 &&
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.success, fontWeight: 600 } },
              'Winners: ',
              keywordData.filter(
                (r) => r.orders >= 3 && r.acos <= (parseFloat(targetAcos) || 40) && r.acos !== Infinity
              ).length
            ),
          (!costData.actual.sp && !costData.test.acos && keywordData.length === 0) &&
            React.createElement(
              'div',
              { style: { fontSize: 12, color: COLORS.gray400, fontStyle: 'italic' } },
              'Fill in data across tabs to see summary here.'
            )
        ),

        /* Pipeline Stage */
        React.createElement(
          'div',
          {
            style: {
              padding: 12,
              background: COLORS.primaryLight,
              borderRadius: 8,
              border: `1px solid ${COLORS.primary}22`,
            },
          },
          React.createElement(
            'div',
            { style: { fontSize: 11, fontWeight: 700, color: COLORS.primaryDark, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 } },
            'Pipeline Stage'
          ),
          React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: COLORS.primary } }, 'Stage 6: Scale Decision'),
          React.createElement('div', { style: { fontSize: 11, color: COLORS.gray500, marginTop: 2 } }, 'Bigin API: Listing & Launch Setup')
        ),

        /* Workflow hint */
        React.createElement(
          'div',
          {
            style: {
              marginTop: 'auto',
              padding: 12,
              background: COLORS.gray50,
              borderRadius: 8,
              fontSize: 11,
              color: COLORS.gray500,
              lineHeight: 1.5,
            },
          },
          React.createElement('div', { style: { fontWeight: 700, marginBottom: 4 } }, 'Workflow'),
          React.createElement('div', null, '1. Cost Comparison'),
          React.createElement('div', null, '2. Import & classify keywords'),
          React.createElement('div', null, '3. Check compliance timeline'),
          React.createElement('div', null, '4. Review costing scenarios'),
          React.createElement('div', null, '5. Make Gate 2 decision')
        )
      ),

      /* Main content area */
      React.createElement(
        'div',
        { style: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 } },

        /* AI Context Panel (header) */
        React.createElement(
          'div',
          {
            style: {
              background: '#f0f4ff',
              borderBottom: `1px solid ${COLORS.primary}22`,
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            },
          },
          React.createElement(
            'div',
            {
              style: {
                width: 28,
                height: 28,
                borderRadius: 14,
                background: COLORS.primary,
                color: COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
              },
            },
            'AI'
          ),
          React.createElement(
            'div',
            { style: { fontSize: 12, color: COLORS.gray600, lineHeight: 1.5 } },
            React.createElement('strong', { style: { color: COLORS.primaryDark } }, 'AI Insight: '),
            'Scale decisions should be based on keyword-level unit economics, not blended averages alone. ',
            'A product with 3-5 winning keywords at viable ACoS can scale even if blended metrics look marginal. ',
            'Cross-reference costing scenarios with actual keyword CPC to find the MOQ/margin sweet spot.',
            productName
              ? React.createElement('span', { style: { color: COLORS.primary, fontWeight: 600 } }, ` Analyzing: ${productName}.`)
              : null
          )
        ),

        /* Tab Bar */
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              background: COLORS.white,
              borderBottom: `1px solid ${COLORS.gray200}`,
              padding: '0 20px',
              overflow: 'auto',
            },
          },
          TABS.map((tab) =>
            React.createElement(
              'button',
              {
                key: tab.id,
                onClick: () => setActiveTab(tab.id),
                style: {
                  padding: '10px 18px',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                  background: 'none',
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? COLORS.primary : COLORS.gray500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s, border-color 0.15s',
                },
              },
              tab.label
            )
          )
        ),

        /* Tab Content */
        React.createElement(
          'div',
          { style: { flex: 1, overflow: 'auto', padding: 20 } },
          tabContent
        )
      )
    )
  );
}

export default ScaleDecisionWorkbench;
