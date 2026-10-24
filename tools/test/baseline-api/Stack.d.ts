// exports: Stack, type StackProps
interface StackProps extends React.HTMLAttributes<HTMLElement> {
    direction?: "column" | "row";
    gap?: Space;
    align?: "baseline" | "center" | "end" | "start" | "stretch";
    justify?: "between" | "center" | "end" | "start";
    wrap?: boolean;
    as?: "div" | "fieldset" | "footer" | "form" | "header" | "nav" | "ol" | "section" | "span" | "ul";
}
declare const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLElement>>;
