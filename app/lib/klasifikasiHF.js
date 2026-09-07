// ============================================================
// Pemanggil model klasifikasi di Hugging Face Space + pengurai keluarannya.
// Dipakai oleh Lab Uji Batas Model.
//
// CATATAN: app/page.js punya salinan alur yang sama di dalam klasifikasiCNN().
// Sengaja TIDAK di-refactor agar alur klasifikasi utama yang sudah berjalan
// tidak tersentuh. Bila endpoint HF berubah, kedua tempat perlu disesuaikan.
// ============================================================

const BASE = 'https://jejenFis06-kopi-arabika-classifier.hf.space'

// Ambil pasangan "Nama : nilai%" dari keluaran teks model
export function ekstrakProbs(text) {
  if (!text) return []
  const out = []
  const seen = new Set()
  for (const line of text.split('\n')) {
    const m = line.match(/([A-Za-z][\w .()\-]+?)\s*:\s*([\d]+(?:\.[\d]+)?)\s*%/)
    if (!m) continue
    const name = m[1].trim().replace(/_/g, ' ')
    const val = parseFloat(m[2])
    if (isNaN(val)) continue
    if (/confidence|jenis\s*kopi|grade|akurasi|threshold|entropy|recall|alasan|test/i.test(name)) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ name, value: val })
  }
  return out.sort((a, b) => b.value - a.value)
}

// Entropi Shannon berbasis logaritma natural, seperti pada model (maks 6 kelas = ln 6)
export function hitungEntropi(probs) {
  if (!probs || probs.length < 2) return { entropy: null, uncertainty: null }
  const total = probs.reduce((s, p) => s + p.value, 0) || 1
  let H = 0
  for (const p of probs) {
    const pi = p.value / total
    if (pi > 0) H += -pi * Math.log(pi)
  }
  const maks = Math.log(probs.length)
  return { entropy: H, uncertainty: maks > 0 ? H / maks : null }
}

function uraiKeluaran(text) {
  if (!text || !text.trim()) return { bukanKopi: true, alasan: 'Keluaran kosong', raw: text }

  const tolak = /tidak dapat diklasifikasi|bukan biji kopi|non[-\s]?coffee|ditolak|rejected/i.test(text)
  const jenis = (text.match(/JENIS KOPI\s*:\s*(.+)/i)?.[1] || '').trim()
  const confidence = parseFloat(text.match(/CONFIDENCE\s*:\s*([\d.]+)%/i)?.[1]) || 0
  let grade = (text.match(/GRADE\s*:\s*([A-Za-z][A-Za-z\s]+)/i)?.[1] || '').replace(/[^\w\s]/g, '').trim()

  const probs = ekstrakProbs(text)
  const { entropy, uncertainty } = hitungEntropi(probs)

  if (tolak || (!jenis && confidence === 0)) {
    return { bukanKopi: true, alasan: 'Ditolak model (di luar cakupan)', confidence, probs, entropy, uncertainty, raw: text }
  }
  return { bukanKopi: false, jenis, confidence, grade: grade || '-', probs, entropy, uncertainty, raw: text }
}

// Kirim satu berkas gambar ke model, kembalikan hasil terurai.
// onStatus(teks) dipanggil di tiap tahap agar tampilan bisa memberi kabar.
export async function klasifikasiFile(file, onStatus) {
  onStatus && onStatus('unggah')
  const fd = new FormData()
  fd.append('files', file, file.name || 'uji.jpg')
  const up = await fetch(`${BASE}/gradio_api/upload`, { method: 'POST', body: fd })
  if (!up.ok) throw new Error(`Unggah gagal: ${up.status}`)
  const paths = await up.json()
  const path = paths?.[0]
  if (!path) throw new Error('Path berkas tidak ditemukan')

  onStatus && onStatus('kirim')
  const pr = await fetch(`${BASE}/gradio_api/call/klasifikasi_kopi`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [{ path, mime_type: file.type || 'image/jpeg', orig_name: file.name || 'uji.jpg' }] }),
  })
  if (!pr.ok) throw new Error(`Permintaan gagal: ${pr.status}`)
  const { event_id } = await pr.json()
  if (!event_id) throw new Error('event_id tidak ditemukan')

  onStatus && onStatus('tunggu')
  const res = await fetch(`${BASE}/gradio_api/call/klasifikasi_kopi/${event_id}`)
  if (!res.ok) throw new Error(`Hasil gagal: ${res.status}`)

  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let out = '', buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const raw = line.slice(5).trim()
      if (!raw || raw === '[DONE]') continue
      try {
        const p = JSON.parse(raw)
        if (Array.isArray(p)) {
          if (typeof p[0] === 'string' && p[0].length > 0) out = p[0]
          else if (p[0] && typeof p[0] === 'object') out = JSON.stringify(p[0])
        } else if (typeof p === 'string') out = p
      } catch (_) {}
    }
  }
  return uraiKeluaran(out)
}
