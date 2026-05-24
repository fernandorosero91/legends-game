const fs = require('fs');
const path = require('path');
const files = [
  'public/models/flexin_personaje-_litkillah_con_textura.glb',
  'public/models/hombre_de_55_anos.glb',
];
for (const f of files) {
  const b = fs.readFileSync(f);
  const jsonLen = b.readUInt32LE(12);
  const json = JSON.parse(b.slice(20, 20 + jsonLen).toString());
  console.log('---', path.basename(f));
  console.log('animations:', (json.animations || []).map(a => a.name));
}
