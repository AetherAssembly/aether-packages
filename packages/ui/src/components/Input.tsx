import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`ae-input-group${error ? ' ae-input-group--error' : ''}${className ? ` ${className}` : ''}`}>
      {label ? (
        <label className="ae-input-group__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        {...props}
        id={inputId}
        className="ae-input"
        aria-describedby={
          [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined
        }
        aria-invalid={error ? true : undefined}
      />
      {error ? (
        <p id={`${inputId}-error`} className="ae-input-group__error" role="alert">
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="ae-input-group__hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
