// NOTE: I couldn't inspect the installed serupa-ds package in this session (no file access),
// so I haven't guessed at its component or prop names. This uses native elements with full
// ARIA behavior. To use the design system, swap the <button>s for its ToggleButton/ToggleGroup
// equivalents and keep the aria-label, aria-pressed and radio semantics.
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type Align = "left" | "center" | "right";
type Mark = "bold" | "italic" | "underline";

const Svg = ({ children }: { children: ReactNode }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const markIcons: Record<Mark, ReactNode> = {
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
      <path d="M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3 14000" />
      <path d="M3 14h10" />
    </Svg>
  ),
};

const alignIcons: Record<Align, ReactNode> = {
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

export interface FormattingBarProps {
  onMarksChange?: (marks: Record<Mark, boolean>) => void;
  onAlignChange?: (align: Align) => void;
}

export function FormattingBar({ onMarksChange, onAlignChange }: FormattingBarProps) {
  const [active, setActive] = useState<Record<Mark, boolean>>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [align, setAlign] = useState<Align>("left");
  const radioRefs = useRef<Record<Align, HTMLButtonElement | null>>({
    left: null,
    center: null,
    right: null,
  });

  const toggle = (id: Mark) => {
    const next = { ...active, [id]: !active[id] };
    setActive(next);
    onMarksChange?.(next);
  };

  const choose = (id: Align) => {
    setAlign(id);
    onAlignChange?.(id);
  };

  // Radio-group keyboard pattern: arrows move and select, one tab stop.
  const onAlignKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % aligns.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (index - 1 + aligns.length) % aligns.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = aligns.length - 1;
    else return;
    e.preventDefault();
    const id = aligns[next].id;
    choose(id);
    radioRefs.current[id]?.focus();
  };

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <div role="group" aria-label="Text style" style={{ display: "inline-flex", gap: 2 }}>
        {marks.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active[id]}
            onClick={() => toggle(id)}
          >
            {markIcons[id]}
          </button>
        ))}
      </div>

      <span role="separator" aria-orientation="vertical" style={{ alignSelf: "stretch", width: 1, background: "currentColor", opacity: 0.2 }} />

      <div role="radiogroup" aria-label="Text alignment" style={{ display: "inline-flex", gap: 2 }}>
        {aligns.map(({ id, label }, i) => {
          const selected = align === id;
          return (
            <button
              key={id}
              ref={(el) => {
                radioRefs.current[id] = el;
              }}
              type="button"
              role="radio"
              aria-label={label}
              title={label}
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(id)}
              onKeyDown={(e) => onAlignKeyDown(e, i)}
            >
              {alignIcons[id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FormattingBar;
