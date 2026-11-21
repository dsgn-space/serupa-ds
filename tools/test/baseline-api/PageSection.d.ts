// exports: PageSection, type PageSectionProps
interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
    tone?: "muted" | "plain" | undefined;
    divider?: boolean | undefined;
    spacing?: "lg" | "md" | "sm" | undefined;
    size?: ContainerSize | undefined;
    align?: "center" | "start" | undefined;
    gap?: Space | undefined;
    as?: "aside" | "div" | "footer" | "header" | "section" | undefined;
}
declare const PageSection: React.FC<PageSectionProps & React.RefAttributes<HTMLElement>>;
