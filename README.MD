Proof of Concept which uses the following libraries:

- https://github.com/pngjs/pngjs/tree/main
- https://www.npmjs.com/package/optipng
- https://github.com/sole/node-dithering/tree/master

It succesfully opens a provided png, dithers it using Bayer dithering and saves it as output.png.
This decreases the filesize from 28.87kb to 2.85kb, a factor 10 decrease in filesize.
