import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, quantize, draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const io = new NodeIO().registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

const doc = await io.read('public/models/accesorios/silla-inter.glb');

// Optimize: remove duplicates, prune unused, quantize, compress with Draco
await doc.transform(
  dedup(),
  prune(),
  quantize(),
  draco(),
);

await io.write('public/models/accesorios/silla-inter.glb', doc);

const fs = await import('fs');
const size = fs.statSync('public/models/accesorios/silla-inter.glb').size;
console.log(`Done! Optimized chair: ${(size / 1024).toFixed(1)} KB`);
