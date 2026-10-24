// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Pagination: h(D.Pagination, { count: 20, page: 5, onPageChange() {} }),
});
