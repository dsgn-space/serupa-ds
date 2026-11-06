import * as React from 'react';
import { Card, Heading, Stack, Text } from 'serupa-ds';

type Item = { id: string; name: string; owner: string };

export function ItemsPage({ items, onNew }: { items: Item[]; onNew: () => void }) {
  const [query, setQuery] = React.useState('');

  const filteredItems = React.useMemo(() => {
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
        {/* Native input: swap for serupa-ds's text input component if your version exports one. */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items by name"
          aria-label="Search items by name"
        />
        {filteredItems.length === 0 ? (
          <Text tone="muted" role="status">No items match “{query.trim()}”.</Text>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id}>
              <Text weight="semibold">{item.name}</Text>
              <Text tone="muted">{item.owner}</Text>
            </Card>
          ))
        )}
      </Stack>
    </div>
  );
}
