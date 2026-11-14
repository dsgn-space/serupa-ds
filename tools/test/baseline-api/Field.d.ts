// exports: Field, type FieldProps, FormErrors, type FormErrorsProps
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
    name?: string | undefined;
    id?: string | undefined;
    children?: React.ReactNode | undefined;
}
declare const Field: React.ForwardRefExoticComponent<FieldProps & React.RefAttributes<HTMLElement>>;
interface FormErrorsProps {
    errors?: null | Readonly<Record<string, React.ReactNode>> | undefined;
    children?: React.ReactNode | undefined;
}
declare function FormErrors(props: FormErrorsProps): React.ReactElement;
