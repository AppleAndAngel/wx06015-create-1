export function getItem<T>(key: string): T | null {
  const value = localStorage.getItem(key)
  if (value === null) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function setItem(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key: string): void {
  localStorage.removeItem(key)
}
