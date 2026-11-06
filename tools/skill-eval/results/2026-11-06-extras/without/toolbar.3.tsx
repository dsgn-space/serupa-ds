import { useState } from "react";

type Align = "left" | "center" | "right";
type Mark = "bold" | "italic" | "underline";

const icons: Record<Mark | Align, JSX.Element> = {
  bold: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />,
  italic: <path d="M19 4h-9M14 20H5M15 4 9 20" />,
  underline: <path d="M6 4v7a6 6 0 0 0 12 0V4M4 21h16" />,
  left: <path d="M3 6h18M3 12h11M3 18h15" />,
  center: <path d="M3 6h18M7 12h10M5 18h14" />,
  right: <path d="M3 6h18M10 12h11M6 18h15" />,
};

function Icon({ name }: { name: Mark | Align }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name]}
    </svg>
  );
}

const marks: { id: Mark; label: string }[] = [
  { id: "bold", label: "Bold" },
  { id: "italic", label: "Italic" },
  { id: "underline", label: "Underline" },
];

const aligns: { id: Align; label: string }[] = [
  { id: "left", label: "Align left" },
  { id: "center", label: "Align center" },
  { id: "right", label: "Align right" },
];

const buttonStyle = (on: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  border: "1px solid transparent",
  borderRadius: 6,
  background: on ? "rgba(127,127,127,0.25)" : "transparent",
  color: "inherit",
  cursor: "pointer",
});

export function FormattingBar() {
  const [active, setActive] = useState<Record<Mark, boolean>>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [align, setAlign] = useState<Align>("left");

  const toggle = (m: Mark) => setActive((a) => ({ ...a, [m]: !a[m] }));

  const onAlignKey = (e: React.KeyboardEvent) => {
    const i = aligns.findIndex((a) => a.id === align);
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % aligns.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i + aligns.length - 1) % aligns.length;
    else return;
    e.preventDefault();
    setAlign(aligns[next].id);
    (e.currentTarget.children[next] as HTMLElement).focus();
  };

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <div role="group" aria-label="Text style" style={{ display: "flex", gap: 2 }}>
        {marks.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active[id]}
            onClick={() => toggle(id)}
            style={buttonStyle(active[id])}
          >
            <Icon name={id} />
          </button>
        ))}
      </div>

      <span aria-hidden="true" style={{ width: 1, height: 20, background: "currentColor", opacity: 0.2 }} />

      <div
        role="radiogroup"
        aria-label="Text alignment"
        onKeyDown={onAlignKey}
        style={{ display: "flex", gap: 2 }}
      >
        {aligns.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-label={label}
            title={label}
            aria-checked={align === id}
            tabIndex={align === id ? 0 : -1}
            onClick={() => setAlign(id)}
            style={buttonStyle(align === id)}
          >
            <Icon name={id} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default FormattingBar;
