// exports: Select, type SelectOption, type SelectOptionGroup, type SelectProps
type SelectOption = {
    value: number | string;
    label?: React.ReactNode;
    disabled?: boolean;
} | number | string;
interface SelectOptionGroup {
    label: string;
    options: SelectOption[];
    disabled?: boolean;
}
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "multiple" | "size"> {
    size?: "lg" | "md" | "sm";
    invalid?: boolean;
    leftIcon?: IconSource;
    placeholder?: string;
    options?: Array<SelectOption | SelectOptionGroup>;
}
declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
