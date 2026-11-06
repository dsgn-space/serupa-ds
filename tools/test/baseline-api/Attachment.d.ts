// exports: Attachment, attachmentKind, type AttachmentKind, type AttachmentProps
interface AttachmentLabels {
    attachmentPdf: string;
    attachmentImage: string;
    attachmentSheet: string;
    attachmentDoc: string;
    attachmentSlides: string;
    attachmentArchive: string;
    attachmentCode: string;
    attachmentAudio: string;
    attachmentVideo: string;
    attachmentOther: string;
}
type AttachmentKind = "archive" | "audio" | "code" | "doc" | "image" | "other" | "pdf" | "sheet" | "slides" | "video";
declare function attachmentKind(name: string, type?: string): AttachmentKind;
interface AttachmentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    name: string;
    bytes?: number | undefined;
    type?: string | undefined;
    kind?: AttachmentKind | undefined;
    href?: string | undefined;
    download?: boolean | string | undefined;
    progress?: null | number | undefined;
    error?: boolean | React.ReactNode | undefined;
    onRetry?: (() => void) | undefined;
    onRemove?: (() => void) | undefined;
    removeLabel?: ((name: string) => string) | undefined;
    disabled?: boolean | undefined;
}
declare const Attachment: React.ForwardRefExoticComponent<AttachmentProps & React.RefAttributes<HTMLDivElement>>;
