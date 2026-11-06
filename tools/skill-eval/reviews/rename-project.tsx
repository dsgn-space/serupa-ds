import * as React from 'react';
import { Button, Dialog, Field, Input, Stack, toast } from 'serupa-ds';

export function RenameProject({ name, onRename }: { name: string; onRename: (name: string) => Promise<void> }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(name);
  const [error, setError] = React.useState<string | undefined>();
  const [saving, setSaving] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);

  function show() {
    setValue(name);
    setError(undefined);
    setOpen(true);
  }

  async function rename(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setError('Enter a name for the project');
      input.current?.focus();
      return;
    }
    setSaving(true);
    try {
      await onRename(value.trim());
      setOpen(false);
      toast('Project renamed');
    } catch {
      setError("We couldn't rename the project. Try again.");
      input.current?.focus();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={show}>Rename project</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Rename project">
        <form onSubmit={rename}>
          <Stack gap={4}>
            <Field label="Project name" error={error}>
              <Input ref={input} value={value} onChange={(e) => { setValue(e.target.value); setError(undefined); }} />
            </Field>
            <Stack direction="row" gap={2} justify="end">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Rename</Button>
            </Stack>
          </Stack>
        </form>
      </Dialog>
    </>
  );
}
