// exports: PinInput, type PinInputProps
interface PinInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children" | "defaultValue" | "maxLength" | "onChange" | "size" | "type" | "value"> {
    length?: number | undefined;
    value?: string | undefined;
    defaultValue?: string | undefined;
    onValueChange?: ((value: string) => void) | undefined;
    onComplete?: ((value: string) => void) | undefined;
    type?: "alphanumeric" | "numeric" | undefined;
    mask?: boolean | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
}
declare const PinInput: React.ForwardRefExoticComponent<PinInputProps & React.RefAttributes<HTMLInputElement>>;
