import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

export function CameraRig() {
  const { camera } = useThree();
  const currentPosition = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    const target = usePlayerStore.getState().playerRef;
    if (!target) return;

    const p = target.position;

    const targetPos = new THREE.Vector3(p.x, p.y + 1.2, p.z + 1.0);
    const lookAt = new THREE.Vector3(p.x, p.y + 0.25, p.z - 0.3);

    currentPosition.current.lerp(targetPos, 0.08);
    currentLookAt.current.lerp(lookAt, 0.1);

    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
