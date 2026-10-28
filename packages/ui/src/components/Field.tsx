import { useId, type ReactNode } from 'react'

export type FieldProps = {
  id?: string | undefined
  label?: string | undefined
  error?: string | undefined
  hint?: string | undefined
  className?: string | undefined
  children:
    | ReactNode
    | ((attributes: {
        id: string
        'aria-describedby': string | undefined
        'aria-invalid': true | undefined
      }) => ReactNode)
}

export function Field({
  id,
  label,
  error,
  hint,
  className = '',
  children,
}: FieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const attributes = {
    id: fieldId,
    'aria-describedby': error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined,
    'aria-invalid': error ? (true as const) : undefined,
  }
  return (
    <div
      className={`ae-input-group${error ? ' ae-input-group--error' : ''}${className ? ` ${className}` : ''}`}
    >
      {label ? (
        <label className="ae-input-group__label" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      {typeof children === 'function' ? children(attributes) : children}
      {error ? (
        <p
          id={`${fieldId}-error`}
          className="ae-input-group__error"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="ae-input-group__hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
