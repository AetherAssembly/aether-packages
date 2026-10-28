import type { ComponentPropsWithRef, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`ae-btn ae-btn--${variant} ae-btn--${size}${className ? ` ${className}` : ''}`}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="ae-btn__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
