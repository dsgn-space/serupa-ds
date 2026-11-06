// exports: OfflineBanner, type OfflineBannerProps
interface OfflineBannerLabels {
    offline: string;
    backOnline: string;
}
interface OfflineBannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    online?: boolean | undefined;
    placement?: "bottom" | "inline" | "top" | undefined;
    children?: React.ReactNode | undefined;
    onOnlineChange?: ((online: boolean) => void) | undefined;
    onChange?: ((online: boolean) => void) | undefined;
}
declare const OfflineBanner: React.ForwardRefExoticComponent<OfflineBannerProps & React.RefAttributes<HTMLDivElement>>;
