import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export function Card({ header, footer, children, className = '', ...props }: CardProps) {
  return (
    <article className={`ae-card${className ? ` ${className}` : ''}`} {...props}>
      {header ? <header className="ae-card__header">{header}</header> : null}
      <div className="ae-card__body">{children}</div>
      {footer ? <footer className="ae-card__footer">{footer}</footer> : null}
    </article>
  )
}
