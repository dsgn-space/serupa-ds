// exports: Stack, type StackProps
interface StackProps extends React.HTMLAttributes<HTMLElement> {
    direction?: "column" | "row" | ByWidth<"column" | "row"> | undefined;
    gap?: ByWidth<Space> | Space | undefined;
    align?: "baseline" | "center" | "end" | "start" | "stretch" | ByWidth<"baseline" | "center" | "end" | "start" | "stretch"> | undefined;
    justify?: "between" | "center" | "end" | "start" | undefined;
    wrap?: boolean | undefined;
    as?: "div" | "fieldset" | "footer" | "form" | "header" | "nav" | "ol" | "section" | "span" | "ul" | undefined;
}
declare const Stack: React.FC<StackProps & React.RefAttributes<HTMLElement>>;
