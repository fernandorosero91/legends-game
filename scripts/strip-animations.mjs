import { NodeIO } from '@gltf-transform/core';

const KEEP = new Set(['idle.001', 'walking', 'sitting']);

const io = new NodeIO();
const doc = await io.read('public/models/player1.glb');
const root = doc.getRoot();

for (const anim of root.listAnimations()) {
  if (!KEEP.has(anim.getName())) {
    console.log(`Removing animation: "${anim.getName()}"`);
    anim.dispose();
  } else {
    console.log(`Keeping animation: "${anim.getName()}"`);
  }
}

await io.write('public/models/player1.glb', doc);
console.log('Done! Stripped GLB saved.');
