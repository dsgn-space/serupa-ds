// exports: encodeQR, QRCode, type QRCodeProps, type QRCodeStatus, type QRErrorLevel
interface QRCodeLabels {
    qrExpired: string;
    qrRefresh: string;
    qrScanned: string;
}
type QRErrorLevel = "H" | "L" | "M" | "Q";
declare function encodeQR(text: string, level?: QRErrorLevel): boolean[][];
type QRCodeStatus = "active" | "expired" | "loading" | "scanned";
interface QRCodeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    value: string;
    label: string;
    size?: "lg" | "md" | "sm" | undefined;
    level?: QRErrorLevel | undefined;
    logo?: string | undefined;
    status?: QRCodeStatus | undefined;
    onRefresh?: (() => void) | undefined;
}
declare const QRCode: React.FC<QRCodeProps & React.RefAttributes<HTMLDivElement>>;
