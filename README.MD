Astro package which exposes 3 files:

- integration.ts
- rehypeDitheredImageContainerHtml.ts
- dithered-image-container.js

The Astro integration will traverse your Astro directory searching for PNG files and convert them to dithered images using the -dithered.png suffix. They will be stored next to the original images.

The rehype plugin which will convert your existing image inclusions in your .md files to a figure containing both the image and a toggle to switch between the dithered and non-dithered version.

The dithered-image-container.js is a client-side script which will allow toggling between the dithered and non-dithered version of the image.

The

The astro integration and the rehype plugin can be used like this in your astro.config.mjs:

```js
import {
  rehypeDitheredImageContainerHtml,
  ditherImagesIntegration,
} from "@bashbers/astro-image-dithering"; // This should be changed to the NPM package name

export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeDitheredImageContainerHtml],
  },
  integrations: [ditherImagesIntegration()],
});
```
