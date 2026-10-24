// exports: Input, type InputProps
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    size?: "lg" | "md" | "sm";
    invalid?: boolean;
    leftIcon?: IconSource;
    rightIcon?: IconSource;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
