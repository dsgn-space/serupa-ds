// src/internal/formValues.ts
var SKIP = /* @__PURE__ */ new Set(["submit", "button", "reset", "image", "fieldset", "output", "object"]);
var UNSAFE = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function pathKey(name) {
  return name.replace(/\[([^\]]*)\]/g, (_, k) => k ? "." + k : "").replace(/^\./, "");
}
function issueKey(path) {
  return (path || []).map((p) => String(typeof p === "object" && p !== null ? p.key : p)).join(".");
}
function readFlat(form) {
  const groups = /* @__PURE__ */ new Map();
  for (const el of Array.from(form.elements)) {
    if (!el.name || SKIP.has(el.type) || el.matches(":disabled")) continue;
    const k = pathKey(el.name), list = groups.get(k);
    if (list) list.push(el);
    else groups.set(k, [el]);
  }
  const out = /* @__PURE__ */ new Map();
  groups.forEach((els, k) => {
    out.set(k, valueOf(els));
  });
  return out;
}
function valueOf(els) {
  const first = els[0];
  if (els.every((e) => e.type === "checkbox")) {
    const boxes = els;
    if (boxes.length === 1 && (!first.hasAttribute("value") || first.value === "on")) return first.checked;
    return boxes.filter((b) => b.checked).map((b) => b.value);
  }
  if (els.every((e) => e.type === "radio")) {
    const on = els.find((r) => r.checked);
    return on ? on.value : void 0;
  }
  return els.length === 1 ? one(first) : els.map(one);
}
function one(e) {
  if (e.tagName === "SELECT" && e.multiple) return Array.from(e.selectedOptions, (o) => o.value);
  if (e.type === "file") {
    const files = Array.from(e.files || []);
    return e.multiple ? files : files[0];
  }
  return e.value;
}
function toNested(flat) {
  const root = {};
  const entries = flat instanceof Map ? Array.from(flat) : Object.entries(flat);
  for (const [k, v] of entries) setPath(root, k, v);
  return root;
}
function setPath(root, key, value) {
  const parts = key.split(".");
  let at = root;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === "__proto__" || p === "constructor" || p === "prototype") return;
    if (i === parts.length - 1) {
      at[p] = value;
      return;
    }
    const next = Object.prototype.hasOwnProperty.call(at, p) ? at[p] : void 0;
    if (next == null || typeof next !== "object") at[p] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    at = at[p];
  }
}
function getPath(root, key) {
  let at = root;
  for (const p of key.split(".")) {
    if (at == null || typeof at !== "object" || UNSAFE.has(p)) return void 0;
    at = at[p];
  }
  return at;
}
function merge(base, over) {
  if (over === void 0) return base;
  if (!base || !over || typeof base !== "object" || typeof over !== "object") return over;
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
    out[k] = merge(Object.prototype.hasOwnProperty.call(out, k) ? out[k] : void 0, v);
  }
  return out;
}
function same(a, b) {
  return a === b || stamp(a) === stamp(b);
}
function stamp(v) {
  return JSON.stringify(v instanceof Map ? Array.from(v) : v, (_, x) => typeof File !== "undefined" && x instanceof File ? "file:" + x.name + ":" + x.size + ":" + x.lastModified : x);
}
export {
  getPath,
  issueKey,
  merge,
  pathKey,
  readFlat,
  same,
  stamp,
  toNested
};
//# sourceMappingURL=formValues.js.map
