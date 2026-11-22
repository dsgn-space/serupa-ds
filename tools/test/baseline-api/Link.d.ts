// exports: Link, type LinkOwnProps, type LinkProps
interface LinkLabels {
    opensInNewTab: string;
}
interface LinkOwnProps {
    tone?: "neutral" | "primary" | undefined;
    surface?: "dark" | "light" | undefined;
    underline?: "always" | "hover" | undefined;
    external?: boolean | undefined;
}
type LinkProps<C extends React.ElementType = "a"> = LinkOwnProps & {
    as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | keyof LinkOwnProps>;
declare const Link: {
    <C extends React.ElementType = "a">(props: LinkProps<C> & React.RefAttributes<React.ComponentRef<C>>): null | React.ReactElement;
    displayName?: string | undefined;
};
