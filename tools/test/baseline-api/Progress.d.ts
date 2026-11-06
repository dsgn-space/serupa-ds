// exports: Progress, type ProgressProps, type ProgressTone
interface ProgressLabels {
    progressComplete: (name: string) => string;
}
type ProgressTone = "danger" | "primary" | "success" | "warning";
interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    value?: null | number | undefined;
    max?: number | undefined;
    variant?: "bar" | "circle" | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    tone?: ProgressTone | undefined;
    label?: React.ReactNode | undefined;
    showValue?: boolean | undefined;
    formatValue?: ((value: number, max: number) => string) | undefined;
    announceComplete?: boolean | string | undefined;
    onComplete?: (() => void) | undefined;
}
declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
