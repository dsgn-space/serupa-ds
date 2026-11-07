// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Attachment: h(D.Attachment, { name: 'Invoice March 2026.pdf', bytes: 1482000, href: '#invoice', onRemove: () => {} }),
  AttachmentUploading: h(D.Attachment, { name: 'Site photo.jpg', bytes: 3400000, progress: 45 }),
  AttachmentFailed: h(D.Attachment, { name: 'Pitch.pptx', error: true, onRetry: () => {} }),
});
