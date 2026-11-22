// src/internal/lastInput.ts
var keyed = false;
var listening = false;
var pressed = null;
var downOn = null;
function listenForInput() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener("keydown", (e) => {
    keyed = true;
    if (!e.repeat) downOn = e.target;
    else if (e.key === "Enter" && e.target !== downOn) e.preventDefault();
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
