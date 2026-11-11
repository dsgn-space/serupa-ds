// exports: Chat, ChatComposer, type ChatComposerProps, ChatDivider, type ChatDividerProps, ChatMessage, type ChatMessageProps, type ChatProps
interface ChatLabels {
    chatNewMessages: (count: number) => string;
    chatLoadOlder: string;
    chatLoadingOlder: string;
    chatSending: string;
    chatNotSent: string;
    chatRetry: string;
    chatYou: string;
    chatMessage: string;
    chatSend: string;
    chatStop: string;
}
interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    hasOlder?: boolean | undefined;
    onLoadOlder?: (() => void) | undefined;
    loadingOlder?: boolean | undefined;
}
declare const Chat: React.ForwardRefExoticComponent<ChatProps & React.RefAttributes<HTMLDivElement>>;
interface ChatMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    children?: React.ReactNode;
    author?: React.ReactNode | undefined;
    avatar?: React.ReactNode | undefined;
    time?: Date | number | string | undefined;
    own?: boolean | undefined;
    hideAuthor?: boolean | undefined;
    status?: "failed" | "sending" | undefined;
    onRetry?: (() => void) | undefined;
    attachments?: React.ReactNode | undefined;
    streaming?: boolean | undefined;
}
declare const ChatMessage: React.ForwardRefExoticComponent<ChatMessageProps & React.RefAttributes<HTMLDivElement>>;
interface ChatDividerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    date?: Date | number | string | undefined;
    children?: React.ReactNode;
}
declare const ChatDivider: React.ForwardRefExoticComponent<ChatDividerProps & React.RefAttributes<HTMLDivElement>>;
interface ChatComposerProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "children" | "defaultValue" | "onSubmit"> {
    value?: string | undefined;
    defaultValue?: string | undefined;
    onValueChange?: ((value: string) => void) | undefined;
    onSend?: ((text: string) => void) | undefined;
    streaming?: boolean | undefined;
    onStop?: (() => void) | undefined;
    placeholder?: string | undefined;
    disabled?: boolean | undefined;
    attachments?: React.ReactNode | undefined;
    actions?: React.ReactNode | undefined;
    maxRows?: number | undefined;
}
declare const ChatComposer: React.ForwardRefExoticComponent<ChatComposerProps & React.RefAttributes<HTMLFormElement>>;
