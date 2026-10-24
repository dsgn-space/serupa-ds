// exports: Stepper, type StepperProps, type StepperStep
interface StepperLabels {
    completed: string;
    hasError: string;
    stepOf: (step: number, total: number) => string;
}
interface StepperStep {
    title: React.ReactNode;
    description?: React.ReactNode;
    optional?: boolean;
    status?: "error";
}
interface StepperProps extends React.HTMLAttributes<HTMLElement> {
    steps: StepperStep[];
    current: number;
    orientation?: "horizontal" | "vertical";
    size?: "md" | "sm";
    onStepClick?: (index: number) => void;
    labels?: {
        completed?: string;
        error?: string;
        optional?: string;
        stepOf?: (step: number, total: number) => string;
    };
}
declare const Stepper: React.ForwardRefExoticComponent<StepperProps & React.RefAttributes<HTMLElement>>;
