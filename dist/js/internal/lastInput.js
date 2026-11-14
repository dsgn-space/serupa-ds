// src/internal/lastInput.ts
var keyed = false;
var listening = false;
var pressed = null;
function listenForInput() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener("keydown", () => {
    keyed = true;
  }, true);
  document.addEventListener("pointerdown", () => {
    keyed = false;
  }, true);
  document.addEventListener("click", (e) => {
    const p = pressed;
    keyed = !e.detail && !(p && Array.from(e.target.labels || []).some((l) => l.contains(p)));
    if (e.detail) {
      pressed = e.target;
      setTimeout(() => {
        pressed = null;
      });
    }
  }, true);
}
function lastInputKeyboard() {
  return keyed;
}
export {
  lastInputKeyboard,
  listenForInput
};
//# sourceMappingURL=lastInput.js.map
