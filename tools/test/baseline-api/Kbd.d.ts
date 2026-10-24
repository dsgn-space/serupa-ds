// exports: Kbd, type KbdProps
interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    keys?: string[];
    size?: "md" | "sm";
}
declare const Kbd: React.ForwardRefExoticComponent<KbdProps & React.RefAttributes<HTMLElement>>;
