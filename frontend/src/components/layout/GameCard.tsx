import { Link } from 'react-router-dom'
import GlassPanel from '../ui/GlassPanel'
import Badge from '../ui/Badge'
import type { BadgeVariant } from '../ui/Badge'

interface GameCardProps {
  title: string
  description: string
  link: string
  badgeText: string
  badgeVariant: BadgeVariant
  gradientFrom?: string
  gradientTo?: string
}

export default function GameCard({
  title,
  description,
  link,
  badgeText,
  badgeVariant,
  gradientFrom = 'hsla(228, 89%, 66%, 0.2)',
  gradientTo = 'hsla(189, 100%, 56%, 0.1)',
}: GameCardProps) {
  return (
    <Link to={link} className="no-underline">
      <GlassPanel className="h-full flex flex-col group">
        {/* Cover */}
        <div
          className="relative w-full h-[180px] overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
          }}
        >
          {/* Hover glow */}
          <div
            className="
              absolute inset-0 opacity-0 group-hover:opacity-100
              transition-opacity duration-250
              bg-gradient-to-b from-transparent to-primary-500/20
            "
          />
          {/* Bottom fade */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, hsla(222, 47%, 11%, 0.8) 100%)',
            }}
          />
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col flex-1 bg-glass-thin backdrop-blur-md">
          <Badge variant={badgeVariant} className="self-start mb-3">
            {badgeText}
          </Badge>
          <h3 className="m-0 mb-2.5 text-lg font-semibold text-text-primary">
            {title}
          </h3>
          <p className="m-0 text-sm text-text-secondary leading-relaxed flex-1">
            {description}
          </p>
          <div className="mt-auto pt-4">
            <span
              className="
                block w-full text-center py-3 font-semibold text-sm tracking-wider
                bg-glass-medium backdrop-blur-md rounded-lg
                border border-glass-border
                text-text-primary uppercase
                transition-all duration-250
                group-hover:bg-glass-thick group-hover:border-glass-border-accent
                group-hover:shadow-[0_0_20px_hsla(228,89%,66%,0.3)]
              "
            >
              进入游戏
            </span>
          </div>
        </div>
      </GlassPanel>
    </Link>
  )
}
