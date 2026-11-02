// exports: Tour, type TourProps
interface TourLabels {
    tourBack: string;
    tourNext: string;
    tourDone: string;
}
interface TourStep {
    target?: Element | null | React.RefObject<Element | null> | string;
    title: React.ReactNode;
    content?: React.ReactNode;
    placement?: Placement;
}
interface TourProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "content" | "role" | "title"> {
    steps: readonly TourStep[];
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
    step?: number;
    defaultStep?: number;
    onStepChange?: (step: number) => void;
    onFinish?: () => void;
    headingLevel?: 2 | 3 | 4 | 5 | 6;
}
declare const Tour: React.ForwardRefExoticComponent<TourProps & React.RefAttributes<HTMLDivElement>>;
