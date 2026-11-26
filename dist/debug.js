/*! Serupa v19.1.0 by Diki · debug.js */
/* Serupa debug overlay: shows which Serupa component drew what on a page, for finding why a screen looks off.
   Optional and standalone (no React, nothing else loads it). Load it on a page you're checking:

     <script src="node_modules/@diki-stwn/serupa-ds/dist/debug.js">   and the closing script tag

   It stays off until the page's address has ?serupa-debug (or &serupa-debug), or Serupa.debug.on() is called; the
   choice is kept for this tab (sessionStorage), so it survives a reload or a click to another page.
   While on:
     - every Serupa component (each element with data-component) has a dashed outline, except while it shows its own
       focus ring;
     - pointing at one draws its box and a panel with its name, its variant and size (the modifiers of its block class, such as srp-btn--primary), its state
       (data-state, aria-checked, aria-expanded, aria-selected, aria-invalid, disabled), its size in px, and the
       component tokens (--button-…, --input-…) that have a value on it, so a token your app overrides shows here;
     - the color pairs Serupa draws (text on each surface, button text, field borders, the focus ring …) are checked
       against WCAG 2.2 where they are, so a color token your app overrides can't quietly fail contrast: the ones
       that fail on the page are listed in the console when it turns on, and the panel lists any more that fail on
       the component you point at (from a token set on it, or on a section or card around it);
     - a Theme panel in the corner sets each theme setting on <html> (brand, mode, contrast, density, radius, shadow,
       type scale), so the page can be tried in every theme; each change checks the color pairs again and
       says how many fail (brand and mode go through theme.js when the page loads it, which remembers them);
     - Escape, or Serupa.debug.off(), turns it off.

   API (window.Serupa.debug):
     on()        turn it on, and keep it on for this tab
     off()       turn it off, and forget it for this tab
     toggle()    on if off, off if on
     isOn()      true while it's on
     inspect(el) what the panel shows for the Serupa component at or above el, as an object, or null
     contrast(el) each color pair as drawn at el (default: the page), with its ratio and the ratio it needs
     theme()     the theme settings on the page now, such as { brand: 'blue', mode: 'auto', radius: '', … } ('' is the default)
     theme(o)    change some, such as theme({ radius: 'round', contrast: 'more' }) ('' puts one back); a promise of
                 { theme, lowContrast }: the settings once applied and the color pairs that fail in them */
(function () {
  if (window.Serupa && window.Serupa.debug) return;
  var KEY = 'serupa-debug', PINK = '#db2777';
  var on = false, style = null, box = null, panel = null, switcher = null, current = null;
  // The pairs that fail on the page itself, named in the console when it turns on, so the panel doesn't repeat them.
  var pageLow = {};
  // Each component's tokens, by prefix (button for Button), read once from the loaded style sheets.
  var tokenCache = {};

  function store(v) { try { if (v) sessionStorage.setItem(KEY, '1'); else sessionStorage.removeItem(KEY); } catch (e) { /* storage blocked */ } }
  function stored() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }

  // data-component is the kebab-case name (date-range-picker), which is also its tokens' prefix; kebab() covers a
  // component written as DateRangePicker too.
  function kebab(name) { return String(name).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(); }

  function tokensFor(prefix) {
    if (tokenCache[prefix]) return tokenCache[prefix];
    var names = {}, re = new RegExp('--' + prefix + '-[a-z0-9-]+', 'g');
    for (var i = 0; i < document.styleSheets.length; i++) {
      var text = '';
      try {
        var rules = document.styleSheets[i].cssRules;
        for (var j = 0; j < rules.length; j++) text += rules[j].cssText + '\n';
      } catch (e) { continue; } // a style sheet from another origin can't be read
      var m = text.match(re);
      if (m) for (var k = 0; k < m.length; k++) names[m[k]] = true;
    }
    return (tokenCache[prefix] = Object.keys(names).sort());
  }
  // The component tokens set in style attributes on el and above it: a style sheet the page can't read (another
  // origin, or a file:// page) hides its token names, but an override in a style attribute still shows.
  function inlineTokens(el, prefix) {
    var names = [];
    for (var n = el; n && n.style; n = n.parentElement) {
      for (var i = 0; i < n.style.length; i++) if (n.style[i].indexOf('--' + prefix + '-') === 0) names.push(n.style[i]);
    }
    return names;
  }

  // The color pairs Serupa puts on screen, each [foreground, background, ratio it needs, what it is]: the build
  // writes them here from tools/tokens/contrast-pairs.mjs, the list tools/test/foundation.mjs checks in each theme.
  var PAIRS = [["text","surface",4.5,"Body text"],["text","surface-muted",4.5,"Body text on a muted surface"],["text","surface-raised",4.5,"Body text on a raised card"],["text","surface-overlay",4.5,"Body text in a popover or dialog"],["text-muted","surface",4.5,"Muted text"],["text-muted","surface-muted",4.5,"Muted text on a muted surface"],["text-muted","surface-raised",4.5,"Muted text on a raised card"],["text-muted","surface-overlay",4.5,"Muted text in a popover or dialog"],["text-inverse","surface-inverse",4.5,"Text on an inverse surface (Tooltip)"],["text","secondary",4.5,"Secondary button text"],["text","secondary-hover",4.5,"Secondary button text on hover"],["text","secondary-pressed",4.5,"AvatarGroup's +N while it's held"],["text","pressed",4.5,"Text on a pressed control"],["text","field",4.5,"Text in a field"],["placeholder","field",4.5,"Placeholder in a field"],["text","primary-subtle",4.5,"Text on a selected row"],["on-primary","primary",4.5,"Primary button text"],["on-primary","primary-hover",4.5,"Primary button text on hover"],["on-primary","primary-pressed",4.5,"Primary button text while held down"],["primary-text","surface",4.5,"Brand text, links and icons, and the secondary button"],["primary-text","surface-muted",4.5,"A link or brand text on a muted surface (a Dashboard card's \"All projects\")"],["primary-text-hover","surface",4.5,"A link on hover"],["primary-text-hover","surface-muted",4.5,"A link on hover, on a muted surface"],["link-visited","surface",4.5,"A visited link (Prose)"],["link-visited","surface-muted",4.5,"A visited link on a muted surface (Prose)"],["primary-text","primary-subtle",4.5,"Brand text on its tint: a primary subtle Badge, a selected TagGroup tag, a pressed outline ToggleButton"],["primary-text","info-subtle",4.5,"A link in an info Alert"],["primary-text","success-subtle",4.5,"A link in a success Alert"],["primary-text","warning-subtle",4.5,"A link in a warning Alert"],["primary-text","danger-subtle",4.5,"A link in a danger Alert (Billing's \"Update card\")"],["primary-text-hover","primary-subtle",4.5,"Brand text on hover, on its tint"],["primary-text-hover","primary-subtle-pressed",4.5,"A secondary button's text while held down"],["on-danger","danger",4.5,"Danger button text"],["on-danger","danger-hover",4.5,"Danger button text on hover"],["on-danger","danger-pressed",4.5,"Danger button text while held down"],["danger-text","surface",4.5,"Error text"],["danger-text","surface-muted",4.5,"Error text on a muted surface"],["danger-text","surface-overlay",4.5,"Error text in a popover or dialog"],["danger-text","danger-subtle",4.5,"Error text on its tint (Alert)"],["danger-text","danger-subtle-hover",4.5,"A destructive button's text while held down"],["success-text","surface",4.5,"Success text"],["success-text","surface-muted",4.5,"Success text on a muted surface"],["success-text","success-subtle",4.5,"Success text on its tint"],["success-text","success-subtle-hover",4.5,"Success text on its tint on hover"],["on-success","success",4.5,"Text on a success fill"],["on-success","success-hover",4.5,"Text on a success fill on hover"],["warning-text","surface",4.5,"Warning text"],["warning-text","surface-muted",4.5,"Warning text on a muted surface"],["warning-text","warning-subtle",4.5,"Warning text on its tint"],["warning-text","warning-subtle-hover",4.5,"Warning text on its tint on hover"],["on-warning","warning",4.5,"Text on a warning fill"],["on-warning","warning-hover",4.5,"Text on a warning fill on hover"],["info-text","surface",4.5,"Info text"],["info-text","surface-muted",4.5,"Info text on a muted surface"],["info-text","info-subtle",4.5,"Info text on its tint"],["info-text","info-subtle-hover",4.5,"Info text on its tint on hover"],["on-info","info",4.5,"Text on an info fill"],["on-info","info-hover",4.5,"Text on an info fill on hover"],["info","surface",3,"An info icon or fill on the page (a graphic, WCAG 1.4.11; info text uses info-text)"],["info","surface-raised",3,"An info fill on a raised card (a dark theme lightens the light theme's sky-700 only this far)"],["primary-text","surface-overlay",4.5,"Brand text and icons in a popover or dialog (a Select's tick, a link in a Dialog)"],["primary-text","surface-raised",4.5,"Brand text and icons on a raised card"],["danger","surface",3,"Destructive secondary button border"],["field-border","field",1.3,"Field border, soft by design, under the 3:1 of WCAG 1.4.11, a deliberate exception, see Foundations, Form fields"],["field-border","surface",1.3,"Field border on the page, soft by design, under the 3:1 of WCAG 1.4.11, a deliberate exception, see Foundations, Form fields"],["focus-ring","field",3,"The focus ring on a field"],["field-border-invalid","field",3,"An invalid field border"],["field-border-invalid","surface",3,"An invalid field border on the page"],["primary-text","field",4.5,"A text action in a field (Input)"],["text","field-hover",4.5,"Text or an icon on a button in a field under the pointer"],["text","field-pressed",4.5,"Text or an icon on a button in a field held down"],["border-control","surface",1.3,"A control edge (Meter and Progress track edge, Carousel dot, Stepper ring), soft by design, under the 3:1 of WCAG 1.4.11, a deliberate exception"],["border-control-pressed","surface",1.3,"A control edge while held down"],["placeholder","field",4.5,"Muted text in a field: a prefix, a suffix, a character count"],["text-muted","field",3,"A muted icon in a field (a chevron, a search or clear icon)"],["placeholder","field-readonly",4.5,"A placeholder in a read-only or disabled field"],["disabled-text","surface",3,"Anything disabled: its text, icon or mark"],["disabled-text","surface-raised",3,"A disabled item on a raised card"],["disabled-text","surface-overlay",3,"A disabled item in a menu or list box"],["disabled-text","disabled-surface",3,"The mark on a disabled control's fill (a checked box, a switch's thumb)"],["disabled-text","field-readonly",3,"Text in a disabled field"],["focus-ring","surface",3,"Focus ring"],["focus-ring","surface-overlay",3,"Focus ring in a popover or dialog"],["chart-1","surface",3,"Chart series 1"],["chart-1","surface-raised",3,"Chart series 1 on a raised card"],["chart-2","surface",3,"Chart series 2"],["chart-2","surface-raised",3,"Chart series 2 on a raised card"],["chart-3","surface",3,"Chart series 3"],["chart-3","surface-raised",3,"Chart series 3 on a raised card"],["chart-4","surface",3,"Chart series 4"],["chart-4","surface-raised",3,"Chart series 4 on a raised card"],["chart-5","surface",3,"Chart series 5"],["chart-5","surface-raised",3,"Chart series 5 on a raised card"],["chart-6","surface",3,"Chart series 6"],["chart-6","surface-raised",3,"Chart series 6 on a raised card"],["chart-7","surface",3,"Chart series 7"],["chart-7","surface-raised",3,"Chart series 7 on a raised card"],["chart-8","surface",3,"Chart series 8"],["chart-8","surface-raised",3,"Chart series 8 on a raised card"],["chart-seq-5","surface",3,"The strong end of a sequential chart ramp"],["chart-div-1","surface",3,"The low end of a diverging chart ramp"],["chart-div-7","surface",3,"The high end of a diverging chart ramp"],["chart-axis","surface",3,"Chart axis lines and ticks"],["chart-label","surface",4.5,"Chart labels and legend text"],["chart-label","surface-raised",4.5,"Chart labels on a raised card"],["success","surface",3,"A Meter or Progress fill in success, on the page (its track is the page with a border-control edge)"],["warning","surface",3,"A Meter or Progress fill in warning, on the page"],["success","surface-raised",3,"A success fill on a raised card"],["warning","surface-raised",3,"A warning fill on a raised card"],["danger","surface-muted",3,"A Meter fill in danger on a muted surface"],["field-border","surface-muted",1.3,"A field border on a muted surface, soft by design, under the 3:1 of WCAG 1.4.11, a deliberate exception, see Foundations, Form fields"],["field-border","surface-raised",1.3,"A field border on a raised card, soft by design, under the 3:1 of WCAG 1.4.11, a deliberate exception, see Foundations, Form fields"],["field-border","surface-overlay",1.3,"A field border in a dialog or popover, soft by design, under the 3:1 of WCAG 1.4.11, a deliberate exception, see Foundations, Form fields"],["field-border","primary-subtle",1.25,"A field border on a primary-subtle row or zone, soft by design, under the 3:1 of WCAG 1.4.11, a deliberate exception, see Foundations, Form fields (the floor is the lowest theme, Cyan Dark at 1.28)"],["border-control","surface-muted",1.3,"A control edge, or a Meter track edge, on a muted surface, soft by design"],["border-control","surface-raised",1.3,"A control edge, or a Meter track edge, on a raised card, soft by design"],["border-control","primary-subtle",1.25,"A control edge on a primary-subtle row or zone, soft by design"],["focus-ring","surface-raised",3,"The focus ring on a raised card"],["focus-ring","surface-muted",3,"The focus ring on a muted surface"],["focus-ring","primary-subtle",3,"The focus ring on a primary-subtle highlight (a selected row or option)"],["danger-text","surface-raised",4.5,"An error message on a raised card"],["primary-text","primary-subtle",3,"A primary icon, border or check on a primary-subtle highlight"],["placeholder","surface-overlay",4.5,"A placeholder in a field in a dialog"],["danger","surface-overlay",3,"A danger border or icon in a dialog or popover"],["danger","surface-raised",3,"A danger border or icon on a raised card"],["text-muted","secondary",3,"A muted icon on a secondary fill (IconTile, EmptyState): icons only, not text"]];
  var probe = null, ctx = null;
  // A token's color at el as sRGB, drawn over `under` (and white, under everything), so a translucent color counts
  // as it looks. A custom property's computed value has its var()s filled in, so it holds up on its own.
  function paint(value, under) {
    if (!ctx) {
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      ctx = canvas.getContext('2d', { willReadFrequently: true });
      probe = document.createElement('span');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    }
    document.body.appendChild(probe);
    probe.style.color = 'rgb(0, 0, 0)';
    probe.style.color = value;
    var css = getComputedStyle(probe).color;
    probe.parentNode.removeChild(probe);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 1, 1);
    if (under) { ctx.fillStyle = 'rgb(' + under.join(',') + ')'; ctx.fillRect(0, 0, 1, 1); }
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    var d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }
  function luminance(c) {
    var v = c.map(function (x) { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contrast(el) {
    el = el || document.documentElement;
    var computed = getComputedStyle(el), out = [];
    PAIRS.forEach(function (p) {
      var fg = computed.getPropertyValue('--' + p[0]).trim(), bg = computed.getPropertyValue('--' + p[1]).trim();
      if (!fg || !bg) return;
      var back = paint(bg), a = luminance(paint(fg, back)), b = luminance(back);
      var raw = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      var ratio = Math.floor(raw * 100) / 100;
      out.push({ foreground: '--' + p[0], background: '--' + p[1], ratio: ratio, needs: p[2], what: p[3], ok: raw >= p[2] });
    });
    return out;
  }
  function failing(list) { return list.filter(function (r) { return !r.ok; }); }

  function inspect(el) {
    var host = el && el.closest ? el.closest('[data-component]') : null;
    if (!host) return null;
    var name = host.getAttribute('data-component'), prefix = kebab(name);
    var classes = (host.getAttribute('class') || '').split(/\s+/);
    // Its block class (srp-btn for Button), then that block's modifiers: srp-btn--primary, srp-btn--size-md.
    var block = classes.filter(function (c) { return /^srp-[a-z0-9-]+$/.test(c) && c.indexOf('--') < 0; })[0];
    var modifiers = block ? classes.filter(function (c) { return c.indexOf(block + '--') === 0; }).map(function (c) { return c.slice(block.length + 2); }) : [];
    var state = {};
    ['data-state', 'data-side', 'aria-checked', 'aria-expanded', 'aria-selected', 'aria-pressed', 'aria-invalid', 'aria-busy'].forEach(function (a) {
      var v = host.getAttribute(a);
      if (v != null) state[a] = v;
    });
    if (host.matches(":disabled, [aria-disabled='true']") || host.querySelector(':disabled')) state.disabled = 'true';
    var computed = getComputedStyle(host), tokens = {};
    tokensFor(prefix).concat(inlineTokens(host, prefix)).forEach(function (t) {
      var v = computed.getPropertyValue(t).trim();
      if (v) tokens[t] = v;
    });
    var r = host.getBoundingClientRect();
    return { element: host, component: name, modifiers: modifiers, state: state, width: Math.round(r.width), height: Math.round(r.height), tokens: tokens, lowContrast: failing(contrast(host)) };
  }

  function line(parent, label, value) {
    var row = document.createElement('div');
    var b = document.createElement('b');
    b.textContent = label + ' ';
    row.appendChild(b);
    row.appendChild(document.createTextNode(value));
    parent.appendChild(row);
  }

  function show(info) {
    var r = info.element.getBoundingClientRect();
    box.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid ' + PINK + ';background:rgba(219,39,119,.08);'
      + 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;';
    panel.textContent = '';
    var title = document.createElement('div');
    title.style.cssText = 'font-weight:700;font-size:13px;margin-bottom:4px';
    title.textContent = info.component;
    panel.appendChild(title);
    line(panel, 'size', info.width + ' × ' + info.height + 'px');
    if (info.modifiers.length) line(panel, 'classes', info.modifiers.join(', '));
    Object.keys(info.state).forEach(function (k) { line(panel, k, info.state[k]); });
    var names = Object.keys(info.tokens);
    if (names.length) {
      line(panel, 'tokens', '');
      names.slice(0, 12).forEach(function (t) { line(panel, '  ' + t, info.tokens[t]); });
      if (names.length > 12) line(panel, '', 'and ' + (names.length - 12) + ' more: Serupa.debug.inspect(el).tokens');
    }
    // Below the box, or above it when there's no room, and never past the window's edge.
    // Only what fails here and not on the whole page: a token set on this component or around it.
    var low = info.lowContrast.filter(function (c) { return !pageLow[c.foreground + ' ' + c.background]; });
    low.slice(0, 4).forEach(function (c, i) {
      line(panel, i ? '' : 'low contrast', c.foreground + ' on ' + c.background + ' ' + c.ratio + ':1, needs ' + c.needs + ':1 (' + c.what + ')');
    });
    if (low.length > 4) line(panel, '', 'and ' + (low.length - 4) + ' more: Serupa.debug.contrast(el)');
    var below = r.bottom + 8, w = Math.min(360, innerWidth - 16);
    panel.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;max-width:' + w + 'px;padding:8px 10px;border-radius:6px;'
      + 'background:#18181b;color:#fafafa;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;box-shadow:0 4px 16px rgba(0,0,0,.3);'
      + 'left:' + Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px;';
    var h = panel.offsetHeight;
    panel.style.top = (below + h < innerHeight ? below : Math.max(8, r.top - h - 8)) + 'px';
  }

  function hide() { if (box) box.style.cssText = 'display:none'; if (panel) panel.style.cssText = 'display:none'; current = null; }

  function onMove(e) {
    var info = inspect(e.target);
    if (!info) return hide();
    current = info.element;
    show(info);
  }
  function onScroll() { if (current) { var info = inspect(current); if (info) show(info); } }
  function onKey(e) { if (e.key === 'Escape' && on) api.off(); }

  // Checks the page's color pairs, keeps the ones that fail for the panel to skip, and names them in the console.
  function checkPage(after) {
    var low = failing(contrast());
    pageLow = {};
    low.forEach(function (c) { pageLow[c.foreground + ' ' + c.background] = true; });
    if (low.length && window.console) {
      console.warn('Serupa debug: ' + low.length + ' color pair' + (low.length > 1 ? 's' : '') + ' on this page fail WCAG contrast' + (after ? ' ' + after : ', most likely from a color token your app sets') + ':\n'
        + low.map(function (c) { return '  ' + c.foreground + ' on ' + c.background + ': ' + c.ratio + ':1, needs ' + c.needs + ':1 (' + c.what + ')'; }).join('\n'));
    }
    return low;
  }

  // The theme settings tokens.css reads on <html>, each with its values; '' leaves the page's own.
  var AXES = {
    brand: ['blue', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'],
    mode: ['auto', 'light', 'dark'],
    contrast: ['normal', 'more'],
    density: ['compact', 'comfortable'],
    radius: ['sharp', 'round'],
    shadow: ['neutral', 'brand'],
    'type-scale': ['fixed', 'fluid']
  };
  function themeNow() {
    var root = document.documentElement, out = {}, t = window.Serupa.theme && window.Serupa.theme.get();
    var flat = /^([a-z][a-z0-9]*)-(light|dark)$/.exec(root.getAttribute('data-theme') || '');
    Object.keys(AXES).forEach(function (k) { out[k] = root.getAttribute('data-' + k) || ''; });
    if (t) { out.brand = t.brand; out.mode = t.mode; } else if (flat) { out.brand = out.brand || flat[1]; out.mode = out.mode || flat[2]; }
    return out;
  }
  // Brand and mode go through theme.js when the page has it (which also remembers them), and otherwise to
  // data-theme; the rest are attributes on <html>. Then the color pairs are checked again in the new theme.
  function setTheme(o) {
    var root = document.documentElement, t = window.Serupa.theme, before = themeNow();
    Object.keys(o || {}).forEach(function (k) {
      if (!Object.prototype.hasOwnProperty.call(AXES, k)) return;
      var v = o[k] == null ? '' : String(o[k]);
      if (k === 'brand' || k === 'mode') return;
      if (v) root.setAttribute('data-' + k, v); else root.removeAttribute('data-' + k);
    });
    var brand = o && o.brand != null ? String(o.brand) : before.brand, mode = o && o.mode != null ? String(o.mode) : before.mode;
    if (brand !== before.brand || mode !== before.mode) {
      if (t) t.set({ brand: brand || undefined, mode: mode || undefined });
      else {
        var dark = mode === 'dark' || (mode !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
        root.setAttribute('data-theme', (brand || 'blue') + '-' + (dark ? 'dark' : 'light'));
      }
    }
    // theme.js may change data-theme a moment later, after a view transition: check the colors once it has.
    return new Promise(function (resolve) {
      var frames = 0;
      (function settle() {
        var want = t && t.get().theme;
        if (want && root.getAttribute('data-theme') !== want && frames++ < 120) return requestAnimationFrame(settle);
        var now = themeNow(), low = checkPage('in this theme (' + Object.keys(now).filter(function (k) { return now[k]; }).map(function (k) { return k + ' ' + now[k]; }).join(', ') + ')');
        if (switcher) syncSwitcher(low);
        resolve({ theme: now, lowContrast: low });
      })();
    });
  }

  // A corner panel with one select per setting, so each theme can be tried on the real page.
  function themeSwitcher() {
    var wrap = document.createElement('div');
    wrap.id = 'serupa-debug-theme';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Serupa theme');
    wrap.style.cssText = 'position:fixed;z-index:2147483645;right:8px;bottom:8px;display:grid;grid-template-columns:auto auto;gap:4px 8px;align-items:center;'
      + 'padding:8px 10px;border-radius:6px;background:#18181b;color:#fafafa;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;box-shadow:0 4px 16px rgba(0,0,0,.3)';
    var head = document.createElement('div');
    head.style.cssText = 'grid-column:1/-1;font-weight:700;font-size:13px';
    head.textContent = 'Theme';
    wrap.appendChild(head);
    var brands = AXES.brand.concat((document.documentElement.getAttribute('data-brands') || '').match(/[a-z][a-z0-9]*/g) || []);
    Object.keys(AXES).forEach(function (k) {
      var id = 'serupa-debug-theme-' + k, label = document.createElement('label'), select = document.createElement('select');
      label.htmlFor = id;
      label.textContent = k;
      select.id = id;
      select.name = k;
      select.style.cssText = 'font:inherit;color:#18181b;background:#fafafa;border:0;border-radius:4px;padding:1px 4px';
      var values = k === 'brand' ? brands : AXES[k];
      [''].concat(values).forEach(function (v) {
        var opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v || (k === 'brand' || k === 'mode' ? '(page)' : 'default');
        select.appendChild(opt);
      });
      select.addEventListener('change', function () { var o = {}; o[k] = select.value; setTheme(o); });
      wrap.appendChild(label);
      wrap.appendChild(select);
    });
    var note = document.createElement('div');
    note.id = 'serupa-debug-theme-contrast';
    note.setAttribute('role', 'status');
    note.style.cssText = 'grid-column:1/-1;max-width:220px';
    wrap.appendChild(note);
    syncSwitcher(failing(contrast()), wrap);
    return wrap;
  }
  function syncSwitcher(low, wrap) {
    wrap = wrap || switcher;
    var now = themeNow();
    Object.keys(AXES).forEach(function (k) { var s = wrap.querySelector('select[name="' + k + '"]'); if (s) s.value = now[k]; });
    wrap.querySelector('#serupa-debug-theme-contrast').textContent = low.length
      ? low.length + ' color pair' + (low.length > 1 ? 's' : '') + ' fail contrast here: see the console'
      : 'Every color pair passes contrast';
  }

  var api = {
    on: function () {
      store(true);
      if (on) return;
      on = true;
      style = document.createElement('style');
      style.id = 'serupa-debug';
      style.textContent = '[data-component]:not(:focus-visible){outline:1px dashed rgba(219,39,119,.7) !important;outline-offset:-1px !important}';
      document.head.appendChild(style);
      box = document.createElement('div');
      panel = document.createElement('div');
      panel.id = 'serupa-debug-panel';
      box.setAttribute('aria-hidden', 'true');
      hide();
      document.body.appendChild(box);
      document.body.appendChild(panel);
      document.addEventListener('mouseover', onMove, true);
      addEventListener('scroll', onScroll, true);
      addEventListener('resize', onScroll);
      document.addEventListener('keydown', onKey);
      switcher = themeSwitcher();
      document.body.appendChild(switcher);
      checkPage('');
    },
    off: function () {
      store(false);
      if (!on) return;
      on = false;
      document.removeEventListener('mouseover', onMove, true);
      removeEventListener('scroll', onScroll, true);
      removeEventListener('resize', onScroll);
      document.removeEventListener('keydown', onKey);
      [style, box, panel, switcher].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
      style = box = panel = switcher = current = null;
    },
    toggle: function () { if (on) api.off(); else api.on(); },
    isOn: function () { return on; },
    inspect: function (el) { var info = inspect(el); return info; },
    contrast: function (el) { return contrast(el); },
    theme: function (o) { return o ? setTheme(o) : themeNow(); }
  };
  window.Serupa = window.Serupa || {};
  window.Serupa.debug = api;

  function start() { if (/[?&]serupa-debug(=|&|$)/.test(location.search) || stored()) api.on(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
