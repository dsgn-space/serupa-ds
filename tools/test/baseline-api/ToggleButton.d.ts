// exports: ToggleButton, type ToggleButtonProps
interface ToggleButtonProps extends Omit<ButtonAsButtonProps, "destructive" | "loading" | "loadingText" | "variant"> {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    variant?: "ghost" | "outline";
}
declare const ToggleButton: React.ForwardRefExoticComponent<ToggleButtonProps & React.RefAttributes<HTMLButtonElement>>;
