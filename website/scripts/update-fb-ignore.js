const fs = require('fs');
const path = require('path');

const fbPath = path.join(__dirname, '..', '..', 'firebase.json');
let fb = JSON.parse(fs.readFileSync(fbPath, 'utf8'));

const extraIgnores = [
  "assets/BaqueanoNicaragua.apk",
  "assets/videos/*preview*",
  "assets/videos/*(1)*",
  "assets/videos/* (1)*",
  "assets/videos/[preview]destinos.mp4"
];

extraIgnores.forEach(item => {
  if (!fb.hosting.ignore.includes(item)) {
    fb.hosting.ignore.push(item);
  }
});

fs.writeFileSync(fbPath, JSON.stringify(fb, null, 2) + '\n', 'utf8');
console.log('✅ firebase.json ignore optimizado con éxito');
