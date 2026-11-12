// Storybook and the tests load the source CSS through Vite, which runs this; the build runs the same plugin over the
// CSS it ships (tools/build/build.mjs), so both answer an app's own data-motion="reduce" the same way.
import { motionAttribute } from './tools/build/motion-attribute.mjs';

export default { plugins: [motionAttribute()] };
