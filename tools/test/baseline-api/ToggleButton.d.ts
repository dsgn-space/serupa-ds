// exports: ToggleButton, type ToggleButtonProps
interface ToggleButtonProps extends Omit<ButtonAsButtonProps, "destructive" | "loading" | "loadingLabel" | "variant"> {
    pressed?: boolean | undefined;
    defaultPressed?: boolean | undefined;
    onPressedChange?: ((pressed: boolean) => void) | undefined;
    variant?: "ghost" | "outline" | undefined;
    icon?: IconSource | undefined;
}
declare const ToggleButton: React.ForwardRefExoticComponent<ToggleButtonProps & React.RefAttributes<HTMLButtonElement>>;
