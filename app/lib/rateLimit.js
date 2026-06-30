// Rate limiter sederhana berbasis memori per-instance.
// Catatan: pada Vercel serverless, tiap instance punya memori sendiri dan
// bisa reset saat cold start — ini lapisan pertahanan pertama (lightweight),
// bukan pengganti rate limiting terpusat (mis. Upstash/Vercel KV) untuk skala besar.

const buckets = new Map()

export function rateLimit(key, { limit = 8, windowMs = 60_000 } = {}) {
  const now = Date.now()

  // Bersihkan entri kedaluwarsa sesekali agar memori tidak terus bertambah
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (now - v.start > windowMs) buckets.delete(k)
    }
  }

  const entry = buckets.get(key)
  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { start: now, count: 1 })
    return { ok: true, remaining: limit - 1 }
  }

  entry.count++
  if (entry.count > limit) {
    return { ok: false, remaining: 0 }
  }
  return { ok: true, remaining: limit - entry.count }
}

export function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}
