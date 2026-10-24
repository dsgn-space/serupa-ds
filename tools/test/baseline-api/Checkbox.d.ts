// exports: Checkbox, type CheckboxProps
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    size?: "lg" | "md" | "sm";
    children?: React.ReactNode;
    description?: React.ReactNode;
    indeterminate?: boolean;
    invalid?: boolean;
    readOnly?: boolean;
}
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
