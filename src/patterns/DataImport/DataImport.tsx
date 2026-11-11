'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Link } from '../../components/Link/Link';
import { Field } from '../../components/Field/Field';
import { Select } from '../../components/Select/Select';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { Stepper } from '../../components/Stepper/Stepper';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { Badge } from '../../components/Badge/Badge';
import { Alert } from '../../components/Alert/Alert';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/Table/Table';

/* Data import: a CSV file of customers, its columns matched to the app's fields, every row checked and shown before
   anything is saved, then what happened in words. For an app to copy. What it carries (WCAG 2.2):
   - 3.3.4: nothing is saved until the last step's button, which says how many rows it saves. The check step lists
     each row's problems first, and rows with problems are skipped only when that's chosen.
   - 3.3.1, 3.3.3: a file that can't be read, a field left unmatched or a column used twice shows an ErrorSummary
     that takes focus and links to the control, each saying what to do.
   - 1.3.1, 1.4.1: the preview is a table with column headers; a row's problem is a Badge with its words and the
     message in its own column, never only a color.
   - 2.4.3, 4.1.3: each new step puts focus on its heading, so the change is said and Tab goes on from there; the
     Stepper above says which step this is in words.
   - 3.3.7: Back keeps the file and the matches, so nothing is chosen twice.
   Saving the rows is the app's job: onImport stands in for it, and `existing` for the app's own records. */

export interface ImportField { key: 'name' | 'email' | 'phone' | 'city'; label: string; required: boolean }
export const FIELDS: ImportField[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'city', label: 'City', required: false },
];
export type ImportRow = Record<ImportField['key'], string>;
/** For each field, the index of the file's column that fills it, or -1 for none. */
export type ImportMapping = Record<ImportField['key'], number>;
export interface CheckedRow { line: number; row: ImportRow; problems: string[]; update: boolean }
export type DataImportStep = 'upload' | 'match' | 'check' | 'done';

export interface DataImportProps {
  /** The step it starts on, with `file`. Default: 'upload'. */
  start?: DataImportStep | undefined;
  /** A file already chosen: its name and text. */
  file?: { name: string; text: string } | undefined;
  /** Emails of the customers the app already has: a row with one of them updates that customer. */
  existing?: string[] | undefined;
  /** Saves the rows. A rejected promise keeps the check step, with "Couldn't import" and Try again. */
  onImport?: ((rows: ImportRow[]) => unknown) | undefined;
}

/** The rows of a CSV file: commas between cells, a line break between rows, "quoted" cells holding commas, line
    breaks and "" for a quote. Empty lines are left out. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  const s = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && !cell) quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

const norm = (x: string) => x.toLowerCase().replace(/[^a-z]/g, '');
const SAME: Record<ImportField['key'], string[]> = { name: ['name', 'fullname', 'customer', 'nama'], email: ['email', 'emailaddress', 'mail'], phone: ['phone', 'mobile', 'telephone', 'tel', 'telepon'], city: ['city', 'town', 'kota'] };
/** Matches each field to the column whose heading names it, or -1. */
export function guessMapping(headers: string[]): ImportMapping {
  const out = {} as ImportMapping;
  for (const f of FIELDS) out[f.key] = headers.findIndex((h) => SAME[f.key].includes(norm(h)));
  return out;
}

/** What's wrong with the matches, in the order of the fields. */
export function mappingProblems(m: ImportMapping, headers: string[]): ErrorSummaryItem[] {
  const out: ErrorSummaryItem[] = [];
  for (const f of FIELDS) {
    const col = m[f.key];
    if (col < 0) { if (f.required) out.push({ field: `import-${f.key}`, message: `Choose the column that holds each customer’s ${f.label.toLowerCase()}` }); continue; }
    const first = FIELDS.find((g) => m[g.key] === col);
    if (first && first.key !== f.key) out.push({ field: `import-${f.key}`, message: `Choose another column for ${f.label.toLowerCase()}: “${headers[col]}” is already used for ${first.label.toLowerCase()}` });
  }
  return out;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Each data row as the app's fields, with its problems and whether it updates a customer the app has. */
export function checkRows(data: string[][], m: ImportMapping, existing: string[]): CheckedRow[] {
  const known = new Set(existing.map((e) => e.toLowerCase()));
  const seen = new Map<string, number>();
  return data.map((cells, i) => {
    const row = {} as ImportRow;
    for (const f of FIELDS) row[f.key] = m[f.key] < 0 ? '' : (cells[m[f.key]] || '').trim();
    const problems: string[] = [];
    if (!row.name) problems.push('No name');
    if (!row.email) problems.push('No email');
    else if (!EMAIL.test(row.email)) problems.push(`“${row.email}” isn’t an email address`);
    else {
      const twice = seen.get(row.email.toLowerCase());
      if (twice) problems.push(`Same email as line ${twice}`);
      else seen.set(row.email.toLowerCase(), i + 2);
    }
    return { line: i + 2, row, problems, update: known.has(row.email.toLowerCase()) };
  });
}

// A phone number reads as one piece: it doesn't break at its spaces.
const NOWRAP: Partial<Record<ImportField['key'], string>> = { phone: 'whitespace-nowrap' };
// Phone numbers and email addresses read left to right in every language: isolated, so a right-to-left page doesn't
// reverse their runs ("+62 811 0000 1234" would come out "1234 0000 811 62+").
const LTR: Partial<Record<ImportField['key'], true>> = { phone: true, email: true };
const DEMO_EXISTING = ['ani@example.com', 'budi@example.com'];
const STEPS = [{ title: 'Choose a file' }, { title: 'Match columns' }, { title: 'Check rows' }, { title: 'Done' }];
const ORDER: DataImportStep[] = ['upload', 'match', 'check', 'done'];
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The import page: a skip link, then main with the Stepper and the step's form. */
export function DataImport({ start = 'upload', file: given, existing = DEMO_EXISTING, onImport }: DataImportProps) {
  const [step, setStep] = React.useState<DataImportStep>(given ? start : 'upload');
  const [file, setFile] = React.useState(given);
  const [files, setFiles] = React.useState<File[]>([]);
  const [errors, setErrors] = React.useState<ErrorSummaryItem[]>([]);
  const [tries, setTries] = React.useState(0);
  const table = React.useMemo(() => (file ? parseCsv(file.text) : []), [file]);
  const headers = table[0] || [];
  const [mapping, setMapping] = React.useState<ImportMapping>(() => guessMapping(headers));
  const [skip, setSkip] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [result, setResult] = React.useState<{ added: number; updated: number; skipped: number } | null>(null);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const moved = React.useRef(false);
  React.useEffect(() => { if (moved.current) heading.current?.focus(); }, [step]);
  const go = (s: DataImportStep) => { moved.current = true; setErrors([]); setStep(s); };
  const fail = (found: ErrorSummaryItem[]) => { setErrors(found); setTries((t) => t + 1); return found.length > 0; };
  const error = (field: string) => errors.find((e) => e.field === field)?.message;

  const checked = React.useMemo(() => checkRows(table.slice(1), mapping, existing), [table, mapping, existing]);
  const bad = checked.filter((r) => r.problems.length), good = checked.filter((r) => !r.problems.length);
  const updates = good.filter((r) => r.update).length;

  const read = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = files[0];
    if (!chosen && !file) { fail([{ field: 'import-file', message: 'Choose a CSV file to import' }]); return; }
    const next = chosen ? { name: chosen.name, text: await chosen.text() } : file!;
    const rows = parseCsv(next.text);
    if (rows.length < 2) { fail([{ field: 'import-file', message: `${next.name} has no rows under its headings. Choose a CSV file with a heading row and a row for each customer` }]); return; }
    if (next !== file) { setFile(next); setMapping(guessMapping(rows[0])); }
    go('match');
  };
  const match = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fail(mappingProblems(mapping, headers))) go('check');
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (bad.length && !skip && fail([{ field: 'import-skip', message: `Fix the ${plural(bad.length, 'row', 'rows')} with problems in the file and choose it again, or skip them` }])) return;
    setBusy(true);
    setFailed(false);
    Promise.resolve().then(() => onImport?.(good.map((r) => r.row)))
      .then(() => { setResult({ added: good.length - updates, updated: updates, skipped: bad.length }); go('done'); }, () => setFailed(true))
      .finally(() => setBusy(false));
  };
  const again = () => { setFile(undefined); setFiles([]); setSkip(false); setResult(null); go('upload'); };
  const columns = [{ value: '-1', label: 'Not in the file' }, ...headers.map((h, i) => ({ value: String(i), label: h || `Column ${i + 1}` }))];
  const summary = errors.length ? <ErrorSummary key={tries} errors={errors} headingLevel={3} /> : null;
  const h2 = (text: string) => <Heading level={2} size="lg" ref={heading} tabIndex={-1} className="outline-none">{text}</Heading>;

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <main id="main" className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 outline-none">
        <Heading level={1} size="xl">Import customers</Heading>
        <Stepper current={ORDER.indexOf(step) + (step === 'done' ? 1 : 0)} steps={STEPS} size="sm" />
        <Card className="flex flex-col gap-5">
          {step === 'upload' ? (
            <>
              {h2('Choose a file')}
              <p className="m-0">A CSV file with a heading row, then one row for each customer. A spreadsheet can save one: File, then Download or Export, then CSV.</p>
              {summary}
              <form noValidate onSubmit={(e) => { void read(e); }} className="flex flex-col gap-4">
                <Field label="Customer file" error={error('import-file')}>
                  <FileUpload id="import-file" accept=".csv,text/csv" maxSize={5 * 1024 * 1024} hint="CSV, up to 5 MB" files={files} onFilesChange={setFiles} />
                </Field>
                <Button type="submit" className="self-start">Continue</Button>
              </form>
            </>
          ) : step === 'match' ? (
            <>
              {h2('Match columns')}
              <p className="m-0">Choose the column in <strong>{file?.name}</strong> that holds each detail. We matched the ones whose headings name them.</p>
              {summary}
              <form noValidate onSubmit={match} className="flex flex-col gap-4">
                {FIELDS.map((f) => (
                  <Field key={f.key} label={f.label} optional={!f.required} error={error(`import-${f.key}`)}>
                    <Select id={`import-${f.key}`} options={columns} value={String(mapping[f.key])} onChange={(e) => { const v = Number(e.target.value); setMapping((o) => ({ ...o, [f.key]: v })); }} />
                  </Field>
                ))}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Check rows</Button>
                  <Button variant="secondary" onClick={() => go('upload')}>Back</Button>
                </div>
              </form>
            </>
          ) : step === 'check' ? (
            <>
              {h2('Check rows')}
              <p className="m-0">
                {plural(good.length, 'row is', 'rows are')} ready: {plural(good.length - updates, 'new customer', 'new customers')} and {plural(updates, 'update', 'updates')} to customers you have.
                {bad.length ? ` ${plural(bad.length, 'row has', 'rows have')} problems, listed first.` : ''} Nothing is saved until you import.
              </p>
              {summary}
              <Table caption={`Rows in ${file?.name}`} hideCaption size="sm">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell align="end">Line</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Problem</TableHeaderCell>
                    {FIELDS.map((f) => <TableHeaderCell key={f.key}>{f.label}</TableHeaderCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...bad, ...good].map((r) => (
                    <TableRow key={r.line}>
                      <TableCell align="end">{r.line}</TableCell>
                      <TableCell>{r.problems.length ? <Badge tone="danger">Problem</Badge> : r.update ? <Badge tone="info">Update</Badge> : <Badge tone="success">New</Badge>}</TableCell>
                      <TableCell>{r.problems.join('. ')}</TableCell>
                      {FIELDS.map((f) => <TableCell key={f.key} className={NOWRAP[f.key]}>{LTR[f.key] ? <bdi dir="ltr">{r.row[f.key]}</bdi> : r.row[f.key]}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <form noValidate onSubmit={save} className="flex flex-col gap-4">
                {bad.length ? (
                  <Field error={error('import-skip')}>
                    <Checkbox id="import-skip" checked={skip} onCheckedChange={setSkip} invalid={!!error('import-skip')}
                      description="They stay in your file, so you can fix them and import that file again.">
                      Skip the {plural(bad.length, 'row', 'rows')} with problems
                    </Checkbox>
                  </Field>
                ) : null}
                {failed ? <Alert tone="danger" title="Couldn’t import">Nothing was saved. Check your connection and try again.</Alert> : null}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={busy} disabled={!good.length}>{failed ? 'Try again' : `Import ${plural(good.length, 'customer', 'customers')}`}</Button>
                  <Button variant="secondary" onClick={() => go('match')}>Back</Button>
                </div>
              </form>
            </>
          ) : (
            <>
              {h2('Import finished')}
              {result ? (
                <ul className="m-0 flex list-disc flex-col gap-1 ps-5">
                  <li>{plural(result.added, 'customer', 'customers')} added</li>
                  <li>{plural(result.updated, 'customer', 'customers')} updated</li>
                  <li>{plural(result.skipped, 'row', 'rows')} skipped{result.skipped ? ', still in your file to fix' : ''}</li>
                </ul>
              ) : null}
              <div className="flex flex-wrap items-center gap-4">
                <Link href="#customers">Go to customers</Link>
                <Button variant="secondary" onClick={again}>Import another file</Button>
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
