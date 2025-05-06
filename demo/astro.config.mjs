// @ts-check
import { defineConfig } from 'astro/config';
import { rehypeDitheredImageContainerHtml, ditherImagesIntegration} from '../packages/dither-images'
import { cwd } from 'process';

// https://astro.build/config
export default defineConfig({
    markdown: {
        rehypePlugins: [rehypeDitheredImageContainerHtml]
    },
    integrations: [ditherImagesIntegration()]
});
