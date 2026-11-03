// exports: Alert, type AlertProps, type AlertTone
type AlertTone = "danger" | "info" | "neutral" | "success" | "warning";
interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    tone?: AlertTone | undefined;
    title?: React.ReactNode | undefined;
    icon?: false | IconSource | undefined;
    actions?: React.ReactNode | undefined;
    onDismiss?: (() => void) | undefined;
    dismissLabel?: string | undefined;
}
declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
