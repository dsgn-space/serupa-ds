// exports: Chart, type ChartProps, type ChartSeries, type ChartType, type ChartView
interface ChartLabels {
    chartKind: (type: "bar" | "line") => string;
    chartSummary: (kind: string, series: number, points: number, first: string, last: string) => string;
    chartRange: (series: string, low: string, lowAt: string, high: string, highAt: string) => string;
    chartPoint: (series: null | string, category: string, value: string) => string;
    chartNoValue: string;
    chartCategory: string;
    chartShowTable: string;
    chartShowChart: string;
}
type ChartType = "bar" | "line";
type ChartView = "chart" | "table";
interface ChartSeries {
    name: string;
    values: ReadonlyArray<null | number | undefined>;
}
interface ChartProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "title"> {
    type?: ChartType;
    title?: React.ReactNode;
    categories: ReadonlyArray<string>;
    series: ReadonlyArray<ChartSeries>;
    formatValue?: (value: number) => string;
    categoryLabel?: string;
    height?: number;
    hideLegend?: boolean;
    view?: ChartView;
    defaultView?: ChartView;
    onViewChange?: (view: ChartView) => void;
}
declare const Chart: React.ForwardRefExoticComponent<ChartProps & React.RefAttributes<HTMLElement>>;
