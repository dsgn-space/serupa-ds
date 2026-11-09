// exports: IconTile, type IconTileProps, type IconTileSize, type IconTileTone
type IconTileTone = "danger" | "info" | "neutral" | "primary" | "success" | "warning";
type IconTileSize = "lg" | "md" | "sm" | "xl";
interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
    icon: IconSource;
    tone?: IconTileTone | undefined;
    size?: IconTileSize | undefined;
    shape?: "circle" | "square" | undefined;
    label?: string | undefined;
}
declare const IconTile: React.ForwardRefExoticComponent<IconTileProps & React.RefAttributes<HTMLSpanElement>>;
