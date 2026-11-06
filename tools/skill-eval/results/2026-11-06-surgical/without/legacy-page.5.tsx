import * as React from 'react';
import { Card, Heading, Stack, Text } from 'serupa-ds';

type Item = { id: string; name: string; owner: string };

export function ItemsPage({ items, onNew }: { items: Item[]; onNew: () => void }) {
  const [query, setQuery] = React.useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = React.useMemo(
    () =>
      normalizedQuery
        ? items.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
        : items,
    [items, normalizedQuery]
  );

  return (
    <div>
      <div style={{ background: '#0b3d91', color: '#ffffff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>Inventory</span>
        <button style={{ background: '#ffb000', border: 'none', borderRadius: 4 }} onClick={onNew}>New item</button>
      </div>
      <Stack gap="3" className="p-4">
        <Heading level={1}>Items</Heading>
        {/* Native input: swap for serupa-ds's text/search field component if your version exports one. */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items by name"
          aria-label="Search items by name"
          autoComplete="off"
        />
        {visibleItems.map((item) => (
          <Card key={item.id}>
            <Text weight="semibold">{item.name}</Text>
            <Text tone="muted">{item.owner}</Text>
          </Card>
        ))}
        {visibleItems.length === 0 && (
          <Text tone="muted" role="status">
            {normalizedQuery ? `No items match "${query.trim()}".` : 'No items yet.'}
          </Text>
        )}
      </Stack>
    </div>
  );
}
