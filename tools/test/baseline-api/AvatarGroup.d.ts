// exports: AvatarGroup, type AvatarGroupProps
interface AvatarGroupLabels {
    avatarMore: (count: number) => string;
}
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode | undefined;
    max?: number | undefined;
    total?: number | undefined;
    size?: AvatarSize | undefined;
    moreLabel?: ((count: number) => string) | undefined;
    label?: string | undefined;
    showMore?: boolean | undefined;
    onMore?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | undefined;
}
declare const AvatarGroup: React.ForwardRefExoticComponent<AvatarGroupProps & React.RefAttributes<HTMLDivElement>>;
