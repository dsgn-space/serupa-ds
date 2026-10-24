// exports: Alert, type AlertProps, type AlertTone
type AlertTone = "danger" | "info" | "neutral" | "success" | "warning";
interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    tone?: AlertTone;
    title?: React.ReactNode;
    icon?: false | IconSource;
    actions?: React.ReactNode;
    onDismiss?: () => void;
    dismissLabel?: string;
}
declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
