import { useEffect, useId, useRef, type ComponentPropsWithoutRef } from 'react'

export type ModalProps = Omit<
  ComponentPropsWithoutRef<'dialog'>,
  'open' | 'onClose' | 'title'
> & {
  open: boolean
  /** Requests that the owner set open=false. Prop-driven closing does not notify. */
  onClose: () => void
  title?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  onCancel,
  onClick,
  ...props
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const requested = useRef(false)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    requested.current = false
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])
  const requestClose = () => {
    if (!requested.current) {
      requested.current = true
      onClose()
    }
  }
  return (
    <dialog
      {...props}
      ref={dialogRef}
      className={`ae-modal${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel ?? (!title && !labelledBy ? 'Dialog' : undefined)}
      aria-labelledby={
        labelledBy ?? (title && !ariaLabel ? titleId : undefined)
      }
      onCancel={(event) => {
        onCancel?.(event)
        if (!event.defaultPrevented) {
          event.preventDefault()
          requestClose()
        }
      }}
      onClose={() => {
        if (open) requestClose()
      }}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && event.target === dialogRef.current) {
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            requestClose()
        }
      }}
    >
      <div className="ae-modal__content">
        <header className="ae-modal__header">
          {title ? (
            <h2 id={titleId} className="ae-modal__title">
              {title}
            </h2>
          ) : null}
          <button
            type="button"
            className="ae-modal__close"
            onClick={requestClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="ae-modal__body">{children}</div>
      </div>
    </dialog>
  )
}
