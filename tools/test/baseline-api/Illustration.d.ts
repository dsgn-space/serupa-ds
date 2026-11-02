// exports: Illustration, type IllustrationName, type IllustrationProps
declare const NAMES: readonly [
    "empty",
    "search",
    "error",
    "offline",
    "no-access",
    "success"
];
type IllustrationName = (typeof NAMES)[number];
interface IllustrationProps extends Omit<React.SVGAttributes<SVGSVGElement>, "name"> {
    name?: IllustrationName;
    size?: "lg" | "md" | "sm";
    label?: string;
}
declare const Illustration: React.ForwardRefExoticComponent<IllustrationProps & React.RefAttributes<SVGSVGElement>>;
