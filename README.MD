# Astro image dithering plugin

![demo gif](./demo.gif)

## Guide

The astro integration can be used like this in your astro.config.mjs:

```js
import { ditherImagesIntegration } from "@bashbers/astro-image-dithering";

export default defineConfig({
  integrations: [ditherImagesIntegration(
    {
      directoryToTraverse?: string; // Provide directory in which the plugin should search for images and dither them.
      injectCss?: boolean; // Injects css which styles the figure, img and button for the images
      injectClientsideJs?: boolean; // Injects js which toggles the img between dithered and non-dithered
    }
  )],
});
```

## How does it work?

The Astro integration will traverse your Astro directory searching for PNG files and convert them to dithered images using the -dithered.png suffix. They will be stored next to the original images. The dithering is done using a Bayer Dithering algorithm [here](./packages/dither-images/lib.ts)

To make the integration work, it will provide a rehype container which replaces the ![]() with the corresponding figure, img and button for the dithered image. The source can be found [here](./packages/dither-images/rehypeDitheredImageContainerHtml.ts); The rehype plugin which will convert your existing image inclusions in your .md files to a figure containing both the image and a toggle to switch between the dithered and non-dithered version.

It will also by default inject css and js in your pages. The injected css is very slim and readable (if you ask me) and can be referenced in the [css-file](./packages/dither-images/dither-image-toggle.css) and the [js-file](./packages/dither-images/dithered-image-container.ts) The js file is a client-side script which will allow toggling between the dithered and non-dithered version of the image inside the container.

### Custom css

If you want to apply custom css to the container, please set injectCss to false in the options of the integration and provide your own css file which applies styles to:

- .dithered
- .dithered-image-container
- .dithered-button
- .dithered-label
