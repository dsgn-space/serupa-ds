// exports: Logo, type LogoProps, type LogoSize
type LogoSize = "lg" | "md" | "sm";
interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt" | "children" | "src"> {
    src: string;
    alt: string;
    darkSrc?: string | undefined;
    markSrc?: string | undefined;
    markDarkSrc?: string | undefined;
    variant?: "auto" | "full" | "mark" | undefined;
    collapseBelow?: "lg" | "md" | "sm" | undefined;
    size?: LogoSize | undefined;
}
declare const Logo: React.ForwardRefExoticComponent<LogoProps & React.RefAttributes<HTMLImageElement>>;
