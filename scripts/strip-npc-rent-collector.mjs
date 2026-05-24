/**
 * Strip animations from npc_rent_collector.glb
 * Keeps only the idle animation (armaturemixamocomlayer0)
 */

import { NodeIO } from '@gltf-transform/core';

const KEEP = new Set(['Armature|mixamo.com|Layer0']);

const io = new NodeIO();
const filePath = 'public/models/npcs/npc_rent_collector.glb';

console.log(`Reading: ${filePath}`);
const doc = await io.read(filePath);
const root = doc.getRoot();

console.log(`\nAnimations found: ${root.listAnimations().length}`);

for (const anim of root.listAnimations()) {
  const name = anim.getName();
  if (!KEEP.has(name)) {
    console.log(`  ❌ Removing: "${name}"`);
    anim.dispose();
  } else {
    console.log(`  ✅ Keeping: "${name}"`);
  }
}

await io.write(filePath, doc);
console.log(`\nDone! Optimized GLB saved to ${filePath}`);
