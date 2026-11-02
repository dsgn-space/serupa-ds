// exports: PasswordInput, type PasswordInputProps
interface PasswordInputLabels {
    showPassword: string;
    capsLockOn: string;
}
interface PasswordInputProps extends Omit<InputProps, "prefix" | "rightIcon" | "showCount" | "suffix" | "type"> {
    visible?: boolean | undefined;
    defaultVisible?: boolean | undefined;
    onVisibleChange?: ((visible: boolean) => void) | undefined;
    toggleLabel?: string | undefined;
    capsLockHint?: boolean | undefined;
}
declare const PasswordInput: React.ForwardRefExoticComponent<PasswordInputProps & React.RefAttributes<HTMLInputElement>>;
