import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, quantize, draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

const io = new NodeIO().registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

const doc = await io.read('public/models/accesorios/silla-inter.glb');

// Resize all textures to max 256px (it's just a chair, doesn't need 2K textures)
const root = doc.getRoot();
for (const texture of root.listTextures()) {
  const image = texture.getImage();
  if (image) {
    const before = image.byteLength;
    try {
      const resized = await sharp(Buffer.from(image))
        .resize(256, 256, { fit: 'inside' })
        .jpeg({ quality: 70 })
        .toBuffer();
      texture.setImage(new Uint8Array(resized));
      texture.setMimeType('image/jpeg');
      console.log(`Texture resized: ${(before/1024).toFixed(0)}KB -> ${(resized.byteLength/1024).toFixed(0)}KB`);
    } catch (e) {
      console.log(`Skip texture: ${e.message}`);
    }
  }
}

await doc.transform(
  dedup(),
  prune(),
  quantize(),
  draco(),
);

await io.write('public/models/accesorios/silla-inter.glb', doc);

const fs = await import('fs');
const size = fs.statSync('public/models/accesorios/silla-inter.glb').size;
console.log(`\nDone! Chair: ${(size / 1024).toFixed(1)} KB (original: 6265 KB)`);
