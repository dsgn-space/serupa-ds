// exports: MentionInput, type MentionInputProps, type MentionOption, mentionQuery, mentionsIn
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
    onSearch?: ((query: null | string) => void) | undefined;
    onMention?: ((option: MentionOption) => void) | undefined;
    trigger?: string | undefined;
    filter?: boolean | undefined;
    maxOptions?: number | undefined;
}
type Query = {
    start: number;
    text: string;
};
declare function mentionQuery(text: string, caret: number, trigger?: string): null | Query;
declare function mentionsIn(text: string, options: readonly MentionOption[], trigger?: string): MentionOption[];
declare const MentionInput: React.ForwardRefExoticComponent<MentionInputProps & React.RefAttributes<HTMLTextAreaElement>>;
