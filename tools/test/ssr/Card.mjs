// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Card: h(D.Card, null, h(D.CardHeader, null, 'Title'), h(D.CardBody, null, 'Body'), h(D.CardFooter, null, 'Footer')),
});
