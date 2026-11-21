import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { space, type Space } from '../../internal/space';
import { named } from '../../internal/component';
import { Container, type ContainerSize } from '../Container/Container';

export interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** 'plain' (default): the page's own background. 'muted': a step below (surface-muted), to set one band apart from the next. */
  tone?: 'plain' | 'muted' | undefined;
  /** A line across the top, between this band and the one above. Default: false. */
  divider?: boolean | undefined;
  /** Space above and below: 'sm' 32px, 'md' 48px (64px from 768px, the default) or 'lg' 64px (96px from 768px), for a hero. */
  spacing?: 'sm' | 'md' | 'lg' | undefined;
  /** The content's width, a Container size: 'prose' 672px, 'md' 768, 'lg' 1024, 'xl' 1280 (default), '2xl' 1536 or 'full'.
      The band's background spans the page either way. */
  size?: ContainerSize | undefined;
  /** 'start' (default), or 'center': the content and its lines of text centered, for a hero or a closing call to action. */
  align?: 'start' | 'center' | undefined;
  /** The space between the children, a step of the spacing scale. Default: 8 (32px). */
  gap?: Space | undefined;
  /** The element. Default: 'section'; give it aria-labelledby pointing at its heading, so it's a named region. */
  as?: 'section' | 'div' | 'header' | 'footer' | 'aside' | undefined;
}

const TAGS = ['section', 'div', 'header', 'footer', 'aside'] as const;

function PageSectionRender({ ref, ...props }: PageSectionProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { tone: 1, divider: 1, spacing: 1, size: 1, align: 1, gap: 1, as: 1, className: 1, children: 1 });
  const tone = oneOf(['plain', 'muted'] as const, props.tone, 'plain');
  const spacing = oneOf(['sm', 'md', 'lg'] as const, props.spacing, 'md');
  const gap = space(props.gap);
  const Tag = oneOf(TAGS, props.as, 'section') as 'section';
  return (
    <Tag {...rest} ref={ref} data-component="page-section"
      className={cn('srp-page-section', 'srp-page-section--' + spacing, tone === 'muted' && 'srp-page-section--muted', props.divider && 'srp-page-section--divider', props.align === 'center' && 'srp-page-section--center', props.className)}>
      <Container size={props.size} className="srp-page-section__inner" style={gap ? { '--srp-page-section-gap': gap } as React.CSSProperties : undefined}>{props.children}</Container>
    </Tag>
  );
}

/* PageSection: one band of a long page, such as a landing page's hero, features, pricing or questions: a background
   across the page, space above and below, and the content in a Container, its children spaced in a column.
   className, style and every other prop go to the outer element. */
/** One full-width band of a long page: a background, space above and below, and the content in a Container.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const PageSection = /* @__PURE__ */ named('PageSection', PageSectionRender);
