import { NodeIO } from '@gltf-transform/core';

const KEEP = new Set(['Talking On A Cell Phone']);

const io = new NodeIO();
const doc = await io.read('public/models/npcs/dj_sonic.glb');
const root = doc.getRoot();

console.log('Animations found:');
for (const anim of root.listAnimations()) {
  console.log(`  - "${anim.getName()}"`);
}

for (const anim of root.listAnimations()) {
  if (!KEEP.has(anim.getName())) {
    console.log(`Removing: "${anim.getName()}"`);
    anim.dispose();
  } else {
    console.log(`Keeping: "${anim.getName()}"`);
  }
}

await io.write('public/models/npcs/dj_sonic.glb', doc);
console.log('Done! DJ Sonic GLB optimized — only talkingonacellphone remains.');
