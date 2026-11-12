// exports: Lightbox, type LightboxItem, type LightboxProps
interface LightboxLabels {
    previousImage: string;
    nextImage: string;
    imageOf: (image: number, total: number) => string;
}
interface LightboxItem {
    src: string;
    alt: string;
    caption?: React.ReactNode | undefined;
    width?: number | undefined;
    height?: number | undefined;
}
interface LightboxProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "children" | "open" | "title"> {
    items: readonly LightboxItem[];
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    index?: number | undefined;
    defaultIndex?: number | undefined;
    onIndexChange?: ((index: number) => void) | undefined;
    loop?: boolean | undefined;
}
declare const Lightbox: React.ForwardRefExoticComponent<LightboxProps & React.RefAttributes<HTMLDialogElement>>;
