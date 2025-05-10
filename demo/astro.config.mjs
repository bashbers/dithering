// @ts-check
import { defineConfig } from 'astro/config';
import { ditherImagesIntegration} from '@bashbers/astro-image-dithering'

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [ditherImagesIntegration()],

  vite: {
    plugins: [tailwindcss()]
  }
});