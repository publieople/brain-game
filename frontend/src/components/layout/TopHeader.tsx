import { Link } from 'react-router-dom'

interface TopHeaderProps {
  userStatus?: string
}

export default function TopHeader({ userStatus = '未登录' }: TopHeaderProps) {
  return (
    <header
      className="
        sticky top-0 z-50 flex items-center justify-between
        px-8 py-4
        border-b border-glass-border
        bg-glass-medium backdrop-blur-xl
        shadow-[0_4px_30px_hsla(0,0%,0%,0.2)]
        after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px
        after:bg-gradient-to-r after:from-transparent after:via-glass-border-accent after:to-transparent
      "
    >
      <Link to="/" className="no-underline">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-wider m-0 cursor-pointer">
          <span
            style={{
              background: 'linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px hsla(228, 89%, 66%, 0.5)',
            }}
          >
            NEURO
          </span>{' '}
          <span className="text-text-primary">FUSION PLATFORM</span>
        </h1>
      </Link>
      <div
        className="
          text-sm px-3 py-1.5 rounded-full font-mono
          text-text-secondary bg-glass-thin
          border border-glass-border
        "
      >
        {userStatus}
      </div>
    </header>
  )
}
