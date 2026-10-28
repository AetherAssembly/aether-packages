import type { ComponentPropsWithRef } from 'react'
import { Field, type FieldProps } from './Field.js'

export type SelectProps = ComponentPropsWithRef<'select'> &
  Pick<FieldProps, 'label' | 'hint' | 'error'> & { wrapperClassName?: string }

export function Select({
  label,
  hint,
  error,
  id,
  className = '',
  wrapperClassName,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: SelectProps) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      className={wrapperClassName}
    >
      {(attributes) => (
        <select
          {...props}
          id={attributes.id}
          className={`ae-input${className ? ` ${className}` : ''}`}
          aria-describedby={
            [describedBy, attributes['aria-describedby']]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-invalid={error ? true : invalid}
        />
      )}
    </Field>
  )
}
