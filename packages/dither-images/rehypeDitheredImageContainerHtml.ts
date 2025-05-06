import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import path from 'path';

const rehypeDitheredImageContainerHtml: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node: any, index: number, parent: any) => {
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
                <button type="button">Toggle</button>
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
