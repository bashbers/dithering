Proof of Concept which uses the following libraries:

- https://github.com/pngjs/pngjs/tree/main
- https://www.npmjs.com/package/optipng
- https://github.com/sole/node-dithering/tree/master

It exposes 2 files:

- integration.ts
- rehypeDitheredImageContainerHtml.ts - the rehype plugin

The Astro integration will traverse your Astro directory searching for PNG files and convert them to dithered images using the -dithered.png suffix. They will be stored next to the original images.

The rehype plugin which will convert your existing image inclusions in your .md files to a figure containing both the image and a toggle to switch between the dithered and non-dithered version.

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
