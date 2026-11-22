// exports: PasswordInput, type PasswordInputProps
interface PasswordInputLabels {
    showPassword: string;
    capsLockOn: string;
}
interface PasswordInputProps extends Omit<InputProps, "actions" | "endIcon" | "prefix" | "showCount" | "suffix" | "type"> {
    revealed?: boolean | undefined;
    defaultRevealed?: boolean | undefined;
    onRevealedChange?: ((revealed: boolean) => void) | undefined;
    toggleLabel?: string | undefined;
    capsLockHint?: boolean | undefined;
}
declare const PasswordInput: React.FC<PasswordInputProps & React.RefAttributes<HTMLInputElement>>;
