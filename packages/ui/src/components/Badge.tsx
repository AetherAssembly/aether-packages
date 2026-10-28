import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({
  variant = 'default',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`ae-badge ae-badge--${variant}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </span>
  )
}
