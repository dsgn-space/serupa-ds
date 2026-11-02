// exports: OfflineBanner, type OfflineBannerProps
interface OfflineBannerLabels {
    offline: string;
    backOnline: string;
}
interface OfflineBannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    online?: boolean;
    placement?: "bottom" | "inline" | "top";
    children?: React.ReactNode;
    onChange?: (online: boolean) => void;
}
declare const OfflineBanner: React.ForwardRefExoticComponent<OfflineBannerProps & React.RefAttributes<HTMLDivElement>>;
