// exports: Form, type FormCheck, type FormHandle, type FormProps, FormStep, type FormStepProps, FormSteps, type FormStepsProps, type FormSubmitResult, useForm, useFormValue
interface FormLabels {
    formErrorTitle: (title: string) => string;
    formChecking: string;
    formNext: string;
    formBack: string;
}
interface FormSubmitResult {
    errors?: null | Readonly<Record<string, React.ReactNode>> | undefined;
    message?: React.ReactNode;
}
type FormCheck = (value: unknown, context: {
    values: Record<string, unknown>;
    signal: AbortSignal;
}) => Promise<React.ReactNode> | React.ReactNode;
interface FormHandle {
    values: () => Record<string, unknown>;
    defaults: Record<string, unknown>;
    setErrors: (errors: null | Readonly<Record<string, React.ReactNode>>, message?: React.ReactNode) => void;
    validate: (names?: readonly string[]) => Promise<boolean>;
    submit: () => void;
    reset: () => void;
    discardDraft: () => void;
    dirty: boolean;
    submitting: boolean;
    submitCount: number;
    draftSavedAt: null | number;
    draftRestored: boolean;
}
type In<S> = S extends StandardSchemaV1 ? InferInput<S> : Record<string, unknown>;
type Out<S> = S extends StandardSchemaV1 ? InferOutput<S> : Record<string, unknown>;
type DeepPartial<T> = T extends readonly (infer U)[] ? readonly DeepPartial<U>[] : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;
interface FormProps<S extends StandardSchemaV1 | undefined = undefined> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "action" | "children" | "defaultValue" | "onSubmit"> {
    schema?: S | undefined;
    defaultValues?: DeepPartial<In<S>> | undefined;
    onSubmit?: ((values: Out<S>, form: FormHandle) => FormSubmitResult | Promise<FormSubmitResult | undefined | void> | void) | undefined;
    checks?: Readonly<Record<string, FormCheck>> | undefined;
    errors?: null | Readonly<Record<string, React.ReactNode>> | undefined;
    message?: React.ReactNode;
    draft?: string | undefined;
    warnUnsaved?: boolean | undefined;
    summary?: boolean | undefined;
    onUnsavedChanges?: ((unsaved: boolean) => void) | undefined;
    onEdit?: ((values: Record<string, unknown>) => void) | undefined;
    children?: React.ReactNode | undefined;
}
declare const Form: <S extends StandardSchemaV1 | undefined = undefined>(props: FormProps<S> & {
    ref?: React.Ref<HTMLFormElement> | undefined;
}) => React.ReactElement;
declare function useForm(): FormHandle;
declare function useFormValue<T = unknown>(name: string): T;
interface FormStepProps {
    title: React.ReactNode;
    description?: React.ReactNode | undefined;
    optional?: boolean | undefined;
    children?: React.ReactNode | undefined;
}
declare function FormStep(props: FormStepProps): React.ReactElement;
interface FormStepsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    children: React.ReactNode;
    submitLabel: React.ReactNode;
    step?: number | undefined;
    defaultStep?: number | undefined;
    onStepChange?: ((step: number) => void) | undefined;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
}
declare const FormSteps: React.FC<FormStepsProps & React.RefAttributes<HTMLDivElement>>;
