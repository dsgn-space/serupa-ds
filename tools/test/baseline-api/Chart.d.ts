// exports: Chart, type ChartProps, type ChartSeries, type ChartType, type ChartView
interface ChartLabels {
    chartKind: (type: "area" | "bar" | "donut" | "heatmap" | "line") => string;
    chartSummary: (kind: string, series: number, points: number, first: string, last: string) => string;
    chartRange: (series: string, low: string, lowAt: string, high: string, highAt: string) => string;
    chartPoint: (series: null | string, category: string, value: string) => string;
    chartNoValue: string;
    chartOther: string;
    chartShare: (value: string, percent: string) => string;
    chartTotal: (total: string) => string;
    chartCategory: string;
    chartShowTable: string;
    chartShowChart: string;
}
type ChartType = "area" | "bar" | "donut" | "heatmap" | "line";
type ChartScale = "diverging" | "sequential";
type ChartView = "chart" | "table";
interface ChartSeries {
    name: string;
    values: ReadonlyArray<null | number | undefined>;
}
interface ChartProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "title"> {
    type?: ChartType | undefined;
    scale?: ChartScale | undefined;
    midpoint?: number | undefined;
    stacked?: boolean | undefined;
    title?: React.ReactNode | undefined;
    categories: ReadonlyArray<string>;
    series: ReadonlyArray<ChartSeries>;
    formatValue?: ((value: number) => string) | undefined;
    categoryLabel?: string | undefined;
    height?: number | undefined;
    hideLegend?: boolean | undefined;
    view?: ChartView | undefined;
    defaultView?: ChartView | undefined;
    onViewChange?: ((view: ChartView) => void) | undefined;
    loading?: boolean | undefined;
    loadingLabel?: string | undefined;
}
declare const Chart: React.FC<ChartProps & React.RefAttributes<HTMLElement>>;
