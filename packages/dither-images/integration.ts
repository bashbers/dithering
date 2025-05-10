import { AstroIntegration } from "astro";
import { cwd } from "node:process";
import { PNG } from 'pngjs';
import { createReadStream, createWriteStream} from "node:fs";
import { BayerDithering, recursiveFindByExtension } from "./lib.js";
import rehypeDitheredImageContainerHtml from "./rehypeDitheredImageContainerHtml.js";
import { fileURLToPath } from "node:url";

// @ts-ignore
const OptiPng = await import('optipng');

interface ditherImagesOptions {
	directoryToTraverse?: string;
}

export function ditherImagesIntegration(options: ditherImagesOptions = {}): AstroIntegration {
	const { directoryToTraverse = cwd() } = options;
	return {
		name: 'dither-images-integration',
		hooks: {
			'astro:build:start': async ({logger}) => {
				const foundPngFiles = recursiveFindByExtension(directoryToTraverse, 'png', null, []);
				logger.debug(foundPngFiles.toString());
				
				const promises = foundPngFiles.map((foundPng) => {
					return new Promise<void>((resolve, reject) => {
						if(foundPng.includes('-dithered.png') || foundPng.includes('dist\\')) {
							return resolve();
						}
	
						createReadStream(foundPng)
							.pipe(new PNG())
							.on('error', reject)
							.on('parsed', function () {
								// `this` is a PNG instance
								const pixels = Array.from(this.data);
								const palette = [[25,25,25], [75,75,75],[125,125,125],[175,175,175],[225,225,225],[250,250,250]]
								const dithered = BayerDithering(pixels, this.width, this.height, palette);
								
								// The final image
								const png = new PNG({
									width: this.width,
									height: this.height,
								});
								// Intermittent rgba array with every 4th item set to 255 for opacity.
								const rgba = new Uint8Array(this.width * this.height * 4);
		
								// Dithered is actually a index, not concrete values yet.
								for (let i = 0; i < dithered.length; i++) {
								const color = palette[dithered[i]]; // [R, G, B]
								
								const rgbaOffset = i * 4;
								rgba[rgbaOffset]     = color[0]; // R
								rgba[rgbaOffset + 1] = color[1]; // G
								rgba[rgbaOffset + 2] = color[2]; // B
								rgba[rgbaOffset + 3] = 255;      // A
								}
								
								// Fill png.data with the RGBA values
								for (let i = 0; i < rgba.length; i++) {
									png.data[i] = rgba[i] || 0;
								}
		
								//Optimize range is between 1 and 7. Its lossless so we use 7.
								const optimizer = new OptiPng.default(['-o7']); 
								const ditheredFilename = foundPng.split('.')[0] + "-dithered.png";
								png.pack()
									.pipe(optimizer)
									.pipe(createWriteStream(ditheredFilename))
									.on('finish', () => {
									logger.info(`Processed ${ditheredFilename}!`);
									resolve();
								});
							});
						})
				});
				await Promise.all(promises);
				logger.info('🎉 All images dithered and saved before build continues!');
				},
				'astro:config:setup': ({ updateConfig, injectScript }) => {
						injectScript('page', `
							import '@bashbers/astro-image-dithering/dist/dither-image-toggle.css';
							import '@bashbers/astro-image-dithering/dist/dithered-image-container.js';
						`);
						
						updateConfig({
							markdown: {
								rehypePlugins: [		
									rehypeDitheredImageContainerHtml
								]
							},
							vite: {
								ssr: {
									noExternal: ['@bashbers/astro-image-dithering']
								}
							}
						});
					}
			}
		}
	}
