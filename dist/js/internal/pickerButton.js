// src/internal/pickerButton.tsx
import * as React from "react";
import { isComposing } from "./ime.js";
function PickerButton({ block, buttonRef, open, panelId, invalid, required, readOnly, disabled, onOpen, onClose, lang, children, ...rest }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      ...rest,
      ref: buttonRef,
      type: "button",
      role: "combobox",
      className: block + "__button",
      lang,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      "aria-controls": open ? panelId : void 0,
      "aria-invalid": invalid || void 0,
      "aria-required": rest["aria-required"] ?? (required || void 0),
      "aria-readonly": readOnly || void 0,
      disabled,
      onClick: (e) => {
        if (rest.onClick) rest.onClick(e);
        if (!e.defaultPrevented) {
          if (open) onClose();
          else onOpen();
        }
      },
      onKeyDown: (e) => {
        if (rest.onKeyDown) rest.onKeyDown(e);
        if (!e.defaultPrevented && !open && (e.key === "ArrowDown" || e.key === "ArrowUp") && !isComposing(e)) {
          e.preventDefault();
          onOpen();
        }
      }
    },
    children
  );
}
function PickerValidity({ block, required, filled, disabled, form, onInvalid }) {
  return required ? /* @__PURE__ */ React.createElement("input", { key: filled ? "filled" : "empty", className: block + "__validity", tabIndex: -1, "aria-hidden": true, required: true, defaultValue: filled ? "filled" : "", disabled, form, onInvalid }) : null;
}
export {
  PickerButton,
  PickerValidity
};
//# sourceMappingURL=pickerButton.js.map
