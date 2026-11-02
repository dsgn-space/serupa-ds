// exports: Avatar, type AvatarProps, type AvatarSize, type AvatarStatus, initials
interface AvatarLabels {
    avatarStatus: (status: "away" | "busy" | "offline" | "online") => string;
}
declare function initials(name?: string): string;
type AvatarSize = "lg" | "md" | "sm" | "xl" | "xs";
type AvatarStatus = "away" | "busy" | "offline" | "online";
interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
    src?: string | undefined;
    name?: string | undefined;
    alt?: string | undefined;
    size?: AvatarSize | undefined;
    shape?: "circle" | "square" | undefined;
    status?: AvatarStatus | undefined;
    statusLabel?: string | undefined;
    imgProps?: React.ImgHTMLAttributes<HTMLImageElement> | undefined;
}
declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLSpanElement>>;
