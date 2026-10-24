// exports: PasswordInput, type PasswordInputProps
interface PasswordInputLabels {
    showPassword: string;
}
interface PasswordInputProps extends Omit<InputProps, "rightIcon" | "type"> {
    visible?: boolean;
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    toggleLabel?: string;
}
declare const PasswordInput: React.ForwardRefExoticComponent<PasswordInputProps & React.RefAttributes<HTMLInputElement>>;
