import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '../../lib/rateLimit'

// Webhook Apps Script & token disimpan di server (env var Vercel),
// tidak pernah dikirim ke browser.
const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL
const SHEET_WEBHOOK_TOKEN       = process.env.SHEET_WEBHOOK_TOKEN

const MAX_TEXT = 80

function bersih(s) {
  return String(s ?? '').trim().slice(0, MAX_TEXT)
}

export async function POST(request) {
  // ── Rate limit per-IP ──
  const ip = getClientIp(request)
  const rl = rateLimit(`simpan-hasil:${ip}`, { limit: 10, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json({ status: 'error', error: 'Terlalu banyak permintaan.' }, { status: 429 })
  }

  if (!SHEET_WEBHOOK_URL || !SHEET_WEBHOOK_TOKEN) {
    return NextResponse.json({ status: 'error', error: 'Penyimpanan hasil belum dikonfigurasi (env SHEET_WEBHOOK_URL/SHEET_WEBHOOK_TOKEN).' }, { status: 503 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ status: 'error', error: 'Body tidak valid' }, { status: 400 })
  }

  // ── Validasi input ──
  const nim   = bersih(body.nim)
  const nama  = bersih(body.nama)
  const kelas = bersih(body.kelas)
  const form  = body.form === 'pre' || body.form === 'post' ? body.form : null
  const skor  = Number(body.skor)
  const maks  = Number(body.maks)
  const perDim = body.perDim && typeof body.perDim === 'object' ? body.perDim : {}

  if (!nim || !nama || !form) {
    return NextResponse.json({ status: 'error', error: 'Nama, NIM, dan jenis tes wajib diisi.' }, { status: 400 })
  }
  if (!Number.isInteger(skor) || skor < 0 || skor > 25 || maks !== 25) {
    return NextResponse.json({ status: 'error', error: 'Skor tidak valid.' }, { status: 400 })
  }

  const payload = {
    token: SHEET_WEBHOOK_TOKEN,
    nim, nama, kelas, form, skor, maks,
    ail1: Number(perDim.AIL1) || 0,
    ail2: Number(perDim.AIL2) || 0,
    ail3: Number(perDim.AIL3) || 0,
    ail4: Number(perDim.AIL4) || 0,
    jawaban: JSON.stringify(Array.isArray(body.jawaban) ? body.jawaban.slice(0, 25) : []),
  }

  try {
    const res = await fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Apps Script bisa lambat saat cold start
      signal: AbortSignal.timeout(20_000),
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = { status: 'ok' } }
    return NextResponse.json(data)
  } catch (err) {
    console.error('simpan-hasil error:', err.message)
    return NextResponse.json({ status: 'error', error: 'Gagal menyimpan hasil, coba lagi.' }, { status: 502 })
  }
}
