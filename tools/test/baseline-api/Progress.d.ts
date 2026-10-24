// exports: Progress, type ProgressProps, type ProgressTone
type ProgressTone = "danger" | "primary" | "success" | "warning";
interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    value?: null | number;
    max?: number;
    variant?: "bar" | "circle";
    size?: "lg" | "md" | "sm";
    tone?: ProgressTone;
    label?: React.ReactNode;
    showValue?: boolean;
    formatValue?: (value: number, max: number) => string;
}
declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
