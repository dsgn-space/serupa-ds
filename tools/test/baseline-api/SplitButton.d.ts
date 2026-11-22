// exports: SplitButton, type SplitButtonProps
interface SplitButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> {
    children: React.ReactNode;
    onClick?: ((event: React.MouseEvent<HTMLButtonElement>) => unknown) | undefined;
    menu: React.ReactNode;
    menuLabel: string;
    variant?: "outline" | "primary" | "secondary" | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    destructive?: boolean | undefined;
    startIcon?: IconSource | undefined;
    disabled?: boolean | undefined;
    loading?: boolean | undefined;
    placement?: Placement | undefined;
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
}
declare const SplitButton: React.FC<SplitButtonProps & React.RefAttributes<HTMLDivElement>>;
