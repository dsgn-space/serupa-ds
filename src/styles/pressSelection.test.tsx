import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { ChatMessage } from '../components/Chat/Chat';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { Switch } from '../components/Switch/Switch';
import { TagGroup } from '../components/TagGroup/TagGroup';

// A control pressed twice in a row (a checkbox ticked and unticked, a tag picked and dropped) highlights none of its
// words: its label is part of what is pressed, not text to copy, as with Button and the items of a menu.
describe('pressing a control twice highlights none of its words', () => {
  test('checkbox, radio and switch labels, the tags of a TagGroup you pick from, and the reasoning toggle of a chat message', async () => {
    await render(<div style={{ display: 'grid', gap: 24, padding: 24, width: 480 }}>
      <Checkbox>Email updates</Checkbox>
      <RadioGroup aria-label="Plan"><Radio value="free">Free plan</Radio><Radio value="pro">Pro plan</Radio></RadioGroup>
      <Switch>Dark sidebar</Switch>
      <TagGroup aria-label="Topics" selectionMode="multiple" items={[{ id: 'design', label: 'Design' }, { id: 'bug', label: 'Bug' }]} />
      <ChatMessage author="Assistant" reasoning="First I checked the order." reasoningTime={12}>Done</ChatMessage>
    </div>);
    const words = ['Email updates', 'Pro plan', 'Dark sidebar', 'Design', 'Thought for 12 seconds'];
    const highlighted: Record<string, string> = {};
    for (const w of words) {
      getSelection()?.removeAllRanges();
      await userEvent.dblClick(page.getByText(w, { exact: true }));
      highlighted[w] = getSelection()?.toString().trim() ?? '';
    }
    expect(highlighted).toEqual(Object.fromEntries(words.map((w) => [w, ''])));
  });
});
