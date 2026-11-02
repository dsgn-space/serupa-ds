// exports: Meter, type MeterProps, meterState, type MeterState
type MeterZone = "high" | "low" | "medium";
interface MeterLabels {
    meterZone: (value: string, zone: MeterZone) => string;
}
type MeterState = "none" | "optimum" | "poor" | "suboptimal";
interface MeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    value: number;
    min?: number | undefined;
    max?: number | undefined;
    low?: number | undefined;
    high?: number | undefined;
    optimum?: number | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    label?: React.ReactNode | undefined;
    showValue?: boolean | undefined;
    formatValue?: ((value: number, min: number, max: number) => string) | undefined;
}
declare function meterState(value: number, min: number, max: number, low?: number, high?: number, optimum?: number): MeterState;
declare const Meter: React.ForwardRefExoticComponent<MeterProps & React.RefAttributes<HTMLDivElement>>;
