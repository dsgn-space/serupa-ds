import * as React from 'react';
import { Card, EmptyState, Field, Heading, SearchInput, Stack, Text } from 'serupa-ds';

type Item = { id: string; name: string; owner: string };

export function ItemsPage({ items, onNew }: { items: Item[]; onNew: () => void }) {
  const [query, setQuery] = React.useState('');

  const visibleItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

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
        {visibleItems.map((item) => (
          <Card key={item.id}>
            <Text weight="semibold">{item.name}</Text>
            <Text tone="muted">{item.owner}</Text>
          </Card>
        ))}
        {visibleItems.length === 0 && (
          <EmptyState
            title={query.trim() ? 'No items match your search' : 'No items yet'}
            description={
              query.trim()
                ? 'Try a different name, or clear the search.'
                : 'Items you add will show up here.'
            }
          />
        )}
      </Stack>
    </div>
  );
}
