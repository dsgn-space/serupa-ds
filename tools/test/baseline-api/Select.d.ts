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
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    leftIcon?: IconSource | undefined;
    placeholder?: string | undefined;
    options?: Array<SelectOption | SelectOptionGroup> | undefined;
}
declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
