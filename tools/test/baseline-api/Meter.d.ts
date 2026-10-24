// exports: Meter, type MeterProps, meterState, type MeterState
type MeterZone = "high" | "low" | "medium";
interface MeterLabels {
    meterZone: (value: string, zone: MeterZone) => string;
}
type MeterState = "none" | "optimum" | "poor" | "suboptimal";
interface MeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    value: number;
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    optimum?: number;
    size?: "lg" | "md" | "sm";
    label?: React.ReactNode;
    showValue?: boolean;
    formatValue?: (value: number, min: number, max: number) => string;
}
declare function meterState(value: number, min: number, max: number, low?: number, high?: number, optimum?: number): MeterState;
declare const Meter: React.ForwardRefExoticComponent<MeterProps & React.RefAttributes<HTMLDivElement>>;
