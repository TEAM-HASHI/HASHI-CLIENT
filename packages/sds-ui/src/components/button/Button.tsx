import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>

export const Button = ({ children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>
}
