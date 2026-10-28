import type { ComponentPropsWithRef } from 'react'
import { Field, type FieldProps } from './Field.js'

export type CheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type'> &
  Pick<FieldProps, 'label' | 'hint' | 'error'> & { wrapperClassName?: string }

export function Checkbox({
  label,
  hint,
  error,
  id,
  className = '',
  wrapperClassName,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: CheckboxProps) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      className={wrapperClassName}
    >
      {(attributes) => (
        <input
          {...props}
          type="checkbox"
          id={attributes.id}
          className={`ae-checkbox${className ? ` ${className}` : ''}`}
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
