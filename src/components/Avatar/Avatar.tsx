'use client';
import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { Icon } from '../Icon/Icon';
import { named } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { initials } from './initials';
import * as icons from '../../material/builtin';
import { en as words } from './labels';
import { quickArrival } from '../../internal/timing';

export { initials };

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'busy' | 'away' | 'offline';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The picture's URL. Without one, or when it fails to load, the initials (or the person icon) show instead. */
  src?: string | undefined;
  /** The person's or thing's name: the initials come from it, and it's the accessible name. */
  name?: string | undefined;
  /** The accessible name, when it isn't the name. Pass alt="" when the name is already written next to it. */
  alt?: string | undefined;
  /** 'xs' 24px, 'sm' 32px, 'md' 40px (default), 'lg' 48px or 'xl' 64px. */
  size?: AvatarSize | undefined;
  /** 'circle' (default, people) or 'square' (teams, projects, organizations). */
  shape?: 'circle' | 'square' | undefined;
  /** A dot at the bottom end: 'online', 'busy', 'away' or 'offline'. Added to the accessible name. */
  status?: AvatarStatus | undefined;
  /** What a screen reader hears for the status. Default: the avatarStatus label ("online", "daring" in idLabels). */
  statusLabel?: string | undefined;
  /** Props for the <img>, such as loading="eager" for an avatar above the fold, or referrerPolicy. Default: loading="lazy", decoding="async". */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement> | undefined;
}

/* Avatar: a picture of a person (circle) or a team or project (square), with initials or a person icon when
   there's no picture or it fails to load. Sizes xs to xl (24 to 64px). status adds a dot with a shape per status. The name
   (or alt) is the accessible name; alt="" hides it from screen readers. className and every other prop go to
   the outer <span>. */
const OWN = { src: 1, name: 1, alt: 1, size: 1, shape: 1, status: 1, statusLabel: 1, imgProps: 1, className: 1, children: 1 } as const;
export const AVATAR_SIZES: readonly AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const SIZES = AVATAR_SIZES;
/** The size an AvatarGroup sets for every Avatar inside it, however deep (inside a Tooltip or a link too). */
export const AvatarGroupSize = /* @__PURE__ */ React.createContext<AvatarSize | null>(null);
const STATUSES: readonly AvatarStatus[] = ['online', 'busy', 'away', 'offline'];

function AvatarRender({ ref, ...props }: AvatarProps & React.RefAttributes<HTMLSpanElement>) {
  const rest = omit(props, OWN);
  const size = React.useContext(AvatarGroupSize) || oneOf(SIZES, props.size, 'md');
  const square = props.shape === 'square';
  const sds = useSettings(words);
  const status = props.status && STATUSES.indexOf(props.status) >= 0 ? props.status : null;
  // Remember which src failed rather than resetting a flag in an effect: a fast error (WebKit) can land
  // before that effect runs, and the reset would then bring back the broken picture.
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const failed = failedSrc != null && failedSrc === props.src;
  // A name of only spaces counts as no name: no "   " for a screen reader to say.
  const label = (props.alt != null ? props.alt : props.name || '').trim();
  const said = status ? props.statusLabel || sds.labels.avatarStatus(status) : '';
  const full = label && said ? label + ', ' + said : label;
  const showImg = !!props.src && !failed;
  // A server-rendered picture can fail before the page hydrates, and React never hears that error: the broken picture
  // stayed in place of the initials. A picture that has finished but won't decode has failed (L8E44).
  const pic = React.useRef<HTMLImageElement | null>(null);
  // A picture still on its way after quickArrival is late: the initials (or the icon) show under it rather than an
  // empty disc, and when it arrives it fades in over them, as Image's does. One that arrives sooner just appears.
  const [late, setLate] = React.useState<[src: string, here: boolean] | null>(null);
  React.useEffect(() => {
    const i = pic.current, src = props.src;
    if (!i || !src) return;
    if (i.complete) { i.decode().catch(() => { if (pic.current === i && i.complete && !i.naturalWidth) setFailedSrc(src); }); return; }
    const t = setTimeout(() => { if (!i.complete) setLate([src, false]); }, quickArrival);
    return () => clearTimeout(t);
  }, [props.src]);
  const text = initials(props.name);
  const under = late && late[0] === props.src ? late : null;
  const img = props.imgProps;
  const fallback = text ? <span className="srp-avatar__initials" aria-hidden="true">{text}</span> : <Icon className="srp-avatar__icon" icon={icons.Person} />;
  const body = showImg
    // Lazy and async by default, so a long list of people doesn't fetch every picture at once.
    ? <><img loading="lazy" decoding="async" {...img} className={cn('srp-avatar__img', under && 'srp-avatar__img--late', under && under[1] && 'srp-avatar__img--in', img && img.className)} src={props.src} alt="" ref={pic}
        onLoad={(e) => { if (img && img.onLoad) img.onLoad(e); if (under) setLate([under[0], true]); }}
        onAnimationEnd={(e) => { if (img && img.onAnimationEnd) img.onAnimationEnd(e); setLate(null); }}
        onError={(e) => { if (img && img.onError) img.onError(e); setFailedSrc(props.src as string); }} />{under ? fallback : null}</>
    : fallback;
  // With alt="" the name is written next to it, but the status isn't: then only the dot is read ("online").
  if (full) { rest.role = 'img'; rest['aria-label'] = full; } else if (!status) rest['aria-hidden'] = true;
  return (
    <span {...rest} ref={ref} className={cn('srp-avatar', 'srp-avatar--' + size, square && 'srp-avatar--square', props.className)}
      data-component="avatar" data-size={size} data-shape={square ? 'square' : 'circle'}>
      <span className="srp-avatar__frame">{body}</span>
      {status ? <span className={'srp-avatar__status srp-avatar__status--' + status} {...(full ? { 'aria-hidden': true } : { role: 'img', 'aria-label': said })} /> : null}
    </span>
  );
}

/** A picture of a person, team or project, with initials or an icon when there's no picture. */
export const Avatar = /* @__PURE__ */ named('Avatar', AvatarRender);
