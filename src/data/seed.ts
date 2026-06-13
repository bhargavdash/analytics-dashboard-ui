import type { Dashboard } from '../types';

export const SEED_DASHBOARDS: Dashboard[] = [
  {
    id: 'd1',
    title: 'Monthly revenue trend, 2026',
    query: 'Show monthly revenue trend for 2026',
    dataset: 'sales_data',
    createdAt: '2m ago',
    widgetCount: 6,
    summary: 'Revenue is up +18.4% YTD, driven primarily by Q1 momentum in the North region. April dipped 4.2% on weaker SMB conversion — recovers in May projection.',
    reasoningSteps: [
      { title: 'Parse intent',    tool: 'router',      detail: 'Classifying: "Show monthly revenue trend for 2026". Routing to data + viz agents. Target dataset: orders.', pills: ['intent: trend-analysis', 'dataset: orders'] },
      { title: 'Generate SQL',    tool: 'sql.gen',     code: "SELECT strftime(order_date, '%Y-%m') AS month,\n       SUM(amount) AS revenue\n  FROM orders\n WHERE status = 'completed'\n   AND order_date >= '2026-01-01'\n GROUP BY 1\n ORDER BY 1;\n-- validated · read-only", pills: ['safe ✓', 'table: orders'] },
      { title: 'Run query',       tool: 'duckdb.exec', detail: 'Executed against DuckDB. 8 rows returned in 14ms.', pills: ['rows: 8', '14ms', 'cache: miss'] },
      { title: 'Pick widgets',    tool: 'a2ui.schema', detail: 'Trend over time → line_chart. Region split → pie_chart. Headline numbers → stat_card ×4.', pills: ['line_chart', 'pie_chart', 'stat_card ×4'] },
      { title: 'Validate schema', tool: 'pydantic',    detail: 'All widget schemas validated. No arbitrary JSX, no untrusted code paths.', pills: ['6 widgets', '0 errors'] },
      { title: 'Stream to UI',    tool: 'sse.emit',    detail: 'Streaming widget events to the frontend renderer.', pills: ['events: 12', 'verified ✓'] },
    ],
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
          data: [
            { month: 'Jan', revenue: 380, forecast: null },
            { month: 'Feb', revenue: 495, forecast: null },
            { month: 'Mar', revenue: 612, forecast: null },
            { month: 'Apr', revenue: 586, forecast: null },
            { month: 'May', revenue: 540, forecast: 540 },
            { month: 'Jun', revenue: 602, forecast: 612 },
            { month: 'Jul', revenue: 640, forecast: 650 },
            { month: 'Aug', revenue: 670, forecast: 690 },
          ],
          xKey: 'month',
          series: [
            { key: 'revenue',  color: 'oklch(0.72 0.17 290)', label: 'Revenue' },
            { key: 'forecast', color: 'oklch(0.82 0.12 200)', label: 'Forecast', dashed: true },
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
            { name: 'North',   value: 48, color: 'oklch(0.72 0.17 290)' },
            { name: 'West',    value: 28, color: 'oklch(0.82 0.12 200)' },
            { name: 'East',    value: 16, color: 'oklch(0.78 0.16 150)' },
            { name: 'South',   value: 8,  color: 'oklch(0.82 0.14 75)'  },
          ],
        },
      },
    ],
  },
  {
    id: 'd2',
    title: 'Top 5 profitable months',
    query: 'Show top 5 most profitable months',
    dataset: 'orders',
    createdAt: 'Yesterday',
    widgetCount: 2,
    summary: 'March led with $612k profit, followed by August and July. Spread between #1 and #5 is $190k — fairly tight.',
    reasoningSteps: [
      { title: 'Parse intent',    tool: 'router',      detail: 'Classifying: "Show top 5 most profitable months". Routing to ranking query. Target dataset: orders.', pills: ['intent: ranking', 'dataset: orders'] },
      { title: 'Generate SQL',    tool: 'sql.gen',     code: "SELECT strftime(order_date, '%Y-%m') AS month,\n       SUM(profit) AS profit\n  FROM orders\n GROUP BY 1\n ORDER BY profit DESC\n LIMIT 5;", pills: ['safe ✓', 'table: orders'] },
      { title: 'Run query',       tool: 'duckdb.exec', detail: '5 rows returned in 9ms.', pills: ['rows: 5', '9ms', 'cache: miss'] },
      { title: 'Pick widgets',    tool: 'a2ui.schema', detail: 'Ranked list → bar_chart. Detail view → table.', pills: ['bar_chart', 'table'] },
      { title: 'Validate schema', tool: 'pydantic',    detail: 'All widget schemas validated.', pills: ['2 widgets', '0 errors'] },
    ],
    widgets: [
      {
        type: 'bar_chart',
        span: 8,
        title: 'Profit by month · top 5',
        payload: {
          data: [
            { month: 'Mar', profit: 612 },
            { month: 'Aug', profit: 540 },
            { month: 'Jul', profit: 510 },
            { month: 'Jun', profit: 478 },
            { month: 'Feb', profit: 422 },
          ],
          xKey: 'month',
          series: [{ key: 'profit', color: 'oklch(0.72 0.17 290)', label: 'Profit' }],
          unit: 'k',
        },
      },
      {
        type: 'table',
        span: 4,
        title: 'Profit ranking',
        payload: {
          data: [
            { month: 'March',    profit: '$612k', margin: 28.4 },
            { month: 'August',   profit: '$540k', margin: 26.1 },
            { month: 'July',     profit: '$510k', margin: 25.0 },
            { month: 'June',     profit: '$478k', margin: 24.1 },
            { month: 'February', profit: '$422k', margin: 22.7 },
          ],
          columns: [
            { key: 'month',  label: 'Month' },
            { key: 'profit', label: 'Profit' },
            { key: 'margin', label: 'Margin %' },
          ],
        },
      },
    ],
  },
  {
    id: 'd3',
    title: 'Marketing channel performance Q1',
    query: 'Compare marketing channel performance for Q1',
    dataset: 'orders',
    createdAt: '3 days ago',
    widgetCount: 3,
    summary: 'Electronics drove strongest revenue at 4.8× ROAS equivalent, while Clothing fell to 1.6×. Reallocate ~15% of Clothing spend to Electronics next quarter.',
    reasoningSteps: [
      { title: 'Parse intent',    tool: 'router',      detail: 'Classifying: "Compare marketing channel performance for Q1". Routing to aggregation query. Target dataset: orders.', pills: ['intent: comparison', 'dataset: orders'] },
      { title: 'Generate SQL',    tool: 'sql.gen',     code: "SELECT category, region,\n       COUNT(*) AS orders,\n       SUM(revenue) AS revenue\n  FROM orders\n WHERE order_date BETWEEN '2026-01-01' AND '2026-03-31'\n GROUP BY 1, 2;", pills: ['safe ✓', 'table: orders'] },
      { title: 'Run query',       tool: 'duckdb.exec', detail: '20 rows returned in 11ms.', pills: ['rows: 20', '11ms', 'cache: miss'] },
      { title: 'Pick widgets',    tool: 'a2ui.schema', detail: 'Category comparison → bar_chart. Region split → bar_chart. Full breakdown → table.', pills: ['bar_chart ×2', 'table'] },
      { title: 'Validate schema', tool: 'pydantic',    detail: 'All widget schemas validated.', pills: ['3 widgets', '0 errors'] },
    ],
    widgets: [
      {
        type: 'bar_chart',
        span: 6,
        title: 'Revenue by category',
        payload: {
          data: [
            { category: 'Electronics', revenue: 4.8 },
            { category: 'Food',        revenue: 3.6 },
            { category: 'Furniture',   revenue: 2.9 },
            { category: 'Clothing',    revenue: 1.6 },
          ],
          xKey: 'category',
          series: [{ key: 'revenue', color: 'oklch(0.82 0.12 200)', label: 'Revenue ($M)' }],
          unit: 'M',
        },
      },
      {
        type: 'bar_chart',
        span: 6,
        title: 'Orders by region',
        payload: {
          data: [
            { region: 'North',   orders: 48200 },
            { region: 'East',    orders: 41300 },
            { region: 'West',    orders: 38900 },
            { region: 'South',   orders: 31200 },
            { region: 'Central', orders: 28100 },
          ],
          xKey: 'region',
          series: [{ key: 'orders', color: 'oklch(0.72 0.17 290)', label: 'Orders' }],
        },
      },
      {
        type: 'table',
        span: 12,
        title: 'Category breakdown',
        payload: {
          data: [
            { category: 'Electronics', orders: 48200, revenue: '$4.8M', avg_order: '$312' },
            { category: 'Food',        orders: 41300, revenue: '$3.6M', avg_order: '$87'  },
            { category: 'Furniture',   orders: 28100, revenue: '$2.9M', avg_order: '$456' },
            { category: 'Clothing',    orders: 31200, revenue: '$1.6M', avg_order: '$124' },
          ],
          columns: [
            { key: 'category',  label: 'Category' },
            { key: 'orders',    label: 'Orders' },
            { key: 'revenue',   label: 'Revenue' },
            { key: 'avg_order', label: 'Avg Order' },
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
    summary: 'Monthly churn settled at 3.1%. Enterprise segment churns 4.2× less than Consumer. Consider an annual upgrade nudge in onboarding.',
    reasoningSteps: [
      { title: 'Parse intent',    tool: 'router',      detail: 'Classifying: "Analyze customer churn for the last 6 months". Routing to time-series + cohort query. Target dataset: customers.', pills: ['intent: cohort-analysis', 'dataset: customers'] },
      { title: 'Generate SQL',    tool: 'sql.gen',     code: "SELECT segment,\n       strftime(churned_at, '%Y-%m') AS month,\n       COUNT(*) AS churned\n  FROM customers\n WHERE churned_at >= date('now', '-6 months')\n GROUP BY 1, 2;", pills: ['safe ✓', 'table: customers'] },
      { title: 'Run query',       tool: 'duckdb.exec', detail: '18 rows returned in 17ms.', pills: ['rows: 18', '17ms', 'cache: miss'] },
      { title: 'Pick widgets',    tool: 'a2ui.schema', detail: 'Churn over time → line_chart. Segment share → pie_chart. Cohort detail → table.', pills: ['line_chart', 'pie_chart', 'table'] },
      { title: 'Validate schema', tool: 'pydantic',    detail: 'All widget schemas validated.', pills: ['3 widgets', '0 errors'] },
    ],
    widgets: [
      {
        type: 'line_chart',
        span: 8,
        title: 'Monthly churn rate',
        payload: {
          data: [
            { month: 'Dec', churn: 2.6 },
            { month: 'Jan', churn: 2.9 },
            { month: 'Feb', churn: 3.4 },
            { month: 'Mar', churn: 3.2 },
            { month: 'Apr', churn: 3.0 },
            { month: 'May', churn: 3.1 },
          ],
          xKey: 'month',
          series: [{ key: 'churn', color: 'oklch(0.72 0.20 25)', label: 'Churn %' }],
          unit: '%',
        },
      },
      {
        type: 'pie_chart',
        span: 4,
        title: 'Customers by segment',
        payload: {
          slices: [
            { name: 'Consumer',   value: 72, color: 'oklch(0.72 0.20 25)'  },
            { name: 'Enterprise', value: 17, color: 'oklch(0.72 0.17 290)' },
            { name: 'SMB',        value: 11, color: 'oklch(0.82 0.14 75)'  },
          ],
        },
      },
      {
        type: 'table',
        span: 12,
        title: 'Churn by segment',
        payload: {
          data: [
            { segment: 'Consumer',   customers: 284, churn_rate: 38, avg_orders: 2.1 },
            { segment: 'SMB',        customers: 192, churn_rate: 26, avg_orders: 4.8 },
            { segment: 'Enterprise', customers: 147, churn_rate: 9,  avg_orders: 12.4 },
          ],
          columns: [
            { key: 'segment',    label: 'Segment' },
            { key: 'customers',  label: 'Customers' },
            { key: 'churn_rate', label: 'Churn %' },
            { key: 'avg_orders', label: 'Avg Orders' },
          ],
        },
      },
    ],
  },
];

export const SEED_EXAMPLES = [
  { title: 'Show monthly revenue trend for 2026',     dataset: 'orders' },
  { title: 'Compare revenue by product category',     dataset: 'orders' },
  { title: 'Which region had the most orders?',       dataset: 'orders' },
  { title: 'Top 5 customers by total spend',          dataset: 'customers' },
];

