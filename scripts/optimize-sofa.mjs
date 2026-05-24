import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, quantize, draco, weld, simplify } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { MeshoptSimplifier } from 'meshoptimizer';

await MeshoptSimplifier.ready;

const io = new NodeIO().registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

const doc = await io.read('public/models/accesorios/sofa_3230.glb');

// Resize textures to 256px JPEG (good quality for a sofa)
const root = doc.getRoot();
for (const texture of root.listTextures()) {
  const image = texture.getImage();
  if (image) {
    const before = image.byteLength;
    const resized = await sharp(Buffer.from(image))
      .resize(256, 256, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toBuffer();
    texture.setImage(new Uint8Array(resized));
    texture.setMimeType('image/jpeg');
    console.log(`Texture: ${(before/1024).toFixed(0)}KB -> ${(resized.byteLength/1024).toFixed(0)}KB`);
  }
}

await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.08, error: 0.015 }),
  dedup(),
  prune(),
  quantize(),
  draco(),
);

await io.write('public/models/accesorios/sofa_3230.glb', doc);

const fs = await import('fs');
const size = fs.statSync('public/models/accesorios/sofa_3230.glb').size;
console.log(`\nDone! Sofa: ${(size / 1024).toFixed(0)} KB (was 21.5 MB)`);
