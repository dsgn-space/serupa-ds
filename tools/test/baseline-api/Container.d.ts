// exports: Container, type ContainerProps, type ContainerSize
type ContainerSize = "2xl" | "full" | "lg" | "md" | "prose" | "xl";
interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    size?: ContainerSize;
    padded?: boolean;
    as?: "article" | "div" | "footer" | "header" | "main" | "section";
}
declare const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLElement>>;
