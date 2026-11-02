// exports: ToggleGroup, type ToggleGroupProps
interface ToggleGroupProps extends Omit<ButtonGroupProps, "defaultValue" | "onChange"> {
    type?: "multiple" | "single" | undefined;
    value?: string[] | undefined;
    defaultValue?: string[] | undefined;
    onValueChange?: ((value: string[]) => void) | undefined;
    required?: boolean | undefined;
    disabled?: boolean | undefined;
    size?: ToggleButtonProps["size"] | undefined;
    variant?: ToggleButtonProps["variant"] | undefined;
    children?: React.ReactNode | undefined;
}
declare const ToggleGroup: React.ForwardRefExoticComponent<ToggleGroupProps & React.RefAttributes<HTMLDivElement>>;
