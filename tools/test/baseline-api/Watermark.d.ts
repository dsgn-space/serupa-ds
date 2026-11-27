// exports: Watermark, type WatermarkProps
interface WatermarkProps extends React.HTMLAttributes<HTMLDivElement> {
    text: readonly string[] | string;
    gap?: "lg" | "md" | undefined;
    rotate?: number | undefined;
    fullPage?: boolean | undefined;
    children?: React.ReactNode;
}
declare const Watermark: React.FC<WatermarkProps & React.RefAttributes<HTMLDivElement>>;
