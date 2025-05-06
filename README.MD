Proof of Concept which uses the following libraries:

- https://github.com/pngjs/pngjs/tree/main
- https://www.npmjs.com/package/optipng
- https://github.com/sole/node-dithering/tree/master

It exposes 2 files:

- integration.ts - The Astro integration
- rehypeDitheredImageContainerHtml.ts - the rehype plugin

Both can be used like this in your astro.config.mjs:

```js
import {
  rehypeDitheredImageContainerHtml,
  ditherImagesIntegration,
} from "../packages/dither-images"; // This should be changed to the NPM package name

export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeDitheredImageContainerHtml],
  },
  integrations: [ditherImagesIntegration()],
});
```
