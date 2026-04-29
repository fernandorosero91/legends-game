export function CityBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ background: '#08081a' }}>
      {/* Mobile image — hidden on sm+ */}
      <img
        src="/inicio_mobil.png"
        alt=""
        className="absolute top-0 left-1/2 -translate-x-1/2 h-full max-w-none w-auto sm:hidden"
        style={{ minHeight: '100%' }}
      />
      {/* Desktop image — hidden on mobile */}
      <img
        src="/inicio.png"
        alt=""
        className="absolute top-0 left-0 w-full h-full object-cover object-center hidden sm:block"
      />
      {/* Bottom fade for button readability */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%]" style={{
        background: 'linear-gradient(to top, rgba(8,8,26,0.8) 0%, rgba(8,8,26,0.3) 60%, transparent 100%)',
      }} />
    </div>
  );
}
