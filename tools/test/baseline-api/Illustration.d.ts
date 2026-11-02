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
    name?: IllustrationName | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    label?: string | undefined;
}
declare const Illustration: React.ForwardRefExoticComponent<IllustrationProps & React.RefAttributes<SVGSVGElement>>;
