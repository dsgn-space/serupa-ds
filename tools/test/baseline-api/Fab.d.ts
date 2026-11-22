// exports: Fab, type FabPlacement, type FabPosition, type FabProps
type FabPlacement = "bottom-end" | "bottom-start" | "static" | "top-end" | "top-start";
type FabPosition = "bottom-end" | "bottom-start" | "static" | "top-end" | "top-start";
interface FabProps extends Omit<ButtonAsButtonProps, "aria-label" | "children" | "endIcon" | "icon" | "size" | "startIcon" | "variant"> {
    icon: IconSource;
    label: string;
    extended?: "auto" | boolean | undefined;
    size?: "md" | "sm" | undefined;
    placement?: FabPlacement | undefined;
}
declare const Fab: React.FC<FabProps & React.RefAttributes<HTMLButtonElement>>;
