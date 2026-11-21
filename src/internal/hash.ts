/* The page's #fragment as text ("#caf%C3%A9" is "café"), or '' when there is none. A fragment that isn't valid
   percent-encoding ("#%", "#%E0%A4%A") is read as written: decodeURIComponent throws on it, and a link anyone can
   make must not take the page down. */
export function pageHash(): string {
  const raw = window.location.hash.slice(1);
  try { return decodeURIComponent(raw); } catch { return raw; }
}
