// exports: Container, type ContainerProps, type ContainerSize
type ContainerSize = "2xl" | "full" | "lg" | "md" | "prose" | "xl";
interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    size?: ContainerSize | undefined;
    padded?: boolean | undefined;
    as?: "article" | "div" | "footer" | "header" | "main" | "section" | undefined;
}
declare const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLElement>>;
