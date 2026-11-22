// exports: IconButton, type IconButtonProps
type Without<T> = T extends unknown ? Omit<T, "aria-label" | "children" | "endIcon" | "icon" | "startIcon"> : never;
interface IconButtonOwnProps {
    icon: IconSource;
    label: string;
    shape?: "round" | "square" | undefined;
    hideTitle?: boolean | undefined;
}
type IconButtonProps = (Without<ButtonAsButtonProps> & IconButtonOwnProps) | (Without<ButtonAsLinkProps> & IconButtonOwnProps);
type IconButtonElement = HTMLAnchorElement | HTMLButtonElement;
declare const IconButton: React.FC<IconButtonProps & React.RefAttributes<IconButtonElement>>;
