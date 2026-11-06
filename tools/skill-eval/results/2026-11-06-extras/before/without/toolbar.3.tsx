import { useState, type ReactNode } from "react";

// NOTE: I could not inspect serupa-ds in this session, so I did not guess its
// component names. This uses native elements with ARIA. To use the DS, swap
// the <button>s for its toggle/segmented components and keep the aria-labels.

type Align = "left" | "center" | "right";

const Svg = ({ children }: { children: ReactNode }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const icons = {
  bold: (
    <Svg>
      <path d="M4.5 2.5h4a2.5 2.5 0 0 1 0 5h-4zM4.5 7.5h4.5a2.5 2.5 0 0 1 0 5H4.5z" />
    </Svg>
  ),
  italic: (
    <Svg>
      <path d="M10 2.5H6.5M9.5 13.5H6M9.5 2.5l-3 11" />
    </Svg>
  ),
  underline: (
    <Svg>
      <path d="M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3 14h10" />
    </Svg>
  ),
  left: (
    <Svg>
      <path d="M2.5 3.5h11M2.5 6.5h7M2.5 9.5h11M2.5 12.5h7" />
    </Svg>
  ),
  center: (
    <Svg>
      <path d="M2.5 3.5h11M4.5 6.5h7M2.5 9.5h11M4.5 12.5h7" />
    </Svg>
  ),
  right: (
    <Svg>
      <path d="M2.5 3.5h11M6.5 6.5h7M2.5 9.5h11M6.5 12.5h7" />
    </Svg>
  ),
};

const styles = {
  bar: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: 4,
  },
  group: { display: "inline-flex", gap: 2 },
  divider: {
    width: 1,
    alignSelf: "stretch",
    background: "currentColor",
    opacity: 0.2,
    margin: "4px 4px",
  },
  btn: (on: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    border: "1px solid transparent",
    borderRadius: 6,
    background: on ? "rgba(127,127,127,0.25)" : "transparent",
    color: "inherit",
    cursor: "pointer",
  }),
} as const;

export function FormattingBar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<Align>("left");

  const toggles = [
    { label: "Bold", on: bold, set: setBold, icon: icons.bold },
    { label: "Italic", on: italic, set: setItalic, icon: icons.italic },
    { label: "Underline", on: underline, set: setUnderline, icon: icons.underline },
  ];

  const aligns: { value: Align; label: string }[] = [
    { value: "left", label: "Align left" },
    { value: "center", label: "Align center" },
    { value: "right", label: "Align right" },
  ];

  const onAlignKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = aligns[(i + step + aligns.length) % aligns.length];
    setAlign(next.value);
    (e.currentTarget.parentElement?.children[
      aligns.indexOf(next)
    ] as HTMLElement | undefined)?.focus();
  };

  return (
    <div role="toolbar" aria-label="Text formatting" style={styles.bar}>
      <div role="group" aria-label="Text style" style={styles.group}>
        {toggles.map((t) => (
          <button
            key={t.label}
            type="button"
            aria-label={t.label}
            aria-pressed={t.on}
            title={t.label}
            style={styles.btn(t.on)}
            onClick={() => t.set(!t.on)}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div style={styles.divider} role="separator" aria-orientation="vertical" />

      <div role="radiogroup" aria-label="Text alignment" style={styles.group}>
        {aligns.map((a, i) => {
          const on = align === a.value;
          return (
            <button
              key={a.value}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={a.label}
              title={a.label}
              tabIndex={on ? 0 : -1}
              style={styles.btn(on)}
              onClick={() => setAlign(a.value)}
              onKeyDown={(e) => onAlignKey(e, i)}
            >
              {icons[a.value]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FormattingBar;
