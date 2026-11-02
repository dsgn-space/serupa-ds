// exports: OfflineBanner, type OfflineBannerProps
interface OfflineBannerLabels {
    offline: string;
    backOnline: string;
}
interface OfflineBannerProps extends React.HTMLAttributes<HTMLDivElement> {
    online?: boolean;
    placement?: "bottom" | "inline" | "top";
    children?: React.ReactNode;
    onChange?: (online: boolean) => void;
}
declare const OfflineBanner: React.ForwardRefExoticComponent<OfflineBannerProps & React.RefAttributes<HTMLDivElement>>;
