// @ts-check
import { defineConfig } from 'astro/config';
import rehypeDitheredImageContainerHtml from '../packages/dither-images/rehypeDitheredImageContainerHtml'

// https://astro.build/config
export default defineConfig({
    markdown: {
        rehypePlugins: [rehypeDitheredImageContainerHtml]
    }
});
