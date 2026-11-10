// exports: Field, type FieldProps
interface FieldLabels {
    fieldOptional: string;
}
interface FieldProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    label?: React.ReactNode | undefined;
    hint?: React.ReactNode | undefined;
    error?: React.ReactNode | undefined;
    required?: boolean | undefined;
    optional?: boolean | string | undefined;
    disabled?: boolean | undefined;
    group?: boolean | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
    layout?: "horizontal" | "vertical" | undefined;
    id?: string | undefined;
    children?: React.ReactNode | undefined;
}
declare const Field: React.ForwardRefExoticComponent<FieldProps & React.RefAttributes<HTMLElement>>;
