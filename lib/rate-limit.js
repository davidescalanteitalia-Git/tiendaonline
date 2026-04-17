const rateLimitMap = new Map()

export function checkRateLimit(ip, limit = 5, windowMs = 60 * 1000) {
  if (!ip || ip === 'unknown') return true // Fallback si no hay IP
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, timer: setTimeout(() => rateLimitMap.delete(ip), windowMs) })
    return true
  }
  
  const record = rateLimitMap.get(ip)
  if (record.count >= limit) {
    return false
  }
  
  record.count += 1
  return true
}
