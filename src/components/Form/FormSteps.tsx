'use client';
import * as React from 'react';
import { cn, domId, useIsoLayoutEffect, useLatest, useMergedRef } from '../../internal/cn';
import { named } from '../../internal/component';
import { useControllable } from '../../internal/controllable';
import { pathKey } from '../../internal/formValues';
import { useSettings } from '../../internal/provider';
import { Button } from '../Button/Button';
import { Stepper } from '../Stepper/Stepper';
import { FormInternals } from './Form';
import { en as words } from './labels';

export interface FormStepProps {
  /** The step's name: in the progress bar, and the heading above its fields. */
  title: React.ReactNode;
  /** A muted line under the title in the progress bar. */
  description?: React.ReactNode | undefined;
  /** Says "Optional" under the title in the progress bar. */
  optional?: boolean | undefined;
  /** The step's fields. */
  children?: React.ReactNode | undefined;
}

/** One step of FormSteps: its title and its fields. It renders through FormSteps, never on its own. */
export function FormStep(props: FormStepProps): React.ReactElement {
  return <>{props.children}</>;
}

export interface FormStepsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The steps, in order: FormStep elements. */
  children: React.ReactNode;
  /** The last step's button, which submits the form: "Create account". */
  submitLabel: React.ReactNode;
  /** The step showing, from 0, controlled. Use with onStepChange. */
  step?: number | undefined;
  /** The step to start on, uncontrolled. Default: 0. */
  defaultStep?: number | undefined;
  /** Called with the step people move to: after Next passes, Back, or a step in the progress bar. */
  onStepChange?: ((step: number) => void) | undefined;
  /** The level of each step's heading, to fit the page's outline. Default: 2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
}

/* FormSteps: one Form in steps. A Stepper shows where people are; each step is a section headed by its title, and only
   the current one shows (the others are hidden="until-found", still in the form, so their values are kept and sent).
   Next checks the current step's fields only, and moves on once they pass; Back and the progress bar's done steps go
   back without checking. Moving to a step focuses its heading. The last step's button submits the whole form: a
   problem on an earlier step shows in the summary, and its link goes back to that step. */
function FormStepsRender({ ref, ...props }: FormStepsProps & React.RefAttributes<HTMLDivElement>) {
  const { children, submitLabel, step, defaultStep, onStepChange, headingLevel, className, ...rest } = props;
  const sds = useSettings(words);
  const internals = React.useContext(FormInternals);
  const steps = React.Children.toArray(children).filter((c): c is React.ReactElement<FormStepProps> => React.isValidElement(c));
  const last = Math.max(0, steps.length - 1);
  const [raw, setOwn] = useControllable(step, defaultStep || 0, 'FormSteps', 'step');
  const current = Math.min(Math.max(0, raw), last);
  const [startAt] = React.useState(current);
  const base = domId('dk-form-steps', React.useId());
  const panels = React.useRef<Array<HTMLElement | null>>([]);
  const moved = React.useRef(false);
  const go = (to: number) => { moved.current = true; setOwn(to); if (onStepChange) onStepChange(to); };
  // The steps not showing are hidden="until-found": a summary's link to one of their fields opens the step (beforematch).
  useIsoLayoutEffect(() => {
    panels.current.forEach((p, i) => {
      if (!p) return;
      if (i === current) p.removeAttribute('hidden'); else p.setAttribute('hidden', 'until-found');
    });
  });
  // A match in a hidden step (find-in-page, or a summary's link to one of its fields) opens that step.
  const latestGo = useLatest(go);
  React.useEffect(() => {
    const list = panels.current.slice();
    const offs = list.map((p, i) => {
      if (!p) return () => {};
      const open = () => { latestGo.current(i); };
      p.addEventListener('beforematch', open);
      return () => { p.removeEventListener('beforematch', open); };
    });
    return () => { offs.forEach((off) => { off(); }); };
  }, [steps.length, latestGo]);
  // A new step: its heading takes focus, so it's read out and the page shows its top.
  React.useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const h = panels.current[current] && panels.current[current].querySelector<HTMLElement>('.dk-form-steps__title');
    if (h) { if (typeof h.scrollIntoView === 'function') h.scrollIntoView({ block: 'start' }); h.focus({ preventScroll: true }); }
  }, [current]);
  const next = async () => {
    const p = panels.current[current];
    const keys = p ? Array.from(new Set(Array.from(p.querySelectorAll<HTMLInputElement>('[name]'), (c) => pathKey(c.name)))) : [];
    if (internals && keys.length && !(await internals.show(keys))) return;
    go(Math.min(current + 1, last));
  };
  // Enter in a step's text field goes on, as it would submit a one-page form (a step with no submit button of its own
  // would otherwise do nothing).
  const onKeyDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLInputElement;
    if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing || current >= last || t.tagName !== 'INPUT') return;
    if (/^(button|submit|reset|checkbox|radio|file|image|color|range)$/.test(t.type) || t.getAttribute('aria-expanded') === 'true') return;
    e.preventDefault();
    void next();
  };
  const latestKey = useLatest(onKeyDown);
  const root = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRef(ref, (n) => { root.current = n; });
  React.useEffect(() => {
    const n = root.current;
    if (!n) return;
    const on = (e: KeyboardEvent) => { latestKey.current(e); };
    n.addEventListener('keydown', on);
    return () => { n.removeEventListener('keydown', on); };
  }, [latestKey]);
  const H = ('h' + ([2, 3, 4, 5, 6].indexOf(headingLevel as number) < 0 ? 2 : headingLevel)) as 'h2';
  return (
    <div {...rest} ref={mergedRef} className={cn('dk-form-steps', className)} data-component="form-steps">
      <Stepper className="dk-form-steps__progress" current={current} onStepClick={(i) => { if (i < current) go(i); }}
        steps={steps.map((s) => ({ title: s.props.title, description: s.props.description, optional: s.props.optional }))} />
      {steps.map((s, i) => (
        <section key={i} ref={(n) => { panels.current[i] = n; }} className="dk-form-steps__panel" aria-labelledby={base + '-' + i}
          hidden={i !== startAt || undefined}>
          <H id={base + '-' + i} className="dk-form-steps__title" tabIndex={-1}>{s.props.title}</H>
          {s}
        </section>
      ))}
      <div className="dk-form-steps__actions">
        {current < last ? <Button type="button" onClick={next}>{sds.labels.formNext}</Button> : <Button type="submit">{submitLabel}</Button>}
        {current > 0 ? <Button type="button" variant="secondary" onClick={() => { go(current - 1); }}>{sds.labels.formBack}</Button> : null}
      </div>
    </div>
  );
}

/** One Form in steps, with a progress bar: Next checks only the step's own fields, and the last step submits. */
export const FormSteps = /* @__PURE__ */ named('FormSteps', FormStepsRender);
