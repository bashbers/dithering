var { PNG } = require('pngjs');
var fs = require("fs");
var OptiPng = require('optipng');
var path = require('path')

function colorClamp(value) {
	if(value < 0) return 0;
	else if(value > 255) return 255;

	return value;
}

var bayerMatrix8x8 = [
	[  1, 49, 13, 61,  4, 52, 16, 64 ],
	[ 33, 17, 45, 29, 36, 20, 48, 32 ],
	[  9, 57,  5, 53, 12, 60,  8, 56 ],
	[ 41, 25, 37, 21, 44, 28, 40, 24 ],
	[  3, 51, 15, 63,  2, 50, 14, 62 ],
	[ 35, 19, 47, 31, 34, 18, 46, 30 ],
	[ 11, 59,  7, 55, 10, 58,  6, 54 ],
	[ 43, 27, 39, 23, 42, 26, 38, 22 ]
	];

	// int r, int g, int b, int[][] palette, int paletteLength
	function getClosestPaletteColorIndex(r, g, b, palette, paletteLength) {
		var minDistance = 195076;
		var diffR, diffG, diffB;
		var distanceSquared;
		var bestIndex = 0;
		var paletteChannels;

		for(var i = 0; i < paletteLength; i++) {

			paletteChannels = palette[i];
			diffR = r - paletteChannels[0];
			diffG = g - paletteChannels[1];
			diffB = b - paletteChannels[2];

			distanceSquared = diffR*diffR + diffG*diffG + diffB*diffB;

			if(distanceSquared < minDistance) {
				bestIndex = i;
				minDistance = distanceSquared;
			}

		}

		return bestIndex;
	}

// TODO: inPixels -> inComponents or inColors or something more accurate
function BayerDithering(inPixels, width, height, palette) {
	var offset = 0;
	var indexedOffset = 0;
	var r, g, b;
	var pixel, threshold, index;
	var paletteLength = palette.length;
	var matrix = bayerMatrix8x8;
	var indexedPixels = new Uint8Array( width * height );

	var modI = 8;
	var modJ = 8;

	for(var j = 0; j < height; j++) {
		var modj = j % modJ;

		for(var i = 0; i < width; i++) {

			threshold = matrix[i % modI][modj];

			r = colorClamp( inPixels[offset] + threshold );
			g = colorClamp( inPixels[offset+ 1] + threshold );
			b = colorClamp( inPixels[offset+ 2] + threshold );
            offset += 4;

			index = getClosestPaletteColorIndex(r, g, b, palette, paletteLength);
			indexedPixels[indexedOffset++] = index;

		}
	}
	return indexedPixels;
}

function recursiveFindByExtension(base: string,ext: string,files: any,result: string[]) 
{
    files = files || fs.readdirSync(base) 
    result = result || [] 

    files.forEach( 
        function (file) {
            var newbase = path.join(base,file)
            if ( fs.statSync(newbase).isDirectory() )
            {
                result = recursiveFindByExtension(newbase,ext,fs.readdirSync(newbase),result)
            }
            else
            {
                if ( file.substr(-1*(ext.length+1)) == '.' + ext )
                {
                    result.push(newbase)
                } 
            }
        }
    )
    return result
}

const foundPngFiles = recursiveFindByExtension(__dirname, 'png', null, []);
console.log(foundPngFiles);

for (let i = 0; i < foundPngFiles.length; i++) {
	const foundPng = foundPngFiles[i];
	if(foundPng.includes('-dithered.png')) {
		continue;
	}

	fs.createReadStream(foundPng)
	.pipe(new PNG())
	.on('parsed', function () {
		// `this` is a PNG instance
		const pixels = this.data;
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
		const optimizer = new OptiPng(['-o7']); 
		const ditheredFilename = foundPng.split('.')[0] + "-dithered.png";
		png.pack()
			.pipe(optimizer)
			.pipe(fs.createWriteStream(ditheredFilename)).on('finish', () => {
			console.log('Success!');
		});
	});

	
}
// console.log(foundPngFiles);

// fs.createReadStream('./test_images/nontransparent-bg.png')
//   .pipe(new PNG())
//   .on('parsed', function () {
//     // `this` is a PNG instance
//     const pixels = this.data;
//     const palette = [[25,25,25], [75,75,75],[125,125,125],[175,175,175],[225,225,225],[250,250,250]]
//     const dithered = BayerDithering(pixels, this.width, this.height, palette);
    
//     // The final image
//     const png = new PNG({
//         width: this.width,
//         height: this.height,
//     });
//     // Intermittent rgba array with every 4th item set to 255 for opacity.
//     const rgba = new Uint8Array(this.width * this.height * 4);

//     // Dithered is actually a index, not concrete values yet.
//     for (let i = 0; i < dithered.length; i++) {
//       const color = palette[dithered[i]]; // [R, G, B]
    
//       const rgbaOffset = i * 4;
//       rgba[rgbaOffset]     = color[0]; // R
//       rgba[rgbaOffset + 1] = color[1]; // G
//       rgba[rgbaOffset + 2] = color[2]; // B
//       rgba[rgbaOffset + 3] = 255;      // A
//     }
    
//     // Fill png.data with the RGBA values
//     for (let i = 0; i < rgba.length; i++) {
//         png.data[i] = rgba[i] || 0;
//     }

// 	//Optimize range is between 1 and 7. Its lossless so we use 7.
//     const optimizer = new OptiPng(['-o7']); 

//     png.pack()
//         .pipe(optimizer)
//         .pipe(fs.createWriteStream('./test-images/output.png')).on('finish', () => {
//         console.log('Success!');
//     });
// });

// // export default function DitherImages()