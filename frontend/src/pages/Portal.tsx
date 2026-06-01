export default function Portal() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: 'var(--glass-medium)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--glass-border-light)',
          boxShadow: '0 4px 30px hsla(0, 0%, 0%, 0.2)',
        }}
      >
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-wider m-0">
          <span
            style={{
              background: 'linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            NEURO
          </span>{' '}
          FUSION PLATFORM
        </h1>
        <div
          className="text-sm px-3 py-1.5 rounded-full font-mono"
          style={{
            color: 'var(--color-text-secondary)',
            background: 'var(--glass-thin)',
            border: '1px solid var(--glass-border-light)',
          }}
        >
          未登录
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6 pb-5">
          {/* Placeholder for game cards */}
          <div className="text-center py-20 text-2xl" style={{ color: 'var(--color-text-tertiary)' }}>
            Brain-Game Portal — 即将呈现
          </div>
        </div>
      </main>
    </div>
  )
}
