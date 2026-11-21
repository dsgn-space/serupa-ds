'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { DescriptionList, DescriptionItem } from '../../components/DescriptionList/DescriptionList';
import { Field } from '../../components/Field/Field';
import { Image } from '../../components/Image/Image';
import { Link } from '../../components/Link/Link';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { Duration } from '../../components/Duration/Duration';
import { useLocale } from '../../internal/provider';
import { announce } from '../../internal/announce';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Recipe: what it is and how long it takes, the ingredients for as many people as you're cooking for, ticked off as
   you gather them, and the steps in order, ticked off as you go. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the times and servings are a description list; the ingredients a list and the steps an ordered list, each
     under its heading; the picture has a text alternative that says what's in it.
   - 3.3.2, 4.1.3: Servings says its range; changing it rescales every amount and says so.
   - 1.3.1, 4.1.2: each ingredient and each step is a checkbox named by its own text, so ticking is read with what's ticked.
   - 1.4.1: a ticked step is struck through and says "Done", never only greyed out.
   Saving what's ticked is the app's job: pass the recipe; ticks live while the page is open. */

export interface Ingredient { id: string; amount: number | null; unit: string; name: string }
export interface RecipeData {
  title: string; about: string; image: string; imageAlt: string;
  prep: number; cook: number; serves: number;
  ingredients: Ingredient[]; steps: string[];
}

export interface RecipeProps { recipe?: RecipeData | undefined }

const bowl = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#efe6d8"/><ellipse cx="400" cy="250" rx="230" ry="120" fill="#ffffff"/><ellipse cx="400" cy="235" rx="200" ry="90" fill="#e08a3c"/><circle cx="330" cy="215" r="22" fill="#5a8f3d"/><circle cx="450" cy="245" r="18" fill="#5a8f3d"/><circle cx="400" cy="200" r="14" fill="#f4d35e"/><circle cx="480" cy="210" r="12" fill="#f4d35e"/></svg>');
const demo: RecipeData = {
  title: 'Red lentil soup', about: 'A thick, warming soup from the cupboard, ready in under an hour.', image: bowl,
  imageAlt: 'A bowl of orange lentil soup topped with herbs and a swirl of yoghurt',
  prep: 10, cook: 35, serves: 4,
  ingredients: [
    { id: 'oil', amount: 2, unit: 'tbsp', name: 'olive oil' },
    { id: 'onion', amount: 1, unit: '', name: 'onion, chopped' },
    { id: 'garlic', amount: 2, unit: 'cloves', name: 'garlic, crushed' },
    { id: 'cumin', amount: 1.5, unit: 'tsp', name: 'ground cumin' },
    { id: 'lentils', amount: 250, unit: 'g', name: 'red lentils, rinsed' },
    { id: 'tomatoes', amount: 400, unit: 'g', name: 'chopped tomatoes (one tin)' },
    { id: 'stock', amount: 1.2, unit: 'litres', name: 'vegetable stock' },
    { id: 'lemon', amount: 0.5, unit: '', name: 'lemon, juiced' },
    { id: 'salt', amount: null, unit: '', name: 'Salt and pepper, to taste' },
  ],
  steps: [
    'Warm the oil in a large pan over a medium heat. Cook the onion for 8 minutes, until soft.',
    'Add the garlic and cumin and stir for a minute, until they smell toasted.',
    'Add the lentils, tomatoes and stock. Bring to the boil, then simmer for 25 minutes, stirring now and then.',
    'Blend until smooth, or leave it chunky. Stir in the lemon juice and season.',
  ],
};

/** An amount for `to` people from one for `from`, rounded sensibly: quarters under 10, whole numbers over. */
export function scaleAmount(amount: number, from: number, to: number) {
  const v = (amount * to) / from;
  return v < 10 ? Math.round(v * 4) / 4 : Math.round(v);
}


/** The recipe page: a skip link, a header, then main with the h1, the facts, the ingredients and the steps. */
export function Recipe({ recipe = demo }: RecipeProps) {
  const locale = useLocale();
  const num = (n: number) => formatNumber(n, locale, { maximumFractionDigits: 2 });
  const [serves, setServes] = React.useState<number | null>(recipe.serves);
  const [got, setGot] = React.useState<string[]>([]);
  const [done, setDone] = React.useState<number[]>([]);
  const people = serves && serves > 0 ? serves : recipe.serves;
  const amountOf = (i: Ingredient) => (i.amount === null ? '' : `${num(scaleAmount(i.amount, recipe.serves, people))}${i.unit ? ` ${i.unit}` : ''} `);
  const peopleWords = people === 1 ? '1 person' : `${num(people)} people`;
  const said = React.useRef(people);
  React.useEffect(() => {
    if (said.current !== people) announce(`Amounts now for ${peopleWords}.`);
    said.current = people;
  }, [people, peopleWords]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Kitchen</p>
        <Link underline="hover" href="#recipes">Recipes</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col px-4 py-8 outline-none">
        <PageHeader breadcrumb={[{ label: 'Recipes', href: '#recipes' }, { label: recipe.title }]} title={recipe.title} description={recipe.about} />
        <div className="flex flex-col gap-8 pt-6">
          <Image src={recipe.image} alt={recipe.imageAlt} ratio="video" rounded />
          <DescriptionList layout="inline">
            <DescriptionItem term="Prep"><Duration value={recipe.prep} unit="minute" /></DescriptionItem>
            <DescriptionItem term="Cook"><Duration value={recipe.cook} unit="minute" /></DescriptionItem>
            <DescriptionItem term="Ready in"><Duration value={recipe.prep + recipe.cook} unit="minute" /></DescriptionItem>
          </DescriptionList>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <section aria-labelledby="recipe-ingredients" className="flex flex-col gap-4">
              <h2 id="recipe-ingredients" className="m-0 text-xl font-semibold">Ingredients</h2>
              <Field label="Servings" hint="From 1 to 24." id="recipe-serves">
                <NumberInput min={1} max={24} value={serves} onValueChange={setServes} className="max-w-32" />
              </Field>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {recipe.ingredients.map((i) => (
                  <li key={i.id}>
                    <Checkbox checked={got.includes(i.id)} onCheckedChange={(on) => setGot((g) => (on ? [...g, i.id] : g.filter((x) => x !== i.id)))}>
                      <span className={got.includes(i.id) ? 'text-text-muted line-through' : undefined}>{amountOf(i)}{i.name}</span>
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="recipe-steps" className="flex flex-col gap-4 md:col-span-2">
              <h2 id="recipe-steps" className="m-0 text-xl font-semibold">Method</h2>
              <p className="m-0 text-text-muted">{done.length === recipe.steps.length ? 'Every step done. Enjoy!' : `${num(done.length)} of ${num(recipe.steps.length)} steps done.`}</p>
              <ol className="m-0 flex list-none flex-col gap-4 p-0">
                {recipe.steps.map((s, n) => (
                  <li key={n}>
                    <h3 className="m-0 text-base font-semibold">Step {num(n + 1)}{done.includes(n) ? ', done' : ''}</h3>
                    <Checkbox checked={done.includes(n)} onCheckedChange={(on) => setDone((d) => (on ? [...d, n] : d.filter((x) => x !== n)))}>
                      <span className={done.includes(n) ? 'text-text-muted line-through' : undefined}>{s}</span>
                    </Checkbox>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
