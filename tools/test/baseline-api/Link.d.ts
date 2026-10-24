// exports: Link, type LinkProps
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    tone?: "neutral" | "primary";
    underline?: "always" | "hover";
    external?: boolean;
    as?: React.ElementType;
}
declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
