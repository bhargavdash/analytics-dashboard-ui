import type { Dashboard, ReasoningStep } from '../types';

export const SEED_DASHBOARDS: Dashboard[] = [
  {
    id: 'd1',
    title: 'Monthly revenue trend, 2026',
    query: 'Show monthly revenue trend for 2026',
    dataset: 'sales_data',
    createdAt: '2m ago',
    widgetCount: 6,
    summary: 'Revenue is up +18.4% YTD, driven primarily by Q1 momentum in NA. April dipped 4.2% on weaker SMB conversion — recovers in May projection.',
    widgets: [
      { type: 'stat_card', span: 3, title: 'YTD Revenue',  payload: { value: '$3.42M', delta: '+18.4%', up: true,  vs: 'vs 2025' } },
      { type: 'stat_card', span: 3, title: 'Best Month',   payload: { value: 'March',  delta: '$612k',  up: true,  vs: '' } },
      { type: 'stat_card', span: 3, title: 'Avg / Month',  payload: { value: '$427k',  delta: '+9.1%',  up: true,  vs: 'vs 2025' } },
      { type: 'stat_card', span: 3, title: 'YoY Growth',   payload: { value: '22.8%',  delta: '+3.4pp', up: true,  vs: 'vs 2025' } },
      {
        type: 'line_chart',
        span: 8,
        title: 'Revenue · Jan – Aug 2026',
        payload: {
          x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [
            { name: 'Revenue',  color: 'var(--accent)', data: [380, 495, 612, 586, 540, 602, 640, 670] },
            { name: 'Forecast', color: 'var(--cyan)',   data: [null, null, null, null, 540, 612, 650, 690], dashed: true },
          ],
          unit: 'k',
        },
      },
      {
        type: 'pie_chart',
        span: 4,
        title: 'Revenue by region',
        payload: {
          slices: [
            { name: 'NA',    value: 48, color: 'oklch(0.72 0.17 290)' },
            { name: 'EU',    value: 28, color: 'oklch(0.82 0.12 200)' },
            { name: 'APAC',  value: 16, color: 'oklch(0.78 0.16 150)' },
            { name: 'LATAM', value: 8,  color: 'oklch(0.82 0.14 75)'  },
          ],
        },
      },
    ],
  },
  {
    id: 'd2',
    title: 'Top 5 profitable months',
    query: 'Show top 5 most profitable months',
    dataset: 'sales_data',
    createdAt: 'Yesterday',
    widgetCount: 2,
    summary: 'March led with $612k profit, followed by August and July. Spread between #1 and #5 is $190k — fairly tight.',
    widgets: [
      {
        type: 'bar_chart',
        span: 8,
        title: 'Profit by month · top 5',
        payload: {
          x: ['Mar', 'Aug', 'Jul', 'Jun', 'Feb'],
          series: [{ name: 'Profit', color: 'var(--accent)', data: [612, 540, 510, 478, 422] }],
          unit: 'k',
        },
      },
      {
        type: 'table',
        span: 4,
        title: 'Profit ranking',
        payload: {
          columns: ['Month', 'Profit', 'Margin'],
          rows: [
            ['March',    '$612k', 28.4],
            ['August',   '$540k', 26.1],
            ['July',     '$510k', 25.0],
            ['June',     '$478k', 24.1],
            ['February', '$422k', 22.7],
          ],
        },
      },
    ],
  },
  {
    id: 'd3',
    title: 'Marketing channel performance Q1',
    query: 'Compare marketing channel performance for Q1',
    dataset: 'marketing',
    createdAt: '3 days ago',
    widgetCount: 3,
    summary: 'Paid search delivered the strongest ROAS at 4.8×, while social fell to 1.6×. Reallocate ~15% of social spend to paid search next quarter.',
    widgets: [
      {
        type: 'bar_chart',
        span: 6,
        title: 'ROAS by channel',
        payload: {
          x: ['Paid Search', 'Email', 'Referral', 'Display', 'Social'],
          series: [{ name: 'ROAS', color: 'var(--cyan)', data: [4.8, 3.6, 2.9, 2.1, 1.6] }],
          unit: '×',
        },
      },
      {
        type: 'bar_chart',
        span: 6,
        title: 'Spend by channel',
        payload: {
          x: ['Paid Search', 'Email', 'Referral', 'Display', 'Social'],
          series: [{ name: 'Spend ($k)', color: 'var(--accent)', data: [120, 40, 30, 80, 90] }],
          unit: 'k',
        },
      },
      {
        type: 'table',
        span: 12,
        title: 'Channel breakdown',
        payload: {
          columns: ['Channel', 'Spend', 'Revenue', 'ROAS', 'ΔQoQ'],
          rows: [
            ['Paid Search', '$120k', '$576k', 4.8, '+0.6×'],
            ['Email',       '$40k',  '$144k', 3.6, '+0.2×'],
            ['Referral',    '$30k',  '$87k',  2.9, '+0.0×'],
            ['Display',     '$80k',  '$168k', 2.1, '-0.3×'],
            ['Social',      '$90k',  '$144k', 1.6, '-0.8×'],
          ],
        },
      },
    ],
  },
  {
    id: 'd4',
    title: 'Customer churn cohort',
    query: 'Analyze customer churn for the last 6 months',
    dataset: 'customers',
    createdAt: 'Last week',
    widgetCount: 3,
    summary: 'Monthly churn settled at 3.1%. Annual plans churn 4.2× less than monthly. Consider an annual upgrade nudge in onboarding.',
    widgets: [
      {
        type: 'line_chart',
        span: 8,
        title: 'Monthly churn rate',
        payload: {
          x: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
          series: [{ name: 'Churn %', color: 'var(--red)', data: [2.6, 2.9, 3.4, 3.2, 3.0, 3.1] }],
          unit: '%',
        },
      },
      {
        type: 'pie_chart',
        span: 4,
        title: 'Churn by plan',
        payload: {
          slices: [
            { name: 'Monthly',    value: 72, color: 'oklch(0.72 0.20 25)'  },
            { name: 'Annual',     value: 17, color: 'oklch(0.72 0.17 290)' },
            { name: 'Free trial', value: 11, color: 'oklch(0.82 0.14 75)'  },
          ],
        },
      },
      {
        type: 'table',
        span: 12,
        title: 'Top churn reasons (survey)',
        payload: {
          columns: ['Reason', 'Mentions', '% of churn'],
          rows: [
            ['Pricing',         '284', 38],
            ['Missing feature', '192', 26],
            ['Low usage',       '147', 20],
            ['Switched tool',   '92',  12],
            ['Other',           '29',  4],
          ],
        },
      },
    ],
  },
];

export const SEED_EXAMPLES = [
  { title: 'Show monthly revenue trend for 2026',     dataset: 'sales_data' },
  { title: 'Compare revenue vs expenses by quarter',  dataset: 'sales_data' },
  { title: 'Which region performed best this year?',  dataset: 'sales_data' },
  { title: 'Top 5 customers by lifetime value',       dataset: 'customers'  },
];

export const SEED_REASONING: ReasoningStep[] = [
  {
    title: 'Parse intent',
    tool: 'router',
    detail: 'Classifying request: "Show monthly revenue trend for 2026". Routing to data + viz agents. Target dataset: sales_data.',
    pills: ['intent: trend-analysis', 'dataset: sales_data'],
  },
  {
    title: 'Generate SQL',
    tool: 'sql.gen',
    code: 'select month,\n       sum(revenue) as rev\n  from sales_data\n where year = 2026\n group by 1\n order by 1;\n-- validated · read-only',
    pills: ['safe ✓', 'table: sales_data'],
  },
  {
    title: 'Run query',
    tool: 'sqlite.exec',
    detail: 'Executed against the local SQLite database. 8 rows returned in 14ms.',
    pills: ['rows: 8', '14ms', 'cache: miss'],
  },
  {
    title: 'Pick widgets',
    tool: 'a2ui.schema',
    detail: 'Trend over time + composition → choosing line_chart for the series and pie_chart for region split. Adding 4 stat_cards for headline numbers.',
    pills: ['line_chart', 'pie_chart', 'stat_card ×4'],
  },
  {
    title: 'Validate schema',
    tool: 'pydantic',
    detail: 'All widget schemas validated against the WidgetSchema model. No arbitrary JSX, no untrusted code paths.',
    pills: ['6 widgets', '0 errors'],
  },
  {
    title: 'Stream to UI',
    tool: 'sse.emit',
    detail: 'Streaming widget events to the frontend renderer. Frontend selects the matching component per widget.type.',
    pills: ['events: 12', 'verified ✓'],
  },
];
