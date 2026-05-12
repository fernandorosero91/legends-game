import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, quantize, textureCompress } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const io = new NodeIO().registerDependencies({
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
});

const files = ['public/models/player1.glb', 'public/models/player2.glb', 'public/models/house.glb'];

for (const file of files) {
  try {
    const stat = await import('fs').then(fs => fs.promises.stat(file)).catch(() => null);
    if (!stat) { console.log(`⏭️  ${file} not found, skipping`); continue; }
    
    const sizeBefore = stat.size;
    console.log(`\n📦 Processing ${file} (${(sizeBefore / 1024 / 1024).toFixed(2)} MB)...`);
    
    const doc = await io.read(file);
    
    // Remove duplicate data
    await doc.transform(dedup(), prune(), quantize());
    
    await io.write(file, doc);
    
    const sizeAfter = (await import('fs').then(fs => fs.promises.stat(file))).size;
    const reduction = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
    console.log(`✅ ${file}: ${(sizeBefore/1024/1024).toFixed(2)} MB → ${(sizeAfter/1024/1024).toFixed(2)} MB (${reduction}% smaller)`);
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}

console.log('\n🎉 Done!');
