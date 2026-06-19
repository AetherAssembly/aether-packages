import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`ae-btn ae-btn--${variant} ae-btn--${size}${className ? ` ${className}` : ''}`}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="ae-btn__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
