/*
 * 🧭 BAQUEANO — Reparador de rutas de imagen rotas (tools/bq-fix-assets.cjs)
 * 🎯 POR QUÉ: 53 rutas locales apuntaban a archivos inexistentes: fotos rotas,
 *    texto alternativo a la vista y peticiones 404 en Firebase Hosting.
 * ⚙️ CÓMO: tabla ruta-rota → foto REAL del proyecto (mismo lugar cuando existe;
 *    nunca la foto de otro plato o de otro lugar haciéndose pasar por él).
 *    Excluye js/global-asset-curator.js: sus claves son las rutas antiguas.
 * 📦 QUÉ: `node tools/bq-fix-assets.cjs` (escribe) o `--dry` (informa).
 */
const fs = require('fs');
const path = require('path');
const WEB = path.join(__dirname, '..', 'website');
const DRY = process.argv.includes('--dry');
const D = 'assets/images/destinos/';
const MAP = {
  'assets/images/baqui.png': 'assets/images/assistant/baqui.png',
  'assets/images/baqui-bird.png': 'assets/images/assistant/baqui-bird.png',
  'assets/images/destinos/hotel_dario.jpg': 'assets/images/aliados/hotel_dario.jpg',
  'assets/images/destinos/finca_magdalena.jpg': D + 'Finca Magdalena Eco-Lodge Campesino.jpg',
  'assets/images/destinos-hero.jpg': D + 'volcan_masaya.jpg',
  'assets/images/destinos/destinos-hero.jpg': D + 'volcan_masaya.jpg',
  'assets/images/destinos/villa_redonda.jpg': D + 'Villa Vista Redonda (Emerald Coast).webp',
  'assets/images/destinos/fortaleza_el_castillo.jpg': D + 'Fortaleza de la Inmaculada Concepción.jpg',
  'assets/images/destinos/Cañón de Somoto & Monumento Nacional.webp': D + 'canon_de_somoto.jpg',
  'assets/images/destinos/Parque Nacional Volcán Masaya & Cráter Santiago.jpg': D + 'volcan_masaya.jpg',
  'assets/images/destinos/Catedral Inmaculada Concepción & Plaza de la Independencia Granada.webp': D + 'Calle La Calzada & Zona Bohemia.jpg',
  'assets/images/destinos/dona_haydee.jpg': 'assets/images/comida/gallo_pinto.jpg',
  'assets/images/destinos/granada.webp': D + 'Calle La Calzada & Zona Bohemia.jpg',
  'assets/images/destinos/ometepe.webp': D + 'isla_de_ometepe.jpg',
  'assets/images/destinos/poco_a_poco.jpg': D + 'Casa Señorial Colonial Granada.jpg',
  'assets/images/destinos/ometepe_volcan_concepcion.jpg': D + 'isla_de_ometepe.jpg',
  'assets/images/destinos/granada_isletas.jpg': D + 'isletas_de_granada.jpg',
  'assets/images/destinos/zapatera_petroglifos.jpg': D + 'isletas_de_granada.jpg',
  'assets/images/destinos/Reserva Natural Volcán Mombacho & Bosque Nuboso.jpg': D + 'selva_negra.jpg',
  'assets/images/hero-home.jpg': D + 'splash_bg.jpg',
  'assets/images/aliados/cañon.webp': D + 'canon_de_somoto.jpg',
  'assets/images/destinos/playa_maderas.jpg': D + 'Playa Maderas (Santuario del Surf).jpg',
  'assets/images/destinos/convento_san_francisco.jpg': D + 'Museo y Convento San Francisco (1529).jpg',
  'assets/images/destinos/calle_la_calzada.jpg': D + 'Calle La Calzada & Zona Bohemia.jpg',
  'assets/images/destinos/posada_san_ramon.jpg': D + 'Posada Rural San Ramón Ometepe.avif',
  'assets/images/destinos/casa_senorial.jpg': D + 'Casa Señorial Colonial Granada.jpg',
  'assets/images/destinos/somoto.jpg': D + 'canon_de_somoto.jpg',
  'assets/images/destinos/canon_somoto_panoramica.jpg': D + 'canon_de_somoto.jpg',
  'assets/images/destinos/Volcán Cerro Negro Sandboarding Extremo.webp': D + 'cerro_negro.jpg',
  'assets/images/destinos/ometepe_charco_verde.jpg': D + 'isla_de_ometepe.jpg',
  'assets/images/comida/gallo pinto con huevo.jpg': 'assets/images/comida/gallo_pinto.jpg',
  'assets/images/comida/indio viejo.jpg': 'assets/images/comida/indio_viejo.jpg',
  // Platos sin fotografía propia: imagen genérica de la región, no la de otro plato.
  'assets/images/comida/pescado frito con tostones.jpg': D + 'corn_island.jpg',
  'assets/images/comida/tacos de carne con salsa y ensalada.jpg': 'assets/images/comida/delicias del norte.jpg',
  'assets/images/comida/fresco de cacao con leche.jpg': 'assets/images/comida/delicias del norte.jpg',
  'assets/images/comida/rosquillas.jpg': 'assets/images/comida/delicias del norte.jpg',
  'assets/images/comida/rondon.jpg': D + 'corn_island.jpg',
  'assets/images/aliados/somoto.webp': D + 'canon_de_somoto.jpg',
  'assets/images/gastronomia/nacatamal.webp': 'assets/images/comida/nacatamal.jpg',
  'assets/images/gastronomia/vigoron.webp': 'assets/images/comida/vigoron.jpg',
  'assets/images/destinos/bahia_sjds.jpg': D + 'Bahía de San Juan del Sur & Mirador del Cristo.jpg',
  'assets/images/destinos/morgans_rock.jpg': D + 'Morgan%27s Rock Eco-Lodge & Reserva Marina.jpg',
  'assets/images/destinos/treehouse.jpg': D + 'selva_negra.jpg',
  'assets/images/destinos/arribas_sunset.jpg': D + 'Refugio de Vida Silvestre La Flor & Playa El Coco.webp',
  'assets/images/heroes/nicaragua_hero_panoramico.jpg': D + 'splash_bg.jpg',
  'assets/images/destinos/catedral_leon_patrimonio.jpg': 'assets/images/historia/Fundación de Ciudades & Sincretismo Cultural.png',
  'assets/images/destinos/volcan_masaya_lava.jpg': D + 'volcan_masaya.jpg',
  'assets/images/logo/logo_baqueano.svg': 'assets/images/LOGOS/logo_baqueano.png',
  'assets/images/heroes/hero-bg.jpg': D + 'splash_bg.jpg'
};

for (const to of Object.values(MAP)) {
  if (!fs.existsSync(path.join(WEB, decodeURIComponent(to)))) {
    console.error('DESTINO INEXISTENTE', to);
    process.exit(1);
  }
}

const list = (dir, prefix) => fs.readdirSync(path.join(WEB, dir)).map((f) => prefix + f);
const files = [
  ...fs.readdirSync(WEB).filter((f) => f.endsWith('.html')),
  ...list('js', 'js/').filter((f) => f.endsWith('.js') && f !== 'js/global-asset-curator.js'),
  ...list('css', 'css/').filter((f) => f.endsWith('.css')),
  ...list('css/pages', 'css/pages/').filter((f) => f.endsWith('.css'))
];

const fromKeys = Object.keys(MAP).sort((a, b) => b.length - a.length);
let total = 0;
for (const f of files) {
  const p = path.join(WEB, f);
  let s = fs.readFileSync(p, 'utf8');
  let n = 0;
  const rel = f.startsWith('css/pages/') ? '../../' : f.startsWith('css/') ? '../' : '';
  for (const from of fromKeys) {
    const variants = rel ? [rel + from, rel + from.replace(/\//g, '\\')] : [from];
    for (const v of variants) {
      const count = s.split(v).length - 1;
      if (count) { n += count; s = s.split(v).join(rel + MAP[from]); }
    }
  }
  if (n) {
    total += n;
    console.log(f.padEnd(34), n);
    if (!DRY) fs.writeFileSync(p, s);
  }
}
console.log('reemplazos:', total, DRY ? '(ensayo)' : '(escritos)');
