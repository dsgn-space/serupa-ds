// exports: Switch, type SwitchProps
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "role" | "size" | "type"> {
    size?: "lg" | "md" | "sm" | undefined;
    children?: React.ReactNode | undefined;
    description?: React.ReactNode | undefined;
    labelPosition?: "end" | "start" | undefined;
    invalid?: boolean | undefined;
    readOnly?: boolean | undefined;
    pending?: boolean | undefined;
    onCheckedChange?: ((checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
}
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
