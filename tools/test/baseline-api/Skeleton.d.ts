// exports: Skeleton, type SkeletonProps, type SkeletonShape
type SkeletonShape = "circle" | "rect" | "text";
interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
    shape?: SkeletonShape | undefined;
    lines?: number | undefined;
    size?: "lg" | "md" | "sm" | undefined;
    tone?: "inverse" | "neutral" | undefined;
    label?: string | undefined;
    delay?: number | undefined;
    loading?: boolean | undefined;
}
declare const Skeleton: React.FC<SkeletonProps & React.RefAttributes<HTMLSpanElement>>;
