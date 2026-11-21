// exports: type CropArea, cropImage, ImageCropper, type ImageCropperProps
interface ImageCropperLabels {
    cropArea: string;
    cropHint: string;
    cropZoom: string;
    cropZoomOut: string;
    cropZoomIn: string;
    cropFailed: string;
}
interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface ImageCropperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    src: string;
    aspect?: number | undefined;
    shape?: "rect" | "round" | undefined;
    defaultZoom?: number | undefined;
    maxZoom?: number | undefined;
    crop?: CropArea | null | undefined;
    defaultCrop?: CropArea | null | undefined;
    onCropChange?: ((area: CropArea) => void) | undefined;
    crossOrigin?: "" | "anonymous" | "use-credentials" | undefined;
    disabled?: boolean | undefined;
}
declare function cropImage(src: string, area: CropArea, options?: {
    width?: number;
    type?: string;
    quality?: number;
    crossOrigin?: "" | "anonymous" | "use-credentials";
}): Promise<Blob | null>;
declare const ImageCropper: React.FC<ImageCropperProps & React.RefAttributes<HTMLDivElement>>;
