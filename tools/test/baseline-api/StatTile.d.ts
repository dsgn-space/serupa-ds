// exports: StatTile, type StatTileChange, type StatTileProps
interface StatTileLabels {
    statTileUp: (amount: string) => string;
    statTileDown: (amount: string) => string;
    statTileFlat: string;
    statTileTrend: (label: string, count: number) => string;
}
interface StatTileChange {
    amount: string;
    direction: "down" | "flat" | "up";
    good?: boolean | undefined;
}
interface StatTileProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    label: string;
    value: React.ReactNode;
    change?: StatTileChange | undefined;
    period?: string | undefined;
    trend?: readonly number[] | undefined;
    trendLabel?: string | undefined;
    trendFormat?: Intl.NumberFormatOptions | undefined;
    loading?: boolean | undefined;
    loadingLabel?: string | undefined;
    as?: "article" | "div" | "li" | undefined;
}
declare const StatTile: React.FC<StatTileProps & React.RefAttributes<HTMLElement>>;
