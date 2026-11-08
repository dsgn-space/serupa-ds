// exports: type CascadeOption, CascadeSelect, type CascadeSelectProps
interface CascadeSelectLabels {
    cascadePlaceholder: string;
    cascadePath: (labels: string[]) => string;
    cascadeLevel: (level: number) => string;
    cascadeHasMore: (rtl: boolean) => string;
    cascadeBack: string;
    cascadeLoading: string;
    cascadeEmpty: string;
    cascadeFailed: string;
}
interface CascadeOption {
    value: string;
    label: string;
    children?: CascadeOption[] | undefined;
    isLeaf?: boolean | undefined;
    disabled?: boolean | undefined;
}
interface CascadeSelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "defaultValue" | "onChange" | "type" | "value"> {
    options: CascadeOption[];
    value?: string[] | undefined;
    defaultValue?: string[] | undefined;
    onValueChange?: ((value: string[], details: {
        options: CascadeOption[];
    }) => void) | undefined;
    loadOptions?: ((path: CascadeOption[]) => Promise<CascadeOption[]>) | undefined;
    levels?: string[] | undefined;
    selectParents?: boolean | undefined;
    placeholder?: string | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    invalid?: boolean | undefined;
    name?: string | undefined;
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: {
        reason: "escape" | "outside" | "reset" | "select" | "trigger";
    }) => void) | undefined;
}
declare const CascadeSelect: React.ForwardRefExoticComponent<CascadeSelectProps & React.RefAttributes<HTMLButtonElement>>;
