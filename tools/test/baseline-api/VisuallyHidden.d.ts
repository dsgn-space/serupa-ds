// exports: VisuallyHidden, type VisuallyHiddenProps
interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
    focusable?: boolean | undefined;
    as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label" | "legend" | "p" | "span" | undefined;
}
declare const VisuallyHidden: React.ForwardRefExoticComponent<VisuallyHiddenProps & React.RefAttributes<HTMLElement>>;
