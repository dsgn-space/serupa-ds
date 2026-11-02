"use client";
import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect } from "../../internal/cn";
import { component } from "../../internal/component";
import { useServerStyles } from "../../internal/serverStyles";
import { useSettings } from "../../internal/provider";
import { CopyButton } from "../CopyButton/CopyButton";
import { en as words } from "./labels";

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** The code, as text. A last line break is left out. */
  code: string;
  /** The language, shown in the header when there's no title ("tsx", "sh"), and set as data-language and a
      language-* class on the <code>, for a highlighter to find. */
  language?: string;
  /** A title or file name in the header ("App.tsx"). It also names the code's scroll area. */
  title?: React.ReactNode;
  /** Numbers each line, at the start, out of the text you select and copy. Default: false. */
  lineNumbers?: boolean;
  /** The first line's number, with lineNumbers. Default: 1. */
  startLine?: number;
  /** Lines to mark, by number: single lines and [from, to] ranges, such as [2, [5, 7]]. Each is a <mark>, with a bar
      at its start as well as a tint. */
  highlight?: ReadonlyArray<number | readonly [number, number]>;
  /** Wraps long lines instead of scrolling sideways. Default: false. */
  wrap?: boolean;
  /** Shows the copy button in the header, which copies the whole code. Default: true. */
  copyable?: boolean;
}

const OWN = { code: 1, language: 1, title: 1, lineNumbers: 1, startLine: 1, highlight: 1, wrap: 1, copyable: 1, className: 1 } as const;

/** Code to read and copy: a <pre> in a framed box with an optional title, line numbers, marked lines and a copy button. Scrolls sideways (with the keyboard too) or wraps.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const CodeBlock = /* @__PURE__ */ component<HTMLDivElement, CodeBlockProps>("CodeBlock", function CodeBlock(props, ref) {
  const rest = omit(props, OWN);
  const restyle = useServerStyles(ref);
  const labels = useSettings(words).labels;
  const base = domId("dk-code", React.useId());
  const code = String(props.code ?? "").replace(/\r\n?/g, "\n").replace(/\n$/, "");
  const lines = code.split("\n");
  const start = Math.round(Number(props.startLine) || 1);
  const marked = new Set<number>();
  for (const h of props.highlight || []) {
    const [a, b] = typeof h === "number" ? [h, h] : h;
    for (let n = Math.max(start, a); n <= Math.min(b, start + lines.length - 1); n++) marked.add(n);
  }
  const hasTitle = props.title != null && props.title !== false && props.title !== "";
  const copyable = props.copyable !== false;
  const lang = props.language ? String(props.language) : "";
  const pre = React.useRef<HTMLPreElement>(null);
  // Only a box that scrolls is a tab stop, so the keyboard can scroll it (WCAG 2.1.1); then it's a region with a name.
  const [scrolls, setScrolls] = React.useState(false);
  useIsoLayoutEffect(() => {
    const el = pre.current;
    if (!el) return;
    const check = () => setScrolls(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);
  const header = hasTitle || lang || copyable;
  const name = hasTitle ? { "aria-labelledby": base + "-title" } : { "aria-label": lang || labels.codeName };

  return (
    <div {...rest} ref={restyle} className={cn("dk-code-block", props.wrap && "dk-code-block--wrap", props.lineNumbers && "dk-code-block--numbered", props.className)}
      data-component="code-block" data-language={lang || undefined}>
      {header ? (
        <div className="dk-code-block__header">
          {hasTitle ? <div className="dk-code-block__title" id={base + "-title"}>{props.title}</div>
            : lang ? <div className="dk-code-block__language">{lang}</div> : <span />}
          {copyable ? <CopyButton className="dk-code-block__copy" value={code} variant="ghost" size="sm" iconOnly>{labels.codeCopy}</CopyButton> : null}
        </div>
      ) : null}
      <pre ref={pre} className="dk-code-block__pre" {...(scrolls ? { tabIndex: 0, role: "region", ...name } : {})}
        style={props.lineNumbers ? ({ "--dk-code-digits": String(start + lines.length - 1).length, ...(start !== 1 ? { counterReset: `dk-code-line ${start - 1}` } : {}) } as React.CSSProperties) : undefined}>
        <code className={cn("dk-code-block__code", lang && "language-" + lang)}>
          {lines.map((line, i) => {
            const n = start + i, end = i < lines.length - 1 ? "\n" : "";
            return marked.has(n)
              ? <mark key={i} className="dk-code-block__line dk-code-block__line--marked">{line}{end}</mark>
              : <span key={i} className="dk-code-block__line">{line}{end}</span>;
          })}
        </code>
      </pre>
    </div>
  );
});
