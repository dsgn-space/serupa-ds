// exports: Chat, ChatApproval, type ChatApprovalProps, type ChatApprovalStatus, ChatCitation, type ChatCitationProps, ChatComposer, type ChatComposerProps, ChatDivider, type ChatDividerProps, type ChatFeedback, ChatMessage, type ChatMessageProps, type ChatProps, ChatReplyActions, type ChatReplyActionsProps, type ChatStep, ChatSteps, type ChatStepsProps, type ChatStepStatus
interface ChatLabels {
    chatNewMessages: (count: number, formatted: string) => string;
    chatLoadOlder: string;
    chatLoadingOlder: string;
    chatSending: string;
    chatNotSent: string;
    chatRetry: string;
    chatYou: string;
    chatMessage: string;
    chatSend: string;
    chatStop: string;
    chatThinking: string;
    chatThoughtFor: (seconds: number) => string;
    chatReasoning: string;
    chatStepRunning: string;
    chatStepDone: string;
    chatStepFailed: string;
    chatApprove: string;
    chatDeny: string;
    chatApproved: string;
    chatDenied: string;
    chatResponseOf: (index: number, count: number) => string;
    chatPreviousResponse: string;
    chatNextResponse: string;
    chatReplyActions: string;
    chatRegenerate: string;
    chatHelpful: string;
    chatNotHelpful: string;
    chatFeedbackNoted: string;
    chatFeedbackRemoved: string;
}
interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    hasOlder?: boolean | undefined;
    onLoadOlder?: (() => void) | undefined;
    loadingOlder?: boolean | undefined;
}
declare const Chat: React.FC<ChatProps & React.RefAttributes<HTMLDivElement>>;
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
    thinking?: boolean | undefined;
    reasoning?: React.ReactNode | undefined;
    reasoningTime?: number | undefined;
    branch?: number | undefined;
    branches?: number | undefined;
    onBranchChange?: ((branch: number) => void) | undefined;
    steps?: readonly ChatStep[] | undefined;
}
declare const ChatMessage: React.FC<ChatMessageProps & React.RefAttributes<HTMLDivElement>>;
type ChatStepStatus = "done" | "failed" | "running";
interface ChatStep {
    id: string;
    label: React.ReactNode;
    status: ChatStepStatus;
    detail?: React.ReactNode | undefined;
}
interface ChatStepsProps extends React.HTMLAttributes<HTMLOListElement> {
    steps: readonly ChatStep[];
}
declare const ChatSteps: React.FC<ChatStepsProps & React.RefAttributes<HTMLOListElement>>;
type ChatApprovalStatus = "approved" | "denied" | "pending";
interface ChatApprovalProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    detail?: React.ReactNode | undefined;
    status?: ChatApprovalStatus | undefined;
    onApprove?: (() => void) | undefined;
    onDeny?: (() => void) | undefined;
}
declare const ChatApproval: React.FC<ChatApprovalProps & React.RefAttributes<HTMLDivElement>>;
type ChatFeedback = "bad" | "good";
interface ChatReplyActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    copyText?: (() => Promise<string> | string) | string | undefined;
    onRegenerate?: (() => void) | undefined;
    feedback?: ChatFeedback | null | undefined;
    onFeedback?: ((feedback: ChatFeedback | null) => void) | undefined;
}
declare const ChatReplyActions: React.FC<ChatReplyActionsProps & React.RefAttributes<HTMLDivElement>>;
interface ChatCitationProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    index: number;
    children?: React.ReactNode;
}
declare const ChatCitation: React.FC<ChatCitationProps & React.RefAttributes<HTMLAnchorElement>>;
interface ChatDividerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    date?: Date | number | string | undefined;
    children?: React.ReactNode;
}
declare const ChatDivider: React.FC<ChatDividerProps & React.RefAttributes<HTMLDivElement>>;
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
declare const ChatComposer: React.FC<ChatComposerProps & React.RefAttributes<HTMLFormElement>>;
