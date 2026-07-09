interface FieldErrorProps {
  id: string
  message?: string
}

export const FieldError = ({ id, message }: FieldErrorProps) => {
  if (!message) {
    return null
  }

  return (
    <p className="typo-body-3 text-error mt-3" id={id} role="alert">
      {message}
    </p>
  )
}
