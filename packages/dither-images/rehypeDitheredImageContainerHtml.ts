import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import path from 'node:path';

export const rehypeDitheredImageContainerHtml: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node: any, index?: any, parent?: any) => {
      if (node.tagName === 'img' && parent) {
        const originalSrc = node.properties?.src;
        const alt = node.properties?.alt || '';

        if (typeof originalSrc === 'string') {
          const parsed = path.parse(originalSrc);

          // Presume we pass the original src as input in the MD file.
          const ditheredSrc = path.join(parsed.dir, `${parsed.name}-dithered${parsed.ext}`);

          // Start with the dithered image as src
          const html = `
            <figure class="dithered-image-container" data-src-a="${originalSrc}" data-src-b="${ditheredSrc}">
                <img class="dithered" src="${ditheredSrc}" alt="${alt}" />
                <button class="dithered-button" type="button">
                  <svg width="15" height="15" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
                    <rect width="30" height="30" x="0" y="0" fill="black" />
                    <rect width="30" height="30" x="30" y="0" fill="transparent" />
                    <rect width="30" height="30" x="60" y="0" fill="black" />

                    <rect width="30" height="30" x="0" y="30" fill="transparent" />
                    <rect width="30" height="30" x="30" y="30" fill="black" />
                    <rect width="30" height="30" x="60" y="30" fill="transparent" />

                    <rect width="30" height="30" x="0" y="60" fill="black" />
                    <rect width="30" height="30" x="30" y="60" fill="transparent" />
                    <rect width="30" height="30" x="60" y="60" fill="black" />
                  </svg>
                  <span class="dithered-label">Toggle image</span>
                </button>
            </figure>
          `;

          parent.children[index] = {
            type: 'raw',
            value: html,
          };
        }
      }
    });
  };
};

export default rehypeDitheredImageContainerHtml;
