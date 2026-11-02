// exports: Stepper, type StepperProps, type StepperStep, useSteps, type UseSteps, type UseStepsOptions
interface StepperLabels {
    completed: string;
    hasError: string;
    hasWarning: string;
    stepOf: (step: number, total: number) => string;
}
interface StepperStep {
    title: React.ReactNode;
    description?: React.ReactNode;
    optional?: boolean;
    status?: "error" | "warning";
}
interface StepperProps extends React.HTMLAttributes<HTMLElement> {
    steps: StepperStep[];
    current: number;
    orientation?: "horizontal" | "vertical";
    size?: "md" | "sm";
    onStepClick?: (index: number) => void;
    clickable?: "all" | "completed";
    labels?: {
        completed?: string;
        error?: string;
        warning?: string;
        optional?: string;
        stepOf?: (step: number, total: number) => string;
    };
}
declare const Stepper: React.ForwardRefExoticComponent<StepperProps & React.RefAttributes<HTMLElement>>;
interface UseStepsOptions {
    steps: StepperStep[];
    validate?: (index: number) => boolean | Promise<boolean>;
    onComplete?: () => void;
    defaultStep?: number;
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
