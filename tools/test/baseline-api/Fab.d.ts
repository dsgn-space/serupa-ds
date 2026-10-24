// exports: Fab, type FabPosition, type FabProps
type FabPosition = "bottom-end" | "bottom-start" | "static" | "top-end" | "top-start";
interface FabProps extends Omit<ButtonAsButtonProps, "aria-label" | "children" | "icon" | "leftIcon" | "rightIcon" | "size" | "variant"> {
    icon: IconSource;
    label: string;
    extended?: boolean;
    size?: "md" | "sm";
    position?: FabPosition;
}
declare const Fab: React.ForwardRefExoticComponent<FabProps & React.RefAttributes<HTMLButtonElement>>;
