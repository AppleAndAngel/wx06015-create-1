const cacheMap = new Map<string, { data: any; timestamp: number }>()

export function useCache() {
  function getCachedData(key: string, maxAge: number = 300000): any | null {
    const entry = cacheMap.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > maxAge) {
      cacheMap.delete(key)
      return null
    }
    return entry.data
  }

  function setCachedData(key: string, data: any): void {
    cacheMap.set(key, { data, timestamp: Date.now() })
  }

  return {
    cacheMap,
    getCachedData,
    setCachedData,
  }
}
