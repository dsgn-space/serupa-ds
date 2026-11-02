// exports: Logo, type LogoProps, type LogoSize
type LogoSize = "lg" | "md" | "sm";
interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt" | "children" | "src"> {
    src: string;
    alt: string;
    darkSrc?: string;
    markSrc?: string;
    markDarkSrc?: string;
    variant?: "auto" | "full" | "mark";
    collapseBelow?: "lg" | "md" | "sm";
    size?: LogoSize;
}
declare const Logo: React.ForwardRefExoticComponent<LogoProps & React.RefAttributes<HTMLImageElement>>;
