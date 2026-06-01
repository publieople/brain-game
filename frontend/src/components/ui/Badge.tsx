import { type ReactNode } from 'react'

type BadgeVariant = 'active' | 'recommended' | 'focus' | 'default'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  active:
    'bg-cyan-500/15 text-accent-cyan border border-cyan-500/30',
  recommended:
    'bg-primary-500/15 text-primary-400 border border-primary-500/30',
  focus:
    'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  default:
    'bg-glass-thin text-text-secondary border border-glass-border',
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1
        text-[11px] font-semibold tracking-wider uppercase
        rounded-full backdrop-blur-sm
        before:w-1.5 before:h-1.5 before:rounded-full before:bg-current before:shadow-[0_0_8px_currentColor]
        ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}
