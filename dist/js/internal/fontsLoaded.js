// src/internal/fontsLoaded.ts
function onFontsLoaded(fn) {
  const fonts = typeof document !== "undefined" && document.fonts && "addEventListener" in document.fonts ? document.fonts : null;
  let live = true, frame = 0;
  const done = () => {
    if (live) fn();
  };
  const loading = () => {
    let n = 0;
    const wait = () => {
      if (!live) return;
      if (fonts.status === "loaded") fn();
      else if (n++ < 600) frame = requestAnimationFrame(wait);
    };
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(wait);
  };
  if (fonts) {
    fonts.addEventListener("loading", loading);
    fonts.addEventListener("loadingdone", done);
  }
  return () => {
    live = false;
    if (fonts) {
      cancelAnimationFrame(frame);
      fonts.removeEventListener("loading", loading);
      fonts.removeEventListener("loadingdone", done);
    }
  };
}
export {
  onFontsLoaded
};
//# sourceMappingURL=fontsLoaded.js.map
