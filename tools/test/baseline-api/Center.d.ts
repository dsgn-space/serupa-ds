// exports: Center, type CenterProps
interface CenterProps extends React.HTMLAttributes<HTMLElement> {
    maxWidth?: string | undefined;
    vertical?: boolean | undefined;
    intrinsic?: boolean | undefined;
    centerText?: boolean | undefined;
    padded?: boolean | undefined;
    as?: "article" | "div" | "main" | "section" | undefined;
}
declare const Center: React.FC<CenterProps & React.RefAttributes<HTMLElement>>;
