// One shared, visually hidden polite live region (WAI-ARIA status). It's created when the first Button
// mounts, so it already exists when a button starts loading, and screen readers announce the change.
let announcer: HTMLDivElement | null = null;

export function ensureAnnouncer(): HTMLDivElement | null {
  if (announcer || typeof document === "undefined") return announcer;
  announcer = document.createElement("div");
  announcer.setAttribute("role", "status");
  announcer.setAttribute("aria-live", "polite");
  announcer.setAttribute("data-dk-announcer", "");
  announcer.className = "sr-only";   // the foundation's screen-reader-only utility (Accessibility)
  document.body.appendChild(announcer);
  return announcer;
}

export function announce(text: string): void {
  const el = ensureAnnouncer();
  if (!el) return;
  el.textContent = "";
  setTimeout(function () { el.textContent = text; }, 50);   // clear first so the same text is announced again
}
