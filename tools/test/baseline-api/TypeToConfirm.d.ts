// exports: TypeToConfirm, type TypeToConfirmProps
interface TypeToConfirmLabels {
    typeToConfirm: string;
    typePhraseFirst: (phrase: string) => string;
}
interface TypeToConfirmProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    phrase: string;
    confirmLabel: React.ReactNode;
    onConfirm: () => unknown;
    label?: React.ReactNode | undefined;
    hint?: React.ReactNode | undefined;
    caseSensitive?: boolean | undefined;
    onMatch?: ((matched: boolean) => void) | undefined;
    disabled?: boolean | undefined;
}
declare const TypeToConfirm: React.ForwardRefExoticComponent<TypeToConfirmProps & React.RefAttributes<HTMLDivElement>>;
