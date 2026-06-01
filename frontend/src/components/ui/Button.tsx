import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'accent' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-primary-500 to-primary-600 border-white/20 text-white ' +
    'shadow-[0_4px_20px_hsla(228,89%,66%,0.4),inset_0_1px_0_hsla(0,0%,100%,0.2)] ' +
    'hover:from-primary-400 hover:to-primary-500 ' +
    'hover:shadow-[0_8px_30px_hsla(228,89%,66%,0.5),inset_0_1px_0_hsla(0,0%,100%,0.3)]',
  accent:
    'bg-gradient-to-br from-accent-cyan to-cyan-600 border-white/20 text-white ' +
    'shadow-[0_4px_20px_hsla(189,100%,56%,0.4),inset_0_1px_0_hsla(0,0%,100%,0.2)] ' +
    'hover:shadow-[0_8px_30px_hsla(189,100%,56%,0.5)]',
  danger:
    'bg-gradient-to-br from-accent-rose to-rose-600 border-white/20 text-white ' +
    'shadow-[0_4px_20px_hsla(340,89%,66%,0.4),inset_0_1px_0_hsla(0,0%,100%,0.2)] ' +
    'hover:shadow-[0_8px_30px_hsla(340,89%,66%,0.5)]',
  ghost:
    'bg-glass-thin border-glass-border text-text-primary ' +
    'hover:bg-glass-medium hover:border-glass-border-accent hover:shadow-glass-hover',
}

export default function Button({
  variant = 'ghost',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        relative inline-flex items-center justify-center gap-2
        px-6 py-3 font-semibold text-sm tracking-wider
        rounded-lg border cursor-pointer overflow-hidden
        transition-[background,border,box-shadow,transform] duration-250 ease-out
        active:scale-[0.98]
        before:absolute before:inset-0 before:-left-full before:w-[200%] before:h-full
        before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
        before:transition-[left] before:duration-400 before:ease-out
        hover:before:left-full
        ${variantStyles[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
