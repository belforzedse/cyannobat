export const isValidIranNationalId = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false
  }

  const normalized = value.trim()

  if (!/^\d{10}$/.test(normalized)) {
    return false
  }

  if (/^(\d)\1{9}$/.test(normalized)) {
    return false
  }

  const checkDigit = Number(normalized[9])
  const sum = normalized
    .slice(0, 9)
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (10 - index), 0)

  const remainder = sum % 11

  if (remainder < 2) {
    return checkDigit === remainder
  }

  return checkDigit === 11 - remainder
}
