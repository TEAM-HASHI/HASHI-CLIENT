export const normalizeDigits = (value: string) => {
  return value.replace(/\D/g, '')
}

export const formatBirthDateInput = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 8)
  const year = digits.slice(0, 4)
  const month = digits.slice(4, 6)
  const day = digits.slice(6, 8)

  return [year, month, day].filter(Boolean).join('/')
}

export const formatPhoneNumberInput = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 11)

  if (digits.startsWith('02')) {
    if (digits.length <= 2) {
      return digits
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`
    }

    return `${digits.slice(0, 2)}-${digits.slice(2, digits.length - 4)}-${digits.slice(-4)}`
  }

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`
}

export const checkIsValidBirthDate = (value: string) => {
  const digits = normalizeDigits(value)

  if (digits.length !== 8) {
    return false
  }

  const year = Number(digits.slice(0, 4))
  const month = Number(digits.slice(4, 6))
  const day = Number(digits.slice(6, 8))
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export const checkIsValidPhoneNumber = (value: string) => {
  const digits = normalizeDigits(value)

  if (digits.startsWith('02')) {
    return digits.length === 9 || digits.length === 10
  }

  return digits.length === 10 || digits.length === 11
}

export const checkIsValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
