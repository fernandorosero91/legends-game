export function CityBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <img
        src="/inicio.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Subtle dark overlay for text readability */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.4) 100%)',
      }} />
    </div>
  );
}
