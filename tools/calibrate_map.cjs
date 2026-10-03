const fs = require('fs');
const zlib = require('zlib');

const data = fs.readFileSync('website/assets/images/mapa-nicaragua-territorial.png');
let pos = 8;
let idats = [];
let width = 1207, height = 1303;

while (pos < data.length) {
  const len = data.readUInt32BE(pos);
  const type = data.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') idats.push(data.subarray(pos + 8, pos + 8 + len));
  else if (type === 'IEND') break;
  pos += 12 + len;
}
const raw = zlib.inflateSync(Buffer.concat(idats));

const image = Buffer.alloc(width * height * 4);
let rawPos = 0;
for (let y = 0; y < height; y++) {
  const filterType = raw[rawPos++];
  const prevRowOffset = (y - 1) * width * 4;
  const currRowOffset = y * width * 4;
  for (let x = 0; x < width * 4; x++) {
    const rawVal = raw[rawPos++];
    const a = x >= 4 ? image[currRowOffset + x - 4] : 0;
    const b = y > 0 ? image[prevRowOffset + x] : 0;
    const c = (y > 0 && x >= 4) ? image[prevRowOffset + x - 4] : 0;
    let val = 0;
    if (filterType === 0) val = rawVal;
    else if (filterType === 1) val = (rawVal + a) & 0xff;
    else if (filterType === 2) val = (rawVal + b) & 0xff;
    else if (filterType === 3) val = (rawVal + Math.floor((a + b) / 2)) & 0xff;
    else if (filterType === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      let pr = c;
      if (pa <= pb && pa <= pc) pr = a;
      else if (pb <= pc) pr = b;
      val = (rawVal + pr) & 0xff;
    }
    image[currRowOffset + x] = val;
  }
}

// Check the visible volcanic craters in the 3D map!
// In the 3D map screenshot (media_1790876509882.png), there are dramatic volcanic cones with craters!
// Cone 1 (San Cristóbal / Chinandega area): very prominent volcano with crater at ~x: 31%, y: 40%
// Cone 2 (Telica / Cerro Negro): crater at ~x: 32%, y: 46%
// Cone 3 (Momotombo / Momotombito): at NW corner of Lake Xolotlán ~x: 32.5%, y: 53.5%
// Cone 4 (Masaya / Mombacho): south of Lake Xolotlán / north of Cocibolca ~x: 35.5%, y: 62%
// And Ometepe has the two cone peaks inside Lake Cocibolca!

// Find dark crater pixels (dark ash/caldera: low R, G, B with high elevation relief nearby)
console.log('--- Land border extents ---');
// Let's find northernmost land pixel of Nicaragua in this map
let northLandY = height, northLandX = 0;
for (let y = 50; y < height; y++) {
  for (let x = 100; x < width - 100; x++) {
    const idx = (y * width + x) * 4;
    // Non-black (land or water)
    if (image[idx] > 20 || image[idx+1] > 20 || image[idx+2] > 20) {
      if (y < northLandY) {
        northLandY = y;
        northLandX = x;
      }
    }
  }
}
console.log('Northernmost land:', (northLandX/width*100).toFixed(1)+'%', (northLandY/height*100).toFixed(1)+'%');

// Cañón de Somoto region: Somoto is in Madriz, south of Honduras border, east of San Lucas/Yalagüina
// Around x: 38-44%, y: 22-30%
console.log('Somoto candidate zone: x: 39% - 43%, y: 24% - 28%');
