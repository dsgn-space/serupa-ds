// exports: Fab, type FabPosition, type FabProps
type FabPosition = "bottom-end" | "bottom-start" | "static" | "top-end" | "top-start";
interface FabProps extends Omit<ButtonAsButtonProps, "aria-label" | "children" | "icon" | "leftIcon" | "rightIcon" | "size" | "variant"> {
    icon: IconSource;
    label: string;
    extended?: "auto" | boolean | undefined;
    size?: "md" | "sm" | undefined;
    placement?: FabPosition | undefined;
}
declare const Fab: React.FC<FabProps & React.RefAttributes<HTMLButtonElement>>;
