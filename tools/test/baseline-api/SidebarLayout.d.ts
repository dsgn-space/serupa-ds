// exports: SidebarLayout, type SidebarLayoutProps
interface SidebarLayoutProps extends React.HTMLAttributes<HTMLElement> {
    side: React.ReactNode;
    children?: React.ReactNode | undefined;
    sidePosition?: "end" | "start" | undefined;
    sideWidth?: string | undefined;
    contentMin?: number | undefined;
    gap?: Space | undefined;
    align?: "start" | "stretch" | undefined;
    as?: "article" | "div" | "main" | "section" | undefined;
}
declare const SidebarLayout: React.FC<SidebarLayoutProps & React.RefAttributes<HTMLElement>>;
