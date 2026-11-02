// exports: Tour, type TourProps, type TourStep
interface TourLabels {
    tourBack: string;
    tourNext: string;
    tourDone: string;
}
interface TourStep {
    target?: Element | null | React.RefObject<Element | null> | string | undefined;
    title: React.ReactNode;
    content?: React.ReactNode | undefined;
    placement?: Placement | undefined;
}
interface TourProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "content" | "role" | "title"> {
    steps: readonly TourStep[];
    open?: boolean | undefined;
    defaultOpen?: boolean | undefined;
    onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
    step?: number | undefined;
    defaultStep?: number | undefined;
    onStepChange?: ((step: number) => void) | undefined;
    onFinish?: (() => void) | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
}
declare const Tour: React.ForwardRefExoticComponent<TourProps & React.RefAttributes<HTMLDivElement>>;
