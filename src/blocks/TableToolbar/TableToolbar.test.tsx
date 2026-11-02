import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSelectCell } from '../../components/Table/Table';
import { Button } from '../../components/Button/Button';
import { TableToolbar } from './TableToolbar';

const PROJECTS = [
  { name: 'Website redesign', status: 'Active' }, { name: 'Mobile app', status: 'Active' },
  { name: 'Billing migration', status: 'Paused' }, { name: 'Help center', status: 'Done' },
  { name: 'Onboarding emails', status: 'Active' }, { name: 'Data export', status: 'Done' },
  { name: 'Status page', status: 'Paused' }, { name: 'Search ranking', status: 'Active' },
];

// The block as an app uses it: state for the search, a filter and the selection, and a table of what matches.
function Projects({ initialQuery = '', initialStatus = '', initialPicked = [] as string[] }) {
  const [query, setQuery] = React.useState(initialQuery);
  const [status, setStatus] = React.useState(initialStatus);
  const [picked, setPicked] = React.useState<string[]>(initialPicked);
  const q = query.trim().toLowerCase();
  const rows = PROJECTS.filter((p) => (!q || p.name.toLowerCase().includes(q)) && (!status || p.status === status));
  const all = rows.length > 0 && rows.every((p) => picked.includes(p.name));
  return (
    <TableToolbar
      noun="projects" query={query} onQueryChange={setQuery}
      filters={[{ label: 'Status', value: status, onChange: setStatus, options: [{ value: '', label: 'All' }, 'Active', 'Paused', 'Done'] }]}
      results={rows.length === PROJECTS.length ? `${rows.length} projects` : `${rows.length} of ${PROJECTS.length} projects`}
      onClearFilters={() => { setQuery(''); setStatus(''); }}
      selectedCount={picked.length} onClearSelection={() => setPicked([])}
      bulkActions={<Button size="sm" variant="outline">Export</Button>}
    >
      <Table caption="Projects" hideCaption>
        <TableHead><TableRow>
          <TableSelectCell header label="Select all projects" checked={all} onChange={() => setPicked(all ? [] : rows.map((p) => p.name))} />
          <TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell>
        </TableRow></TableHead>
        <TableBody>{rows.map((p) => (
          <TableRow key={p.name} selected={picked.includes(p.name)}>
            <TableSelectCell label={'Select ' + p.name} checked={picked.includes(p.name)} onChange={() => setPicked(picked.includes(p.name) ? picked.filter((x) => x !== p.name) : [...picked, p.name])} />
            <TableCell>{p.name}</TableCell><TableCell>{p.status}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </TableToolbar>
  );
}
const Default = () => <Projects />;
const Filtered = () => <Projects initialQuery="a" initialStatus="Active" />;
const Selected = () => <Projects initialPicked={['Mobile app', 'Help center']} />;
const status = () => document.querySelector('p[role="status"]')!;

// Table toolbar (BL3): a named search landmark with labelled controls, a count that's read out, Clear filters that
// doesn't lose focus, and bulk actions for the selected rows.
describe('Blocks/Table toolbar', () => {
  test('search and filters sit in a named search landmark, each with a visible label', async () => {
    await render(<Default />);
    await expect.element(page.getByRole('search', { name: 'Search and filter projects' })).toBeVisible();
    await expect.element(page.getByRole('searchbox', { name: 'Search' })).toBeVisible();
    await expect.element(page.getByRole('combobox', { name: 'Status' })).toBeVisible();
    expect(status().textContent).toBe('8 projects');
    expect(document.querySelector('form[role="search"] button')).toBeNull();   // nothing to clear yet
  });

  test('typing and filtering update the count in the status region', async () => {
    await render(<Default />);
    await userEvent.type(page.getByRole('searchbox', { name: 'Search' }), 'app');
    await expect.poll(() => status().textContent).toBe('1 of 8 projects');
    await userEvent.clear(page.getByRole('searchbox', { name: 'Search' }));
    await userEvent.selectOptions(page.getByRole('combobox', { name: 'Status' }), 'Done');
    await expect.poll(() => status().textContent).toBe('2 of 8 projects');
    expect(page.getByRole('row').elements().length).toBe(3);   // the header and two rows
  });

  test('Clear filters resets everything and puts focus in the search field', async () => {
    await render(<Filtered />);
    expect(status().textContent).toBe('3 of 8 projects');
    await userEvent.click(page.getByRole('button', { name: 'Clear filters' }));
    await expect.poll(() => status().textContent).toBe('8 projects');
    expect(document.activeElement).toBe(page.getByRole('searchbox', { name: 'Search' }).element());
    expect((page.getByRole('combobox', { name: 'Status' }).element() as HTMLSelectElement).value).toBe('');
    expect(page.getByRole('button', { name: 'Clear filters' }).elements().length).toBe(0);
  });

  test('selected rows show the count, the bulk actions and Clear selection, just before the table', async () => {
    await render(<Selected />);
    const bar = page.getByRole('group', { name: '2 selected' });
    await expect.element(bar).toBeVisible();
    await expect.element(bar.getByRole('button', { name: 'Export' })).toBeVisible();
    expect(bar.element().nextElementSibling!.querySelector('table')).not.toBeNull();
    await userEvent.click(bar.getByRole('button', { name: 'Clear selection' }));
    await expect.element(bar).not.toBeInTheDocument();
    expect(document.activeElement).toBe(page.getByRole('checkbox', { name: 'Select all projects' }).element());
  });

  test('on a phone the controls stack and the page does not scroll sideways', async () => {
    await page.viewport(360, 700);
    await render(<Selected />);
    const search = page.getByRole('searchbox', { name: 'Search' }).element().getBoundingClientRect();
    const filter = page.getByRole('combobox', { name: 'Status' }).element().getBoundingClientRect();
    expect(filter.top).toBeGreaterThan(search.bottom);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);
  });
});
