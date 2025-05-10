
import { readdirSync,statSync} from "fs";
import path from 'node:path'

function colorClamp(value: number) {
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

const pattern = [
    [ 0, 32,  8, 40,  2, 34, 10, 42],   /* 8x8 Bayer ordered dithering  */
    [48, 16, 56, 24, 50, 18, 58, 26],   /* pattern.  Each input pixel   */
    [12, 44,  4, 36, 14, 46,  6, 38],   /* is scaled to the 0..63 range */
    [60, 28, 52, 20, 62, 30, 54, 22],   /* before looking in this table */
    [ 3, 35, 11, 43,  1, 33,  9, 41],   /* to determine the action.     */
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47,  7, 39, 13, 45,  5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21]
]

// int r, int g, int b, int[][] palette, int paletteLength
function getClosestPaletteColorIndex(r: number, g: number, b: number, palette: number[][], paletteLength: number) {
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

export function BayerDithering(inPixels: number[], width: number, height: number, palette: number[][]) {
    var offset = 0;
    var indexedOffset = 0;
    var r, g, b;
    var pixel, threshold, index;
    var paletteLength = palette.length;
    var matrix = pattern;
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
export function recursiveFindByExtension(base: string,ext: string,files: any,result: string[]): string[]
{
    files = files || readdirSync(base) 
    result = result || [] 

    files.forEach( 
        function (file: any) {
            var newbase = path.join(base,file)
            if ( statSync(newbase).isDirectory() )
            {
                result = recursiveFindByExtension(newbase,ext,readdirSync(newbase),result)
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
