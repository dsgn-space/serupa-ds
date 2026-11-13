// exports: TransferList, type TransferListOption, type TransferListProps
interface TransferListLabels {
    transferAvailable: string;
    transferChosen: string;
    transferAdd: string;
    transferRemove: string;
    transferAll: string;
    transferAddReason: string;
    transferRemoveReason: string;
    transferEmpty: string;
    transferMoved: (items: string, list: string) => string;
}
interface TransferListOption {
    value: string;
    label: string;
    description?: string | undefined;
    disabled?: boolean | undefined;
}
interface TransferListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    options: readonly TransferListOption[];
    value?: readonly string[] | undefined;
    defaultValue?: readonly string[] | undefined;
    onValueChange?: ((value: string[]) => void) | undefined;
    name?: string | undefined;
    form?: string | undefined;
    disabled?: boolean | undefined;
    invalid?: boolean | undefined;
    availableLabel?: string | undefined;
    chosenLabel?: string | undefined;
}
declare const TransferList: React.ForwardRefExoticComponent<TransferListProps & React.RefAttributes<HTMLDivElement>>;
