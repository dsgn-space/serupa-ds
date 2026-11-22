// exports: Attachment, type AttachmentProps
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
interface AttachmentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    name: string;
    bytes?: number | undefined;
    type?: string | undefined;
    kind?: AttachmentKind | undefined;
    href?: string | undefined;
    download?: boolean | string | undefined;
    progress?: null | number | undefined;
    thumbnail?: React.ReactNode | undefined;
    done?: boolean | undefined;
    error?: boolean | React.ReactNode | undefined;
    onRetry?: (() => void) | undefined;
    onRemove?: (() => void) | undefined;
    removeLabel?: ((name: string) => string) | undefined;
    disabled?: boolean | undefined;
}
declare const Attachment: React.FC<AttachmentProps & React.RefAttributes<HTMLDivElement>>;
