// exports: Heading, type HeadingLevel, type HeadingProps, type HeadingSize
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "2xl" | "3xl" | "4xl" | "5xl" | "base" | "lg" | "sm" | "xl";
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: HeadingLevel;
    size?: HeadingSize;
}
declare const Heading: React.ForwardRefExoticComponent<HeadingProps & React.RefAttributes<HTMLHeadingElement>>;
