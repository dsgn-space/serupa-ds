// In its own module, without "use client", so a Server Component can call it (a function from a client module is
// only a reference there). Avatar.tsx re-exports it.

/** The initials of a name: the first letters of the first and last words ("Ada Lovelace" → "AL"), or one letter. */
export function initials(name?: string): string {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const first = Array.from(words[0])[0] || "";
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] || "" : "";
  return (first + last).toUpperCase();
}
