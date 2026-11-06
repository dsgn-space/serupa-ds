// exports: Stepper, type StepperProps, type StepperStep, useSteps, type UseSteps, type UseStepsOptions
interface StepperLabels {
    completed: string;
    hasError: string;
    hasWarning: string;
    stepOf: (step: number, total: number) => string;
}
interface StepperStep {
    title: React.ReactNode;
    description?: React.ReactNode | undefined;
    optional?: boolean | undefined;
    status?: "error" | "warning" | undefined;
}
interface StepperProps extends React.HTMLAttributes<HTMLElement> {
    steps: StepperStep[];
    current: number;
    orientation?: "horizontal" | "vertical" | undefined;
    size?: "md" | "sm" | undefined;
    onStepClick?: ((index: number) => void) | undefined;
    clickable?: "all" | "completed" | undefined;
    labels?: ({
        completed?: string;
        error?: string;
        warning?: string;
        optional?: string;
        stepOf?: (step: number, total: number) => string;
    }) | undefined;
}
declare const Stepper: React.ForwardRefExoticComponent<StepperProps & React.RefAttributes<HTMLElement>>;
interface UseStepsOptions {
    steps: StepperStep[];
    validate?: ((index: number) => boolean | Promise<boolean>) | undefined;
    onComplete?: (() => void) | undefined;
    defaultStep?: number | undefined;
}
interface UseSteps {
    current: number;
    next: () => Promise<boolean>;
    back: () => void;
    goTo: (index: number) => Promise<boolean>;
    isFirst: boolean;
    isLast: boolean;
    stepperProps: Pick<StepperProps, "current" | "onStepClick" | "steps">;
    panelProps: (index: number) => {
        id: string;
        hidden: boolean;
        "aria-labelledby": string;
    };
    headingProps: (index: number) => {
        id: string;
        tabIndex: -1;
        ref: (node: HTMLElement | null) => void;
    };
}
declare function useSteps(options: UseStepsOptions): UseSteps;
