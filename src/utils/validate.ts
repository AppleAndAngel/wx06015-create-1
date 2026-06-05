const phoneRegex = /^1[3-9]\d{9}$/

export function isPhone(phone: string): boolean {
  return phoneRegex.test(phone)
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0
}
