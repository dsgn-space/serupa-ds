// exports: AppShell, type AppShellProps
interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
    header?: React.ReactNode | undefined;
    sidebar?: React.ReactNode | undefined;
    sidebarFrom?: "lg" | "md" | "sm" | undefined;
    children?: React.ReactNode | undefined;
    footer?: React.ReactNode | undefined;
    bottomNav?: React.ReactNode | undefined;
    background?: "muted" | "plain" | undefined;
    padded?: boolean | undefined;
    skipLink?: boolean | undefined;
    mainId?: string | undefined;
}
declare const AppShell: React.FC<AppShellProps & React.RefAttributes<HTMLDivElement>>;
