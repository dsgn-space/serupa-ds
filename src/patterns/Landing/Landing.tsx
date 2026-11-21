'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Navbar, NavbarLink } from '../../components/Navbar/Navbar';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { IconTile } from '../../components/IconTile/IconTile';
import { PageSection } from '../../components/PageSection/PageSection';
import { Grid } from '../../components/Grid/Grid';
import { Stack } from '../../components/Stack/Stack';
import { Pricing, type PricingPeriod, type PricingPlan } from '../../blocks/Pricing/Pricing';
import { Faq, type FaqGroup } from '../../blocks/Faq/Faq';
import { Footer, type FooterLinkGroup } from '../../blocks/Footer/Footer';
import { Bolt, Groups, Lock, Sync } from '../../material/icons';

/* Landing page: the page a product shows people who don't use it yet. A hero that says what it is and the one thing
   to do, what it does as named features, the plans, the questions people ask before buying, and the footer. For an
   app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: one h1 that says what the product does, and each section a region named by its h2, so a list of
     headings or landmarks reads as the page's outline.
   - 2.4.4, 3.2.4: the call to action says where it goes ("Start free trial"), and is the same words and the same
     place each time it appears, so it's known again.
   - 1.1.1: each feature's icon is decoration (its heading says it), so it isn't read out.
   - 2.4.1: a skip link first, into main; the header's links are a navigation landmark, as the footer's groups are.
   - 1.4.10, 1.4.4: one column on a phone, and nothing in a fixed height, so text at 200% or 320px wide still fits.
   Signing up and choosing a plan are the app's job: onStart and onChoose get them. */

export interface LandingFeature {
  id: string;
  /** What it does, short: "Works offline". */
  title: string;
  /** What that means for the person, in a sentence. */
  description: string;
  icon: React.ComponentProps<typeof IconTile>['icon'];
}

export interface LandingProps {
  /** The product's name, in the header and the footer. Default: "Acme". */
  product?: string | undefined;
  /** The h1: what the product does for the person, in their words. */
  headline?: string | undefined;
  /** The line under it: who it's for and what changes. */
  lead?: string | undefined;
  /** The call to action, the same everywhere it appears. Default: "Start free trial". */
  action?: string | undefined;
  /** Under the call to action: what it costs to try. Default: "14 days free. No card needed." */
  actionNote?: string | undefined;
  features?: readonly LandingFeature[] | undefined;
  plans?: readonly PricingPlan[] | undefined;
  /** An ISO 4217 code for the plans' prices. Default: "USD". */
  currency?: string | undefined;
  questions?: readonly FaqGroup[] | undefined;
  footer?: readonly FooterLinkGroup[] | undefined;
  /** The call to action was pressed (in the hero, the header or the last section). */
  onStart?: (() => void) | undefined;
  /** A plan's button was pressed. */
  onChoose?: ((planId: string, period: PricingPeriod) => void) | undefined;
}

const demoFeatures: LandingFeature[] = [
  { id: 'fast', title: 'Fast on any connection', description: 'Pages open in under a second, even on a slow phone network.', icon: Bolt },
  { id: 'offline', title: 'Works offline', description: 'Keep working on a plane. Changes sync when you’re back online.', icon: Sync },
  { id: 'team', title: 'Made for teams', description: 'Share a project with a link, and see who changed what.', icon: Groups },
  { id: 'private', title: 'Private by default', description: 'Your data is encrypted, and only your team can open it.', icon: Lock },
];
const demoPlans: PricingPlan[] = [
  { id: 'free', name: 'Free', description: 'For trying it on your own.', monthly: 0, yearly: 0, features: ['1 project', '2 people', 'Community help'] },
  { id: 'team', name: 'Team', description: 'For a team that ships every week.', monthly: 12, yearly: 120, features: ['Unlimited projects', 'Up to 20 people', 'Email help within a day'], recommended: true },
  { id: 'business', name: 'Business', description: 'For a company with rules to follow.', monthly: 30, yearly: 300, features: ['Everything in Team', 'Sign-in with your company account', 'An audit log'] },
];
const demoQuestions: FaqGroup[] = [
  { id: 'landing-faq', questions: [
    { id: 'trial', question: 'What happens when the trial ends?', answer: 'You choose a plan, or stay on Free. Nothing is charged without you choosing, and nothing you made is deleted.' },
    { id: 'switch', question: 'Can I change plans later?', answer: 'Yes, at any time in Billing settings. Moving up takes effect at once; moving down at the end of the period you paid for.' },
    { id: 'data-export', question: 'Can I take my data with me?', answer: 'Yes. Export everything as CSV or JSON from Settings, on every plan, Free included.', keywords: 'export leave' },
  ] },
];
const demoFooter: FooterLinkGroup[] = [
  { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#changelog' }] },
  { title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Blog', href: '#blog' }, { label: 'Contact', href: '#contact' }] },
];

/** A product's landing page: header, hero, features, pricing, questions, a last call to action and the footer. */
export function Landing({ product = 'Acme', headline = 'Plan the work, and see it get done', lead = 'One place for your team’s projects, from the first idea to the release. No setup, no training.',
  action = 'Start free trial', actionNote = '14 days free. No card needed.', features = demoFeatures, plans = demoPlans, currency = 'USD',
  questions = demoQuestions, footer = demoFooter, onStart, onChoose }: LandingProps) {
  const start = <Button onClick={onStart}>{action}</Button>;
  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <Navbar brand={<a href="#top" className="text-base font-semibold text-text no-underline">{product}</a>} actions={<>
        <Button variant="ghost" href="#sign-in">Sign in</Button>
        {start}
      </>}>
        <NavbarLink href="#features">Features</NavbarLink>
        <NavbarLink href="#pricing">Pricing</NavbarLink>
        <NavbarLink href="#questions">Questions</NavbarLink>
      </Navbar>
      <main id="main" className="outline-none">
        <PageSection spacing="lg" size="md" align="center" gap={6} aria-labelledby="landing-title">
          <Heading level={1} size="4xl" id="landing-title" className="text-balance">{headline}</Heading>
          <p className="m-0 max-w-2xl text-lg text-text-muted">{lead}</p>
          <Stack gap={2} align="center">
            <Stack direction="row" wrap gap={3} justify="center">
              {start}
              <Button variant="outline" href="#features">See what it does</Button>
            </Stack>
            <p className="m-0 text-sm text-text-muted">{actionNote}</p>
          </Stack>
        </PageSection>

        <PageSection id="features" tone="muted" divider size="lg" aria-labelledby="landing-features" className="scroll-mt-16">
          <Heading level={2} size="2xl" id="landing-features">What it does</Heading>
          <Grid as="ul" columns={{ base: 1, sm: 2 }} gap={8}>
            {features.map((f) => (
              <li key={f.id}>
                <Stack direction="row" gap={4} align="start">
                  <IconTile icon={f.icon} tone="primary" />
                  <Stack gap={1}>
                    <Heading level={3} size="lg">{f.title}</Heading>
                    <p className="m-0 text-text-muted">{f.description}</p>
                  </Stack>
                </Stack>
              </li>
            ))}
          </Grid>
        </PageSection>

        <PageSection id="pricing" size="lg" aria-labelledby="landing-pricing" className="scroll-mt-16">
          <Stack gap={2}>
            <Heading level={2} size="2xl" id="landing-pricing">Pricing</Heading>
            <p className="m-0 text-text-muted">Every plan has every feature above. Pay for the people and projects you need.</p>
          </Stack>
          <Pricing plans={plans} currency={currency} headingLevel={3} onChoose={(id, period) => onChoose?.(id, period)} />
        </PageSection>

        <PageSection as="div" id="questions" divider size="md" className="scroll-mt-16">
          <Faq groups={questions} headingLevel={2} searchable={false} labels={{ title: 'Questions' }}
            contact={<p className="m-0">Something else? <Link href="#contact">Write to us</Link> and a person answers within a day.</p>} />
        </PageSection>

        <PageSection tone="muted" divider size="md" align="center" gap={4} aria-labelledby="landing-last">
          <Heading level={2} size="2xl" id="landing-last">Try it with your team</Heading>
          {start}
          <p className="m-0 text-sm text-text-muted">{actionNote}</p>
        </PageSection>
      </main>
      <Footer groups={footer} legal={<p className="m-0">© 2026 {product}, Inc. <Link href="#terms">Terms</Link> · <Link href="#privacy">Privacy</Link></p>} />
    </div>
  );
}
