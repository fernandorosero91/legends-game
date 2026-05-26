/**
 * Optimize all GLB models in public/models/shop/
 * - Resize textures to 256px max (JPEG 70%)
 * - Simplify geometry (reduce polygons 85%)
 * - Weld vertices, dedup, prune unused data
 * - Quantize attributes
 * - Draco compression
 *
 * Usage: node scripts/optimize-shop.mjs
 */

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

const SHOP_DIR = 'public/models/shop';
const MAX_TEXTURE_SIZE = 256;
const JPEG_QUALITY = 70;
const SIMPLIFY_RATIO = 0.15; // Keep 15% of triangles
const SIMPLIFY_ERROR = 0.02;

// Only optimize files larger than 100KB (small ones are already fine)
const MIN_SIZE_TO_OPTIMIZE = 100 * 1024;

const files = fs.readdirSync(SHOP_DIR).filter(f => f.endsWith('.glb'));

console.log(`\n🛒 Optimizing ${files.length} shop models...\n`);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const filePath = path.join(SHOP_DIR, file);
  const beforeSize = fs.statSync(filePath).size;
  totalBefore += beforeSize;

  if (beforeSize < MIN_SIZE_TO_OPTIMIZE) {
    totalAfter += beforeSize;
    console.log(`  ⏭️  ${file} — ${(beforeSize / 1024).toFixed(0)}KB (already small, skipping)`);
    continue;
  }

  console.log(`  📦 ${file} — ${(beforeSize / 1024).toFixed(0)}KB`);

  try {
    const doc = await io.read(filePath);
    const root = doc.getRoot();

    // Resize textures
    let textureCount = 0;
    for (const texture of root.listTextures()) {
      const image = texture.getImage();
      if (image && image.byteLength > 10000) {
        try {
          const resized = await sharp(Buffer.from(image))
            .resize(MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, { fit: 'inside' })
            .jpeg({ quality: JPEG_QUALITY })
            .toBuffer();
          texture.setImage(new Uint8Array(resized));
          texture.setMimeType('image/jpeg');
          textureCount++;
        } catch (e) {
          // Some textures may not be valid images, skip
        }
      }
    }

    // Optimize geometry
    await doc.transform(
      weld(),
      simplify({ simplifier: MeshoptSimplifier, ratio: SIMPLIFY_RATIO, error: SIMPLIFY_ERROR }),
      dedup(),
      prune(),
      quantize(),
      draco(),
    );

    await io.write(filePath, doc);

    const afterSize = fs.statSync(filePath).size;
    totalAfter += afterSize;
    const reduction = ((1 - afterSize / beforeSize) * 100).toFixed(0);
    console.log(`       → ${(afterSize / 1024).toFixed(0)}KB (-${reduction}%) [${textureCount} textures resized]\n`);

  } catch (err) {
    totalAfter += beforeSize;
    console.log(`       ❌ Error: ${err.message}\n`);
  }
}

console.log(`\n✅ Done!`);
console.log(`   Before: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
console.log(`   After:  ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
console.log(`   Saved:  ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)} MB (-${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)\n`);
