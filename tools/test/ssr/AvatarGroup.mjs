// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    AvatarGroup: h(D.AvatarGroup, { max: 2 }, h(D.Avatar, { name: 'Ada Lovelace' }), h(D.Avatar, { name: 'Alan Turing' }), h(D.Avatar, { name: 'Grace Hopper' })),
});
