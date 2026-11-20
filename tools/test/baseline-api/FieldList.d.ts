// exports: FieldList, type FieldListProps
interface FieldListLabels {
    fieldListLimit: (max: string) => string;
}
interface FieldListRow<T> {
    index: number;
    label: string;
    name: (field?: string) => string | undefined;
    update: (next: ((row: T) => T) | T) => void;
    error: React.ReactNode;
}
interface FieldListProps<T> extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "children" | "defaultValue" | "onChange"> {
    label: React.ReactNode;
    hint?: React.ReactNode | undefined;
    itemLabel: (index: number) => string;
    value?: readonly T[] | undefined;
    defaultValue?: readonly T[] | undefined;
    onChange?: ((rows: T[]) => void) | undefined;
    newItem: () => T;
    children: (row: T, state: FieldListRow<T>) => React.ReactNode;
    addLabel: string;
    min?: number | undefined;
    max?: number | undefined;
    name?: string | undefined;
    error?: React.ReactNode | undefined;
    errors?: readonly React.ReactNode[] | undefined;
    reorderable?: boolean | undefined;
    disabled?: boolean | undefined;
}
declare const FieldList: <T>(props: FieldListProps<T> & {
    ref?: React.Ref<HTMLFieldSetElement> | undefined;
}) => React.ReactElement;
