export default function FluidBg() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Animated mesh gradient */}
      <div
        className="absolute inset-[-50%] opacity-80"
        style={{
          background: 'var(--bg-gradient-mesh)',
          backgroundSize: '200% 200%',
          animation: 'mesh-flow 20s ease-in-out infinite',
          filter: 'blur(60px)',
        }}
      />
      {/* Fluid pulse overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, hsla(228, 89%, 66%, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, hsla(189, 100%, 56%, 0.1) 0%, transparent 50%)
          `,
          animation: 'fluid-pulse 15s ease-in-out infinite',
        }}
      />
    </div>
  )
}
