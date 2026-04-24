import { usePlayerStore } from '../../store/playerStore';

export function CameraHUD() {
  const cameraMode = usePlayerStore((s) => s.cameraMode);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      color: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      padding: '8px 16px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '14px',
    }}>
      📷 {cameraMode}
    </div>
  );
}
