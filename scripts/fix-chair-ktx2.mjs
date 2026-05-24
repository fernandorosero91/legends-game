import { NodeIO } from '@gltf-transform/core';
import { dedup, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';

const io = new NodeIO();

try {
  const doc = await io.read('public/models/accesorios/silla-inter.glb');
  
  // Remove KTX2 textures by converting them back to PNG/JPEG
  const root = doc.getRoot();
  for (const texture of root.listTextures()) {
    const mimeType = texture.getMimeType();
    console.log(`Texture: ${texture.getName()} - ${mimeType}`);
    if (mimeType === 'image/ktx2') {
      // Can't easily convert KTX2 back, just remove the texture
      console.log('  -> Removing KTX2 texture (not supported without loader)');
      texture.dispose();
    }
  }

  await io.write('public/models/accesorios/silla-inter.glb', doc);
  console.log('Done! Chair GLB saved without KTX2 textures.');
} catch (e) {
  console.error('Error:', e.message);
  console.log('Try restoring the original file from git instead.');
}
