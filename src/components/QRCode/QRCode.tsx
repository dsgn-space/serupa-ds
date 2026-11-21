'use client';
import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { warnOnce } from '../../internal/warn';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Loader } from '../Loader/Loader';
import * as icons from '../../material/builtin';
import { encodeQR, type QRErrorLevel } from './encode';
import { en as words } from './labels';

export type { QRErrorLevel };
export type QRCodeStatus = 'active' | 'loading' | 'expired' | 'scanned';

export interface QRCodeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the code holds: a URL, a payment string, an otpauth:// link. Encoded as UTF-8. */
  value: string;
  /** What the code is for, as its accessible name: "QR code to pay order 1042". A code says nothing to someone who
   *  can't see it, or who is on the device that shows it: offer the value beside it as well (a link or a CopyButton). */
  label: string;
  /** 'sm' 96px, 'md' 160px (default) or 'lg' 240px, quiet zone included. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** How much of it can be damaged or covered and still scan: 'L' about 7%, 'M' 15% (default), 'Q' 25%, 'H' 30%.
   *  Higher means more modules, so a smaller code is harder to scan. Default 'H' with logo. */
  level?: QRErrorLevel | undefined;
  /** An image (URL or data URL) in the middle, such as a brand mark, on a light square. It covers about 4% of the
   *  modules, which the error correction makes up for. */
  logo?: string | undefined;
  /** 'active' (default) shows the code. 'loading' shows a Loader over a faded code; 'expired' says so, with a button
   *  that calls onRefresh; 'scanned' says so with a check. A change of status is said politely. */
  status?: QRCodeStatus | undefined;
  /** With status="expired": the "Get a new code" button calls it. */
  onRefresh?: (() => void) | undefined;
}

/* QRCode: a QR code drawn as one SVG path from serupa's own encoder, dark on light in every theme with its quiet
   zone, since scanners need contrast and a margin whatever the page looks like. The SVG is an img named by label.
   status puts a message over a faded code. */
const SIZES = ['sm', 'md', 'lg'] as const;
const STATUSES = ['active', 'loading', 'expired', 'scanned'] as const;
const QUIET = 4;   function QRCodeRender({ ref, ...props }: QRCodeProps & React.RefAttributes<HTMLDivElement>) {
  const sds = useSettings(words);
  const rest = omit(props, { value: 1, label: 1, size: 1, level: 1, logo: 1, status: 1, onRefresh: 1, className: 1 });
  const size = oneOf(SIZES, props.size, 'md');
  const status = oneOf(STATUSES, props.status, 'active');
  const level = props.level && /^[LMQH]$/.test(props.level) ? props.level : props.logo ? 'H' : 'M';
  const path = React.useMemo(() => {
    try { return draw(encodeQR(props.value, level)); } catch (e) {
      if (process.env.NODE_ENV !== 'production') warnOnce('qr-code-too-long', String((e as Error).message) + '. Shorten it, or link to a page that holds the rest.');
      return null;
    }
  }, [props.value, level]);
  // A status that changes after mount is said, since nothing moves focus to it.
  const said = React.useRef<QRCodeStatus | null>(null);
  React.useEffect(() => {
    if (said.current !== null && said.current !== status) {
      if (status === 'expired') announce(sds.labels.qrExpired);
      else if (status === 'scanned') announce(sds.labels.qrScanned);
    }
    said.current = status;
  }, [status, sds.labels]);
  const n = path ? path.size : 21;
  const box = n + QUIET * 2;
  const logo = props.logo && path ? Math.round(n * 0.2) | 1 : 0;   // an odd number of modules, centred on a module
  const at = QUIET + (n - logo) / 2;
  return (
    <div {...rest} ref={ref} className={cn('srp-qr-code', 'srp-qr-code--' + size, status !== 'active' && 'srp-qr-code--' + status, props.className)} data-component="qr-code" data-status={status}>
      <svg className="srp-qr-code__code" viewBox={'0 0 ' + box + ' ' + box} role="img" aria-label={props.label} shapeRendering="crispEdges" focusable="false">
        <rect className="srp-qr-code__light" width={box} height={box} />
        {path ? <path className="srp-qr-code__dark" d={path.d} /> : null}
        {logo ? <>
          <rect className="srp-qr-code__light" x={at - 0.5} y={at - 0.5} width={logo + 1} height={logo + 1} />
          <image href={props.logo} x={at} y={at} width={logo} height={logo} preserveAspectRatio="xMidYMid meet" />
        </> : null}
      </svg>
      {status !== 'active' ? <div className="srp-qr-code__status">
        {status === 'loading' ? <Loader size={size === 'sm' ? 'sm' : 'md'} label={sds.labels.loading} /> : null}
        {status === 'scanned' ? <p className="srp-qr-code__message"><Icon icon={icons.CheckCircle} className="srp-qr-code__icon" />{sds.labels.qrScanned}</p> : null}
        {status === 'expired' ? <>
          <p className="srp-qr-code__message">{sds.labels.qrExpired}</p>
          {props.onRefresh ? <Button size="sm" variant="outline" onClick={props.onRefresh}>{sds.labels.qrRefresh}</Button> : null}
        </> : null}
      </div> : null}
    </div>
  );
}

// modules of light margin on every side, as the standard asks

/** A QR code from a value, drawn in SVG dark on light in every theme, with a status (loading, expired, scanned) over it.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const QRCode = /* @__PURE__ */ named('QRCode', QRCodeRender);

// The dark modules as one path, a run of modules on a row as one rectangle, offset by the quiet zone.
function draw(m: boolean[][]): { d: string; size: number } {
  let d = '';
  for (let y = 0; y < m.length; y++) {
    const row = m[y]!;
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue;
      let run = 1;
      while (x + run < row.length && row[x + run]) run++;
      d += 'M' + (x + QUIET) + ' ' + (y + QUIET) + 'h' + run + 'v1h-' + run + 'z';
      x += run - 1;
    }
  }
  return { d, size: m.length };
}
