// exports: Switch, type SwitchProps
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "role" | "size" | "type"> {
    size?: "lg" | "md" | "sm" | undefined;
    children?: React.ReactNode | undefined;
    description?: React.ReactNode | undefined;
    labelPlacement?: "end" | "start" | undefined;
    invalid?: boolean | undefined;
    readOnly?: boolean | undefined;
    loading?: boolean | undefined;
    icon?: boolean | undefined;
    onCheckedChange?: ((checked: boolean, details: {
        event: React.ChangeEvent<HTMLInputElement>;
    }) => void) | undefined;
}
declare const Switch: React.FC<SwitchProps & React.RefAttributes<HTMLInputElement>>;
