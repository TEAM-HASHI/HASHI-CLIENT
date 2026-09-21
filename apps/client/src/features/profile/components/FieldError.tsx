interface FieldErrorProps {
  id: string
  message?: string
}

export const FieldError = ({ id, message }: FieldErrorProps) => {
  if (!message) {
    return null
  }

  return (
    <p className="typo-body-7 text-error mt-2.25" id={id} role="alert">
      {message}
    </p>
  )
}
