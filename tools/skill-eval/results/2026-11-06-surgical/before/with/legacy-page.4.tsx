import * as React from 'react';
import { Card, EmptyState, Field, Heading, SearchInput, Stack, Text, announce } from 'serupa-ds';

type Item = { id: string; name: string; owner: string };

export function ItemsPage({ items, onNew }: { items: Item[]; onNew: () => void }) {
  const [query, setQuery] = React.useState('');

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  React.useEffect(() => {
    if (query.trim()) {
      announce(visible.length === 1 ? '1 item found' : `${visible.length} items found`);
    }
  }, [query, visible.length]);

  return (
    <div>
      <div style={{ background: '#0b3d91', color: '#ffffff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>Inventory</span>
        <button style={{ background: '#ffb000', border: 'none', borderRadius: 4 }} onClick={onNew}>New item</button>
      </div>
      <Stack gap="3" className="p-4">
        <Heading level={1}>Items</Heading>
        <Field label="Search items by name">
          <SearchInput
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          />
        </Field>
        {visible.length > 0 ? (
          visible.map((item) => (
            <Card key={item.id}>
              <Text weight="semibold">{item.name}</Text>
              <Text tone="muted">{item.owner}</Text>
            </Card>
          ))
        ) : (
          <EmptyState
            title="No items match your search"
            description="Check the spelling or try a different name."
          />
        )}
      </Stack>
    </div>
  );
}
