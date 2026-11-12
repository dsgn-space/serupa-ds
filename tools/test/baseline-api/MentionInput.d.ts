// exports: MentionInput, type MentionInputProps
interface MentionOption {
    id: string;
    label: string;
    description?: React.ReactNode;
    avatar?: string | undefined;
    disabled?: boolean | undefined;
}
interface MentionInputProps extends Omit<TextareaProps, "defaultValue" | "value"> {
    options: readonly MentionOption[];
    value?: string | undefined;
    defaultValue?: string | undefined;
    onValueChange?: ((value: string) => void) | undefined;
    onQueryChange?: ((query: null | string) => void) | undefined;
    onMention?: ((option: MentionOption) => void) | undefined;
    trigger?: string | undefined;
    filter?: boolean | undefined;
    maxOptions?: number | undefined;
}
declare const MentionInput: React.ForwardRefExoticComponent<MentionInputProps & React.RefAttributes<HTMLTextAreaElement>>;
