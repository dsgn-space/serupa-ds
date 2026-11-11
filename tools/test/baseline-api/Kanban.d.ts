// exports: Kanban, type KanbanColumn, type KanbanMove, type KanbanProps
interface KanbanLabels {
    kanbanMove: string;
    kanbanInstructions: string;
    kanbanMoveTo: (card: string) => string;
    kanbanCount: (count: string, limit: string) => string;
    kanbanOverLimit: string;
    kanbanGrabbed: (card: string, column: string, position: number, total: number) => string;
    kanbanMoved: (card: string, column: string, position: number, total: number) => string;
    kanbanDropped: (card: string, column: string, position: number, total: number) => string;
    kanbanCancelled: (card: string, column: string, position: number, total: number) => string;
    kanbanEmpty: string;
}
interface KanbanColumn<T> {
    id: string;
    title: string;
    items: readonly T[];
    limit?: number | undefined;
}
interface KanbanMove<T> {
    item: T;
    from: {
        column: string;
        index: number;
    };
    to: {
        column: string;
        index: number;
    };
}
interface KanbanProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
    columns: readonly KanbanColumn<T>[];
    getKey: (item: T) => number | string;
    getLabel: (item: T) => string;
    renderCard: (item: T, state: {
        column: string;
        index: number;
        dragging: boolean;
    }) => React.ReactNode;
    onMove: (columns: KanbanColumn<T>[], move: KanbanMove<T>) => void;
    headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
    disabled?: boolean | undefined;
}
declare const Kanban: <T>(props: KanbanProps<T> & {
    ref?: React.Ref<HTMLDivElement> | undefined;
}) => React.ReactElement;
