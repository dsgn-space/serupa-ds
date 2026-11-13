// exports: Badge, type BadgeProps, type BadgeTone, type BadgeVariant
type BadgeVariant = "outline" | "solid" | "subtle";
type BadgeTone = "amber" | "blue" | "cyan" | "danger" | "emerald" | "fuchsia" | "green" | "indigo" | "info" | "lime" | "neutral" | "orange" | "pink" | "primary" | "purple" | "red" | "rose" | "sky" | "success" | "teal" | "violet" | "warning" | "yellow";
interface BadgeProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
    variant?: BadgeVariant | undefined;
    tone?: BadgeTone | undefined;
    dot?: boolean | undefined;
    ping?: boolean | undefined;
    leftIcon?: IconSource | undefined;
    count?: number | undefined;
    max?: number | undefined;
    showZero?: boolean | undefined;
    onRemove?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined;
    removeLabel?: string | undefined;
    onClick?: React.MouseEventHandler<HTMLElement> | undefined;
    href?: string | undefined;
    target?: string | undefined;
    rel?: string | undefined;
    disabled?: boolean | undefined;
    type?: "button" | "reset" | "submit" | undefined;
    loading?: boolean | undefined;
    loadingLabel?: string | undefined;
    loadingText?: string | undefined;
}
declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLElement>>;
