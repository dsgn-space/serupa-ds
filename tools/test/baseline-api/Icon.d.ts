// exports: Icon, type IconName, type IconProps, type IconSize, type IconSource, type IconWeight
type IconName = (string & {}) | CustomIconName | MaterialIconName;
type IconSource = IconData | IconName | React.ReactNode;
interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    name?: IconName;
    icon?: IconData;
    size?: (string & {}) | IconSize | number;
    weight?: IconWeight;
    mirror?: "auto" | boolean;
}
type IconSize = "lg" | "md" | "sm" | "xl" | "xs";
type IconWeight = "bold" | "regular" | "semibold";
declare const Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<HTMLSpanElement>>;
