// A story as a screen: the story's own page (Frame.tsx) in a frame as wide as a phone, a tablet or a laptop, so its
// layout answers the frame's width. Where the page is narrower than the device, the screen is scaled down to fit.
import * as React from 'react';
import { href } from './router';

export interface Device { value: string; label: string; width: number; height: number }
export const DEVICES: Device[] = [
  { value: 'phone', label: 'Phone', width: 390, height: 760 },
  { value: 'tablet', label: 'Tablet', width: 820, height: 900 },
  { value: 'desktop', label: 'Desktop', width: 1280, height: 800 },
];

export function Screen({ story, device = DEVICES[2]!, title, address }: { story: string; device?: Device; title: string; address?: string }) {
  const view = React.useRef<HTMLDivElement>(null);
  const [room, setRoom] = React.useState(0);
  React.useEffect(() => {
    const el = view.current;
    if (!el) return;
    const measure = () => setRoom(el.clientWidth);
    measure();
    const seen = new ResizeObserver(measure);
    seen.observe(el);
    return () => seen.disconnect();
  }, []);
  const scale = room ? Math.min(1, room / device.width) : 1;
  return <div className="site-screen" style={{ maxInlineSize: device.width }}>
    <div className="site-screen__bar" aria-hidden="true">
      <span className="site-screen__dots"><span /><span /><span /></span>
      <span className="site-screen__address">{address ?? 'northwind.example'}</span>
    </div>
    <div ref={view} className="site-screen__view" style={{ blockSize: Math.round(device.height * scale) }}>
      <iframe className="site-screen__page" title={title} src={href(`/frame/${story}`)} loading="lazy"
        style={{ inlineSize: device.width, blockSize: device.height, transform: scale < 1 ? `scale(${scale})` : undefined }} />
    </div>
  </div>;
}
