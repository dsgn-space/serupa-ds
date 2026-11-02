// exports: Button, type ButtonAsButtonProps, type ButtonAsLinkProps, buttonClass, type ButtonProps, type ButtonSize, type ButtonVariant
declare function buttonClass(opts?: {
    variant?: ButtonVariant;
    destructive?: boolean;
    size?: ButtonSize;
    iconOnly?: boolean;
    iconPosition?: "left" | "right";
    wrap?: boolean;
    className?: string;
}): string;
type ButtonVariant = "ghost" | "link" | "outline" | "primary" | "secondary";
type ButtonSize = "lg" | "md" | "sm";
interface ButtonOwnProps {
    variant?: ButtonVariant | undefined;
    destructive?: boolean | undefined;
    size?: ButtonSize | undefined;
    leftIcon?: IconSource | undefined;
    rightIcon?: IconSource | undefined;
    icon?: IconSource | undefined;
    loading?: boolean | undefined;
    loadingText?: string | undefined;
    disabledReason?: string | undefined;
    successText?: string | undefined;
    wrap?: boolean | undefined;
}
interface ButtonAsButtonProps extends ButtonOwnProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type"> {
    href?: undefined;
    onClick?: ((event: React.MouseEvent<HTMLButtonElement>) => unknown) | undefined;
    type?: "button" | "reset" | "submit" | undefined;
    popoverTarget?: string | undefined;
    popoverTargetAction?: "hide" | "show" | "toggle" | undefined;
    commandfor?: string | undefined;
    command?: string | undefined;
}
interface ButtonAsLinkProps extends ButtonOwnProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "onClick" | "type"> {
    onClick?: ((event: React.MouseEvent<HTMLAnchorElement>) => unknown) | undefined;
    href: string;
    disabled?: boolean | undefined;
}
type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;
declare const Button: {
    (props: ButtonAsButtonProps & React.RefAttributes<HTMLButtonElement>): null | React.ReactElement;
    (props: ButtonAsLinkProps & React.RefAttributes<HTMLAnchorElement>): null | React.ReactElement;
    displayName?: string | undefined;
};
