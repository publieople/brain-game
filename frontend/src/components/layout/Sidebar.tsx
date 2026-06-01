import { useState, type ReactNode } from 'react'

interface SidebarProps {
  children?: ReactNode
  defaultCollapsed?: boolean
}

export default function Sidebar({ children, defaultCollapsed = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <>
      {/* Expand trigger button (visible when collapsed) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="
            absolute left-3 top-1/2 -translate-y-1/2 z-50
            w-8 h-16 flex items-center justify-center
            bg-glass-medium backdrop-blur-lg
            border border-glass-border rounded-r-lg
            text-text-secondary hover:text-text-primary
            transition-all duration-250
            cursor-pointer
          "
          aria-label="展开侧边栏"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Sidebar panel */}
      <div
        className={`
          relative flex-shrink-0 overflow-hidden
          transition-[width,opacity] duration-300 ease-out
          ${collapsed ? 'w-0 opacity-0' : 'w-[320px] opacity-100'}
        `}
      >
        <div
          className="
            h-full w-[320px] p-4 overflow-y-auto
            border-r border-glass-border
            bg-glass-medium backdrop-blur-2xl
          "
        >
          {/* Collapse button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setCollapsed(true)}
              className="
                w-7 h-7 flex items-center justify-center
                bg-glass-thin rounded-md
                text-text-tertiary hover:text-text-primary
                transition-colors duration-150
                cursor-pointer
              "
              aria-label="收起侧边栏"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 11L9 7L4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Sidebar content */}
          {children ? (
            children
          ) : (
            <div className="text-text-tertiary text-sm text-center py-8">
              侧边栏内容
            </div>
          )}
        </div>
      </div>
    </>
  )
}
