import { useGLTF } from '@react-three/drei';
import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { useEffect } from 'react';
import * as THREE from 'three';
import { usePlayerStore } from '../store/playerStore';

export const ApartmentScene = () => {
  const house = useGLTF('/models/house.glb');
  const setWallBoxes = usePlayerStore((s) => s.setWallBoxes);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(house.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    console.log('House bounds:', {
      min: { x: box.min.x.toFixed(3), y: box.min.y.toFixed(3), z: box.min.z.toFixed(3) },
      max: { x: box.max.x.toFixed(3), y: box.max.y.toFixed(3), z: box.max.z.toFixed(3) },
      size: { x: size.x.toFixed(3), y: size.y.toFixed(3), z: size.z.toFixed(3) },
      center: { x: center.x.toFixed(3), y: center.y.toFixed(3), z: center.z.toFixed(3) },
    });

    // Enable shadows on house
    house.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Collect wall colliders: meshes that are walls (tall + thin in at least one XZ axis)
    // Skip floors (very flat) and very small objects
    const walls: Array<{ id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }> = [];
    house.scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const meshBox = new THREE.Box3().setFromObject(child);
      const s = new THREE.Vector3();
      meshBox.getSize(s);

      const height = s.y;
      const minXZ = Math.min(s.x, s.z);

      // Wall: tall (> 0.3) and thin in at least one horizontal axis (< 0.3)
      // This catches walls but not floors or large furniture tops
      if (height > 0.3 && minXZ < 0.3) {
        walls.push({
          id: child.uuid,
          min: { x: meshBox.min.x, y: meshBox.min.y, z: meshBox.min.z },
          max: { x: meshBox.max.x, y: meshBox.max.y, z: meshBox.max.z },
        });
      }
    });

    console.log('Wall colliders:', walls.length);
    setWallBoxes(walls);
  }, [house, setWallBoxes]);

  // House floor position
  const houseY = 0.5;

  return (
    <>
      <CameraRig />

      {/* Ground below the house */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#5a8f3c" />
      </mesh>

      {/* House raised slightly so floor is visible */}
      <primitive object={house.scene} position={[0, houseY, 0]} scale={1} />

      {/* Player inside the house — on the actual floor */}
      <Player position={[0, 0.18, 0]} />
    </>
  );
};

useGLTF.preload('/models/house.glb');
