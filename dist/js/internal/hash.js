// src/internal/hash.ts
function pageHash() {
  const raw = window.location.hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
export {
  pageHash
};
//# sourceMappingURL=hash.js.map
