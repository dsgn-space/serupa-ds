// src/internal/leave.ts
function leave(href) {
  let u;
  try {
    u = new URL(href, window.location.href);
  } catch {
    return false;
  }
  if (!/^(https?|mailto|tel):$/.test(u.protocol)) return false;
  window.location.assign(u.href);
  return true;
}
export {
  leave
};
//# sourceMappingURL=leave.js.map
