import { type ReactNode } from 'react'

type GlassVariant = 'default' | 'elevated' | 'subtle'

interface GlassPanelProps {
  children: ReactNode
  variant?: GlassVariant
  className?: string
  onClick?: () => void
}

const variantStyles: Record<GlassVariant, string> = {
  default:
    'bg-glass-thin backdrop-blur-xl border border-glass-border ' +
    'before:absolute before:inset-0 before:rounded-[inherit] before:p-px ' +
    'before:bg-gradient-to-br before:from-white/30 before:via-white/5 before:to-black/20 ' +
    'before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] ' +
    'before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:pointer-events-none ' +
    'after:absolute after:top-0 after:left-0 after:right-0 after:h-1/2 ' +
    'after:bg-gradient-to-b after:from-white/8 after:to-transparent after:rounded-t-xl after:pointer-events-none',
  elevated:
    'bg-glass-heavy backdrop-blur-2xl border border-glass-border ' +
    'shadow-[0_8px_32px_0_hsla(0,0%,0%,0.3),inset_0_1px_0_0_hsla(0,0%,100%,0.1)] ' +
    'shadow-[0_20px_60px_hsla(0,0%,0%,0.4)]',
  subtle:
    'bg-glass-thin backdrop-blur-md border border-white/10',
}

export default function GlassPanel({ children, variant = 'default', className = '', onClick }: GlassPanelProps) {
  const base = 'relative rounded-xl overflow-hidden transition-[background,border,transform] duration-250 ease-out'
  const hover = variant === 'default' ? 'hover:bg-glass-thick hover:border-glass-border-accent hover:-translate-y-0.5' : ''
  const focusRing = 'focus-within:border-primary-400 focus-within:shadow-[0_0_0_3px_hsla(228,89%,66%,0.2)]'

  return (
    <div
      className={`${base} ${variantStyles[variant]} ${hover} ${focusRing} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
