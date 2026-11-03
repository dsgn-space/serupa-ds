// exports: Image, type ImageProps, type ImageRatio, type ImageSource
interface ImageLabels {
    viewImage: string;
    removeImage: string;
}
type ImageRatio = "4:3" | "auto" | "square" | "video" | number;
interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt" | "children" | "placeholder" | "src"> {
    src: string;
    alt: string;
    ratio?: ImageRatio | undefined;
    fit?: "contain" | "cover" | undefined;
    rounded?: boolean | undefined;
    fallback?: React.ReactNode | undefined;
    viewable?: boolean | undefined;
    fullSrc?: string | undefined;
    viewLabel?: string | undefined;
    onRemove?: (() => void) | undefined;
    removeLabel?: string | undefined;
    priority?: boolean | undefined;
    sources?: ImageSource[] | undefined;
    darkSrc?: string | undefined;
    dim?: boolean | undefined;
    frameProps?: React.HTMLAttributes<HTMLSpanElement> | undefined;
}
interface ImageSource {
    srcSet: string;
    media?: string | undefined;
    type?: string | undefined;
    sizes?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
}
declare const Image: React.ForwardRefExoticComponent<ImageProps & React.RefAttributes<HTMLImageElement>>;
