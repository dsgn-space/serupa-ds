// exports: Sparkline, type SparklineProps
interface SparklineLabels {
    sparklineSummary: (label: string, first: string, last: string, min: string, max: string) => string;
}
interface SparklineProps extends Omit<React.SVGAttributes<SVGSVGElement>, "format" | "max" | "min" | "name"> {
    data: readonly number[];
    label: string;
    format?: Intl.NumberFormatOptions | undefined;
    area?: boolean | undefined;
    min?: number | undefined;
    max?: number | undefined;
}
declare const Sparkline: React.ForwardRefExoticComponent<SparklineProps & React.RefAttributes<SVGSVGElement>>;
