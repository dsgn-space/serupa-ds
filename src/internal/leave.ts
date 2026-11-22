/* Follows a link from code. location.assign runs a javascript: URL, which React's block on them in href doesn't
   cover, so only a web page (http, https, or a path on this site), mailto: or tel: goes. False for anything else
   (javascript:, data:, vbscript:, or no URL at all), and nothing happens. */
export function leave(href: string): boolean {
  let u: URL;
  try { u = new URL(href, window.location.href); } catch { return false; }
  if (!/^(https?|mailto|tel):$/.test(u.protocol)) return false;
  window.location.assign(u.href);
  return true;
}
