import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md',
        'z-50 focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      {children}
    </a>
  )
}

interface ScreenReaderOnlyProps {
  children: ReactNode
  className?: string
}

export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  )
}

interface FocusTrapProps {
  children: ReactNode
  className?: string
}

export function FocusTrap({ children, className }: FocusTrapProps) {
  return (
    <div 
      className={cn('focus-trap', className)}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}

// ARIA live region for announcements
export function LiveRegion({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div 
      className={cn('sr-only', className)}
      aria-live="polite"
      aria-atomic="true"
    >
      {children}
    </div>
  )
}

// Keyboard navigation helper
export function useKeyboardNavigation() {
  const handleKeyDown = (event: React.KeyboardEvent, onEnter?: () => void, onEscape?: () => void) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onEnter?.()
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
    }
  }

  return { handleKeyDown }
}
