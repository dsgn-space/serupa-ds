// exports: type FileRejection, FileUpload, type FileUploadProps, type FileUploadStatus, formatFileSize
interface FileUploadLabels {
    dragFiles: string;
    dragFile: string;
    chooseFiles: string;
    chooseFile: string;
    chosenFiles: string;
    chosenFile: string;
    fileWrongType: (name: string, types: null | string[]) => string;
    fileTooLarge: (name: string, limit: string) => string;
    fileTooMany: (name: string, max: number) => string;
    fileOnlyOne: (name: string) => string;
    fileMissing: (multiple: boolean) => string;
    fileFolder: (name: string) => string;
    fileAlreadyAdded: (name: string) => string;
    filesAdded: (names: string[]) => string;
    fileRemoved: (name: string) => string;
    fileError: string;
}
declare function formatFileSize(bytes: number, locale?: string): string;
interface FileUploadStatus {
    state: "done" | "error" | "uploading";
    progress?: number | undefined;
    message?: React.ReactNode | undefined;
}
type FileRejection = {
    file: File;
    reason: "count" | "duplicate" | "folder" | "size" | "type";
    message: string;
};
interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "title"> {
    files?: File[] | undefined;
    onFilesChange?: ((files: File[]) => void) | undefined;
    onReject?: ((rejections: FileRejection[]) => void) | undefined;
    accept?: string | undefined;
    multiple?: boolean | undefined;
    maxSize?: number | undefined;
    maxFiles?: number | undefined;
    disabled?: boolean | undefined;
    invalid?: boolean | undefined;
    required?: boolean | undefined;
    readOnly?: boolean | undefined;
    name?: string | undefined;
    form?: string | undefined;
    title?: React.ReactNode | undefined;
    buttonLabel?: string | undefined;
    hint?: React.ReactNode | undefined;
    removeLabel?: ((name: string) => string) | undefined;
    fileStatus?: ((file: File) => FileUploadStatus | null | undefined) | undefined;
    onRetry?: ((file: File) => void) | undefined;
    thumbnails?: boolean | undefined;
}
declare const FileUpload: React.ForwardRefExoticComponent<FileUploadProps & React.RefAttributes<HTMLDivElement>>;
