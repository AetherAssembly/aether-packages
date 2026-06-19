import { useEffect, useRef, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className={`ae-modal${className ? ` ${className}` : ''}`}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <div className="ae-modal__content">
        {title ? (
          <header className="ae-modal__header">
            <h2 className="ae-modal__title">{title}</h2>
            <button
              type="button"
              className="ae-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </header>
        ) : null}
        <div className="ae-modal__body">{children}</div>
      </div>
    </dialog>
  )
}
