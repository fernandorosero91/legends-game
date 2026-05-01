/**
 * LEGENDS: ApartmentScene — Room Level 1
 * Loads all GLB assets from room_level1/ positioned by room_level1.json
 */

import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { RoomLevel1 } from '../components/game/RoomLevel1';
import { Suspense } from 'react';

export const ApartmentScene = () => {
  return (
    <>
      <CameraRig />

      {/* Room Level 1 — GLB assets positioned by JSON */}
      <Suspense fallback={null}>
        <RoomLevel1 />
      </Suspense>

      {/* Player — spawn at center of room */}
      <Player position={[0, 0, 2]} />
    </>
  );
};
