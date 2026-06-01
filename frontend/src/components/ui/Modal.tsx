import { type ReactNode, useEffect, useCallback } from 'react'
import Button from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  actions?: ReactNode
}

export default function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'hsla(222, 47%, 11%, 0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="
          w-[min(720px,calc(100vw-32px))] max-h-[min(84vh,760px)] overflow-auto
          border border-glass-border rounded-2xl p-6
          bg-glass-heavy backdrop-blur-[40px]
          shadow-[0_25px_80px_hsla(0,0%,0%,0.5),0_0_0_1px_hsla(0,0%,100%,0.05)]
        "
      >
        {title && (
          <h2
            className="m-0 text-[22px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </h2>
        )}
        <div className="mt-3 text-sm text-text-primary leading-relaxed">
          {children}
        </div>
        {actions && (
          <div className="mt-4 flex gap-2.5 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
