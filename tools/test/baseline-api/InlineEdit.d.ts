// exports: InlineEdit, type InlineEditProps
interface InlineEditLabels {
    edit: string;
}
interface InlineEditProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
    label: string;
    value?: string | undefined;
    defaultValue?: string | undefined;
    onValueChange?: ((value: string) => void) | undefined;
    onCancel?: (() => void) | undefined;
    validate?: ((value: string) => Promise<React.ReactNode> | React.ReactNode) | undefined;
    placeholder?: string | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    editing?: boolean | undefined;
    defaultEditing?: boolean | undefined;
    onEditingChange?: ((editing: boolean) => void) | undefined;
    disabled?: boolean | undefined;
    readOnly?: boolean | undefined;
    editLabel?: string | undefined;
    inputProps?: Omit<InputProps, "aria-label" | "defaultValue" | "size" | "value"> | undefined;
}
declare const InlineEdit: React.ForwardRefExoticComponent<InlineEditProps & React.RefAttributes<HTMLDivElement>>;
