import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, quantize, draco, weld, simplify } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { MeshoptSimplifier } from 'meshoptimizer';
import fs from 'fs';
import path from 'path';

await MeshoptSimplifier.ready;

const io = new NodeIO().registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

const DIR = 'public/models/dishes';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.glb'));

console.log(`\n🍽️  Optimizing ${files.length} dish models...\n`);

for (const file of files) {
  const filePath = path.join(DIR, file);
  const beforeSize = fs.statSync(filePath).size;
  console.log(`  📦 ${file} — ${(beforeSize / 1024 / 1024).toFixed(1)}MB`);

  try {
    const doc = await io.read(filePath);
    const root = doc.getRoot();

    for (const texture of root.listTextures()) {
      const image = texture.getImage();
      if (image && image.byteLength > 10000) {
        try {
          const resized = await sharp(Buffer.from(image))
            .resize(512, 512, { fit: 'inside' })
            .jpeg({ quality: 70 })
            .toBuffer();
          texture.setImage(new Uint8Array(resized));
          texture.setMimeType('image/jpeg');
        } catch (e) {}
      }
    }

    await doc.transform(
      weld(),
      simplify({ simplifier: MeshoptSimplifier, ratio: 0.1, error: 0.02 }),
      dedup(),
      prune(),
      quantize(),
      draco(),
    );

    await io.write(filePath, doc);
    const afterSize = fs.statSync(filePath).size;
    const reduction = ((1 - afterSize / beforeSize) * 100).toFixed(0);
    console.log(`       → ${(afterSize / 1024).toFixed(0)}KB (-${reduction}%)\n`);
  } catch (err) {
    console.log(`       ❌ Error: ${err.message}\n`);
  }
}

console.log('✅ Done!');
