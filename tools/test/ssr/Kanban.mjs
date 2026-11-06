// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
const cols = [{ id: 'todo', title: 'To do', items: [{ id: 'a', t: 'Fix login' }] }, { id: 'done', title: 'Done', limit: 0, items: [{ id: 'b', t: 'Ship it' }] }];
export default ({ h, D }) => ({
  Kanban: h(D.Kanban, { 'aria-label': 'Board', columns: cols, getKey: (x) => x.id, getLabel: (x) => x.t, renderCard: (x) => x.t, onMove: () => {} }),
});
