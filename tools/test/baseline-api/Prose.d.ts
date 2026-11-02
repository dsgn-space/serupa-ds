// exports: Prose, type ProseProps
interface ProseProps extends React.HTMLAttributes<HTMLElement> {
    as?: "article" | "div" | "section" | undefined;
    children?: React.ReactNode | undefined;
}
declare const Prose: React.ForwardRefExoticComponent<ProseProps & React.RefAttributes<HTMLElement>>;
