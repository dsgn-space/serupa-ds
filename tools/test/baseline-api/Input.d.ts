// exports: Input, InputAction, type InputActionProps, type InputProps, type ValidityProblem
interface ValidityProblem {
    reason: "badInput" | "patternMismatch" | "rangeOverflow" | "rangeUnderflow" | "stepMismatch" | "tooLong" | "tooShort" | "typeMismatch" | "valueMissing";
    type: string;
    length: number;
    minLength?: number;
    maxLength?: number;
    min?: string;
    max?: string;
    step?: string;
    title?: string;
}
interface InputLabels {
    charactersLeft: (left: number) => string;
    invalidValue: (problem: ValidityProblem) => string;
}
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "children" | "prefix" | "size"> {
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    leftIcon?: IconSource | undefined;
    rightIcon?: IconSource | undefined;
    prefix?: React.ReactNode | undefined;
    suffix?: React.ReactNode | undefined;
    showCount?: boolean | undefined;
    mask?: string | undefined;
    actions?: React.ReactNode | undefined;
}
interface InputActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    icon?: IconSource | undefined;
    label: string;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
declare const InputAction: React.ForwardRefExoticComponent<InputActionProps & React.RefAttributes<HTMLButtonElement>>;
