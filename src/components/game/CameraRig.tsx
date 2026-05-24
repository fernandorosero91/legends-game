import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

// ── Config ──────────────────────────────────────────────
const DEFAULT_DISTANCE = 12;
const MIN_DISTANCE = 6;
const MAX_DISTANCE = 16;
const DEFAULT_POLAR = THREE.MathUtils.degToRad(40); // vertical angle
const MIN_POLAR = THREE.MathUtils.degToRad(15);
const MAX_POLAR = THREE.MathUtils.degToRad(80);
const DEFAULT_AZIMUTH = 0; // horizontal angle
const ROTATE_SPEED = 0.005;
const ZOOM_SPEED = 1;
const FOLLOW_LERP = 0.12;
const LOOK_OFFSET_Y = 2; // look above feet
const PINCH_ZOOM_SPEED = 0.04;

export function CameraRig() {
  const { camera, gl } = useThree();

  // Orbital state
  const azimuth = useRef(DEFAULT_AZIMUTH);
  const polar = useRef(DEFAULT_POLAR);
  const distance = useRef(DEFAULT_DISTANCE);

  // Smooth follow target
  const targetPos = useRef(new THREE.Vector3());
  const smoothTarget = useRef(new THREE.Vector3());

  // Mouse drag state
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });

  // Touch state
  const touchState = useRef<{
    rotating: boolean;
    pinching: boolean;
    prevTouches: { x: number; y: number }[];
    prevPinchDist: number;
  }>({
    rotating: false,
    pinching: false,
    prevTouches: [],
    prevPinchDist: 0,
  });

  // ── Mouse handlers ────────────────────────────────────
  const onMouseDown = useCallback((e: MouseEvent) => {
    // Right click or middle click to rotate
    if (e.button === 2 || e.button === 1) {
      isDragging.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - prevMouse.current.x;
    const dy = e.clientY - prevMouse.current.y;

    azimuth.current -= dx * ROTATE_SPEED;
    polar.current = THREE.MathUtils.clamp(
      polar.current + dy * ROTATE_SPEED,
      MIN_POLAR,
      MAX_POLAR
    );

    prevMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseUp = useCallback((e: MouseEvent) => {
    if (e.button === 2 || e.button === 1) {
      isDragging.current = false;
    }
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    distance.current = THREE.MathUtils.clamp(
      distance.current + Math.sign(e.deltaY) * ZOOM_SPEED,
      MIN_DISTANCE,
      MAX_DISTANCE
    );
    e.preventDefault();
  }, []);

  const onContextMenu = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  // ── Touch handlers ────────────────────────────────────
  const getTouchPositions = (e: TouchEvent) =>
    Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }));

  const getPinchDistance = (touches: { x: number; y: number }[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[1].x - touches[0].x;
    const dy = touches[1].y - touches[0].y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touches = getTouchPositions(e);
    if (e.touches.length === 2) {
      // Two fingers: rotate + pinch
      touchState.current.rotating = true;
      touchState.current.pinching = true;
      touchState.current.prevTouches = touches;
      touchState.current.prevPinchDist = getPinchDistance(touches);
      e.preventDefault();
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const ts = touchState.current;
    if (!ts.rotating && !ts.pinching) return;

    const touches = getTouchPositions(e);

    if (ts.rotating && touches.length >= 2 && ts.prevTouches.length >= 2) {
      // Average movement of both fingers = rotation
      const avgDx =
        (touches[0].x + touches[1].x - ts.prevTouches[0].x - ts.prevTouches[1].x) / 2;
      const avgDy =
        (touches[0].y + touches[1].y - ts.prevTouches[0].y - ts.prevTouches[1].y) / 2;

      azimuth.current -= avgDx * ROTATE_SPEED;
      polar.current = THREE.MathUtils.clamp(
        polar.current + avgDy * ROTATE_SPEED,
        MIN_POLAR,
        MAX_POLAR
      );
    }

    if (ts.pinching && touches.length >= 2) {
      const pinchDist = getPinchDistance(touches);
      const delta = ts.prevPinchDist - pinchDist;
      distance.current = THREE.MathUtils.clamp(
        distance.current + delta * PINCH_ZOOM_SPEED,
        MIN_DISTANCE,
        MAX_DISTANCE
      );
      ts.prevPinchDist = pinchDist;
    }

    ts.prevTouches = touches;
    e.preventDefault();
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      touchState.current.rotating = false;
      touchState.current.pinching = false;
      touchState.current.prevTouches = [];
    }
  }, []);

  // ── Keyboard zoom (Ctrl + / Ctrl -) ────────────────────
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    if (e.key === '=' || e.key === '+') {
      distance.current = THREE.MathUtils.clamp(
        distance.current - ZOOM_SPEED,
        MIN_DISTANCE,
        MAX_DISTANCE
      );
      e.preventDefault();
    } else if (e.key === '-') {
      distance.current = THREE.MathUtils.clamp(
        distance.current + ZOOM_SPEED,
        MIN_DISTANCE,
        MAX_DISTANCE
      );
      e.preventDefault();
    }
  }, []);

  // ── Attach / detach listeners ─────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [gl, onMouseDown, onMouseMove, onMouseUp, onWheel, onContextMenu, onTouchStart, onTouchMove, onTouchEnd, onKeyDown]);

  // ── Frame loop ────────────────────────────────────────
  useFrame(() => {
    const playerGroup = usePlayerStore.getState().playerRef;
    if (!playerGroup) return;

    // Player position as follow target
    const p = playerGroup.position;
    targetPos.current.set(p.x, p.y + LOOK_OFFSET_Y, p.z);

    // Smooth follow
    smoothTarget.current.lerp(targetPos.current, FOLLOW_LERP);

    // Spherical to cartesian offset
    const d = distance.current;
    const phi = polar.current;
    const theta = azimuth.current;

    const offsetX = d * Math.sin(phi) * Math.sin(theta);
    const offsetY = d * Math.cos(phi);
    const offsetZ = d * Math.sin(phi) * Math.cos(theta);

    camera.position.set(
      smoothTarget.current.x + offsetX,
      smoothTarget.current.y + offsetY,
      smoothTarget.current.z + offsetZ
    );

    camera.lookAt(smoothTarget.current);
  });

  return null;
}
