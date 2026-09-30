const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'global-injector.js');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  '<p class="bq-footer-tagline">Descubrí lo que no sale en el mapa.</p>',
  '<p class="bq-footer-tagline">DESCUBRÍ LO QUE NO SALE EN EL MAPA.</p>'
);
code = code.replace(
  'https://wa.me/50588888888',
  'https://wa.me/50584431289'
);
code = code.replace(
  '<h4>Explorá</h4>',
  '<h4>EXPLORÁ</h4>'
);
code = code.replace(
  '<h4>Cultura</h4>',
  '<h4>CULTURA</h4>'
);
code = code.replace(
  '<h4>Comunidad</h4>',
  '<h4>COMUNIDAD</h4>'
);
code = code.replace(
  '<h4>Legal</h4>',
  '<h4>LEGAL</h4>'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ global-injector.js actualizado con footer unificado idéntico 1:1');
