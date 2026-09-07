'use client'

// ============================================================
// Lab Uji Batas Model
// Mahasiswa menabrak batas model secara terukur: satu foto diberi
// transformasi terkendali, lalu dilihat pada titik mana prediksinya patah
// atau penolakan OOD menyala (ambang: confidence < 72%, entropi > 1,50).
//
// BEDA dari Lab Blockchain & Lab Konvolusi: lab ini MEMANGGIL model,
// jadi tiap pengujian memakai satu panggilan ke Hugging Face Space.
// Karena itu sengaja SATU transformasi per tombol, bukan borongan.
// ============================================================
import { useState, useRef } from 'react'
import { klasifikasiFile } from './lib/klasifikasiHF'

const AMBANG_CONF = 72      // %  — CONFIDENCE_THRESHOLD 0.72 di app.py
const AMBANG_ENTROPI = 1.50 // ln — ENTROPY_THRESHOLD di app.py
const ENT_ID = AMBANG_ENTROPI.toFixed(2).replace('.', ',')  // "1,50"
const ENT_EN = AMBANG_ENTROPI.toFixed(2)                     // "1.50"
const SISI = 512            // semua citra disamakan ukurannya agar adil

const TRANSFORMASI = [
  { id: 'putar15',  emoji: '🔄' },
  { id: 'putar90',  emoji: '🔃' },
  { id: 'buram',    emoji: '💨' },
  { id: 'potong',   emoji: '🔍' },
  { id: 'gelap',    emoji: '🌑' },
  { id: 'derau',    emoji: '🌫️' },
  { id: 'abu',      emoji: '⬜' },
  { id: 'cermin',   emoji: '🪞' },
]

const CH = {
  id: {
    title: '🧪 Lab Uji Batas Model — Cari Titik Patahnya',
    sub: 'Model punya batas. Lab ini membuatmu menemukannya sendiri: satu foto diubah secara terukur, lalu diamati pada perubahan seperti apa model mulai keliru atau menolak.',
    intro: 'Klasifikasi yang benar belum tentu berarti model paham. Cara menguji pemahaman sebuah model adalah dengan mengusiknya. Di sini kamu akan memutar, memburamkan, memotong, dan menggelapkan foto yang sama — lalu mencatat apa yang terjadi pada keyakinan dan entropinya.',
    caraHead: '📖 Cara memakai lab ini — lima langkah',
    cara: [
      'Unggah satu foto biji kopi. Semua citra otomatis diseragamkan ke 512 piksel agar perbandingannya adil.',
      'Tekan "Uji Baseline" lebih dulu. Tanpa baseline, tidak ada pembanding.',
      'Pilih satu transformasi, lalu tekan tombolnya. Setiap penekanan menambah satu baris ke tabel.',
      'Perhatikan baris yang ditandai merah — di situlah prediksi patah atau model menolak.',
      'Setelah beberapa pengujian, jawab pertanyaan kesimpulan di bawah lalu unduh atau salin hasilnya.',
    ],
    hematHead: '⚠️ Hemat pemakaian',
    hemat: 'Berbeda dari Lab Blockchain dan Lab Konvolusi yang berjalan penuh di peramban, lab ini memanggil model sungguhan. Satu pengujian sama dengan satu panggilan. Untuk kelas besar, sebaiknya diperagakan dosen atau dikerjakan berkelompok.',
    ambangHead: 'Ambang penolakan model',
    ambangTxt: `Model menolak citra bila keyakinan tertinggi di bawah ${AMBANG_CONF}% atau entropi di atas ${ENT_ID} (maksimum untuk 6 kelas adalah 1,791). Cobalah membuat model menabrak salah satunya.`,
    unggah: '📁 Pilih foto biji kopi',
    gantiFoto: '🔁 Ganti foto',
    baseline: '▶️ Uji Baseline (foto asli)',
    baselineAda: '✓ Baseline sudah diuji',
    pilihDulu: 'Unggah foto terlebih dahulu.',
    baselineDulu: 'Uji baseline dulu sebelum menguji transformasi.',
    memproses: 'Memproses…',
    tahap: { unggah: 'Mengunggah citra…', kirim: 'Mengirim ke model…', tunggu: 'Menunggu hasil…', olah: 'Menyiapkan citra…' },
    trafoHead: 'Transformasi terukur — tekan salah satu',
    trafo: {
      putar15: 'Putar 15°', putar90: 'Putar 90°', buram: 'Buramkan', potong: 'Potong & perbesar',
      gelap: 'Gelapkan', derau: 'Tambah derau', abu: 'Jadikan keabuan', cermin: 'Cerminkan',
    },
    pratinjauAsli: 'Citra dasar (512 px)', pratinjauUbah: 'Citra setelah transformasi',
    tabelHead: 'Tabel hasil pengujian',
    th: ['Uji', 'Prediksi', 'Keyakinan', 'Entropi', 'Status'],
    statusSama: 'Tetap', statusBeda: 'PATAH', statusTolak: 'DITOLAK',
    kosongTabel: 'Belum ada pengujian. Mulai dari baseline.',
    baselineTolak: '⚠️ Baseline-mu DITOLAK model, jadi foto ini berada di luar cakupan dan tidak bisa dipakai sebagai pembanding. Ganti dengan foto biji kopi yang dikenali model, lalu uji baseline lagi. (Kalau memang ingin menguji citra di luar cakupan, ini sendiri sudah temuan menarik — catat di kesimpulan.)',
    ringkasHead: 'Ringkasan',
    ringkas: (n, patah, tolak) => `${n} pengujian · ${patah} prediksi patah · ${tolak} ditolak model`,
    simpulHead: '✍️ Kesimpulanmu',
    s1: 'Transformasi mana yang paling merusak prediksi? Menurutmu mengapa transformasi itu paling berpengaruh?',
    s2: 'Adakah transformasi yang hampir tidak berpengaruh? Apa artinya tentang cara model mengenali biji kopi?',
    s3: 'Saat model menolak citra, apakah penyebabnya keyakinan yang jatuh atau entropi yang melonjak? Apa bedanya?',
    phS: 'Tulis jawabanmu di sini…',
    unduh: '⬇️ Unduh Hasil (HTML)', salin: '📋 Salin Hasil', reset: '↩️ Kosongkan',
    tersalin: '✓ Tersalin! Tempel di Google Classroom atau WhatsApp.',
    gagalSalin: 'Gagal menyalin. Pakai tombol unduh saja.',
    belumCukup: 'Lakukan minimal baseline dan satu transformasi, lalu isi salah satu kesimpulan.',
    galat: 'Gagal menghubungi model. Coba lagi sebentar — Space mungkin sedang bangun dari tidur.',
    docJudul: 'Lab Uji Batas Model — Hasil Pengujian',
    docSub: 'Klasifikasi Kopi Arabika berbasis CNN & Blockchain · Universitas Jember',
    docWaktu: 'Waktu pengerjaan', nama: 'Nama', nim: 'NIM',
    phNama: 'Nama sesuai daftar hadir', phNim: 'Contoh: 210210102001',
  },
  en: {
    title: '🧪 Model Boundary Lab — Find Where It Breaks',
    sub: 'Every model has limits. This lab lets you find them yourself: one photo is altered in measured ways, and you observe at which point the model starts to fail or refuse.',
    intro: 'A correct classification does not prove understanding. The way to test a model is to disturb it. Here you will rotate, blur, crop and darken the same photo — then record what happens to its confidence and entropy.',
    caraHead: '📖 How to use this lab — five steps',
    cara: [
      'Upload one coffee bean photo. Every image is normalised to 512 pixels so the comparison stays fair.',
      'Press "Test Baseline" first. Without a baseline there is nothing to compare against.',
      'Pick one transformation and press its button. Each press adds one row to the table.',
      'Watch for rows marked red — that is where the prediction breaks or the model refuses.',
      'After several tests, answer the conclusion questions below, then download or copy your results.',
    ],
    hematHead: '⚠️ Use sparingly',
    hemat: 'Unlike the Blockchain and Convolution labs which run entirely in the browser, this lab calls the real model. One test equals one call. For large classes, demonstrate it from the front or have students work in groups.',
    ambangHead: 'Model rejection thresholds',
    ambangTxt: `The model refuses an image when the top confidence falls below ${AMBANG_CONF}% or the entropy rises above ${ENT_EN} (the maximum for 6 classes is 1.791). Try to make the model hit one of them.`,
    unggah: '📁 Choose a coffee bean photo',
    gantiFoto: '🔁 Change photo',
    baseline: '▶️ Test Baseline (original photo)',
    baselineAda: '✓ Baseline tested',
    pilihDulu: 'Please upload a photo first.',
    baselineDulu: 'Test the baseline before testing transformations.',
    memproses: 'Processing…',
    tahap: { unggah: 'Uploading image…', kirim: 'Sending to model…', tunggu: 'Waiting for result…', olah: 'Preparing image…' },
    trafoHead: 'Measured transformations — press one',
    trafo: {
      putar15: 'Rotate 15°', putar90: 'Rotate 90°', buram: 'Blur', potong: 'Crop & zoom',
      gelap: 'Darken', derau: 'Add noise', abu: 'Greyscale', cermin: 'Mirror',
    },
    pratinjauAsli: 'Base image (512 px)', pratinjauUbah: 'Image after transformation',
    tabelHead: 'Test results table',
    th: ['Test', 'Prediction', 'Confidence', 'Entropy', 'Status'],
    statusSama: 'Same', statusBeda: 'BROKE', statusTolak: 'REFUSED',
    kosongTabel: 'No tests yet. Start with the baseline.',
    baselineTolak: '⚠️ Your baseline was REFUSED by the model, so this photo is out of scope and cannot serve as a reference. Use a coffee bean photo the model recognises, then test the baseline again. (If you meant to test an out-of-scope image, that is itself an interesting finding — note it in your conclusions.)',
    ringkasHead: 'Summary',
    ringkas: (n, patah, tolak) => `${n} tests · ${patah} predictions broke · ${tolak} refused by the model`,
    simpulHead: '✍️ Your conclusions',
    s1: 'Which transformation damaged the prediction most? Why do you think it had the strongest effect?',
    s2: 'Was there a transformation with almost no effect? What does that say about how the model recognises beans?',
    s3: 'When the model refused an image, was it because confidence fell or entropy rose? What is the difference?',
    phS: 'Write your answer here…',
    unduh: '⬇️ Download Results (HTML)', salin: '📋 Copy Results', reset: '↩️ Clear',
    tersalin: '✓ Copied! Paste it into Google Classroom or WhatsApp.',
    gagalSalin: 'Copy failed. Please use the download button instead.',
    belumCukup: 'Run at least the baseline and one transformation, then answer one conclusion.',
    galat: 'Could not reach the model. Try again shortly — the Space may be waking up.',
    docJudul: 'Model Boundary Lab — Test Results',
    docSub: 'CNN & Blockchain-based Arabica Coffee Classification · University of Jember',
    docWaktu: 'Completed at', nama: 'Name', nim: 'Student ID',
    phNama: 'Name as on the attendance list', phNim: 'e.g. 210210102001',
  },
}

// Gambar ke kanvas berukuran sama untuk semua uji, lalu terapkan transformasi
async function olahCitra(imgSrc, jenis) {
  const img = await new Promise((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = imgSrc
  })
  const cv = document.createElement('canvas')
  cv.width = cv.height = SISI
  const cx = cv.getContext('2d')
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, SISI, SISI)

  const gambarDasar = (ctx) => {
    // muat gambar utuh ke dalam kotak SISI×SISI tanpa merusak rasio
    const r = Math.min(SISI / img.width, SISI / img.height)
    const w = img.width * r, h = img.height * r
    ctx.drawImage(img, (SISI - w) / 2, (SISI - h) / 2, w, h)
  }

  if (jenis === 'putar15' || jenis === 'putar90') {
    const deg = jenis === 'putar15' ? 15 : 90
    cx.translate(SISI / 2, SISI / 2); cx.rotate(deg * Math.PI / 180); cx.translate(-SISI / 2, -SISI / 2)
    gambarDasar(cx)
  } else if (jenis === 'buram') {
    cx.filter = 'blur(6px)'; gambarDasar(cx); cx.filter = 'none'
  } else if (jenis === 'gelap') {
    cx.filter = 'brightness(0.35)'; gambarDasar(cx); cx.filter = 'none'
  } else if (jenis === 'abu') {
    cx.filter = 'grayscale(1)'; gambarDasar(cx); cx.filter = 'none'
  } else if (jenis === 'cermin') {
    cx.translate(SISI, 0); cx.scale(-1, 1); gambarDasar(cx)
  } else if (jenis === 'potong') {
    // ambil 40% bagian tengah lalu perbesar memenuhi kanvas
    const s = Math.min(img.width, img.height) * 0.4
    cx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, SISI, SISI)
  } else {
    gambarDasar(cx)
    if (jenis === 'derau') {
      const im = cx.getImageData(0, 0, SISI, SISI)
      for (let i = 0; i < im.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 130
        im.data[i] = Math.max(0, Math.min(255, im.data[i] + n))
        im.data[i + 1] = Math.max(0, Math.min(255, im.data[i + 1] + n))
        im.data[i + 2] = Math.max(0, Math.min(255, im.data[i + 2] + n))
      }
      cx.putImageData(im, 0, 0)
    }
  }
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92))
  return { blob, url: cv.toDataURL('image/jpeg', 0.8) }
}

export default function LabBatas({ lang }) {
  const c = CH[lang] || CH.id
  const [imgSrc, setImgSrc] = useState('')
  const [dasarUrl, setDasarUrl] = useState('')
  const [ubahUrl, setUbahUrl] = useState('')
  const [baris, setBaris] = useState([])
  const [sibuk, setSibuk] = useState('')
  const [pesan, setPesan] = useState('')
  const [salinOk, setSalinOk] = useState(null)
  const [nama, setNama] = useState('')
  const [nim, setNim] = useState('')
  const [s1, setS1] = useState(''); const [s2, setS2] = useState(''); const [s3, setS3] = useState('')
  const fileRef = useRef(null)

  const baseline = baris.find(b => b.id === 'baseline')

  function pilihFoto(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const fr = new FileReader()
    fr.onload = async () => {
      setImgSrc(String(fr.result)); setBaris([]); setUbahUrl(''); setPesan('')
      try { const { url } = await olahCitra(String(fr.result), 'asli'); setDasarUrl(url) } catch (_) {}
    }
    fr.readAsDataURL(f)
  }

  async function uji(jenis) {
    if (!imgSrc) { setPesan(c.pilihDulu); return }
    if (jenis !== 'baseline' && !baseline) { setPesan(c.baselineDulu); return }
    setPesan(''); setSalinOk(null); setSibuk(c.tahap.olah)
    try {
      const { blob, url } = await olahCitra(imgSrc, jenis === 'baseline' ? 'asli' : jenis)
      if (jenis !== 'baseline') setUbahUrl(url); else setDasarUrl(url)
      const file = new File([blob], `uji-${jenis}.jpg`, { type: 'image/jpeg' })
      const r = await klasifikasiFile(file, (t) => setSibuk(c.tahap[t] || c.memproses))
      const nama = jenis === 'baseline' ? 'Baseline' : c.trafo[jenis]
      setBaris(prev => [...prev.filter(b => !(jenis === 'baseline' && b.id === 'baseline')), {
        id: jenis, nama,
        jenis: r.bukanKopi ? null : r.jenis,
        confidence: r.confidence || 0,
        entropy: r.entropy,
        ditolak: !!r.bukanKopi,
      }])
    } catch (err) {
      setPesan(c.galat + ' (' + String(err.message).slice(0, 60) + ')')
    } finally { setSibuk('') }
  }

  function statusBaris(b) {
    if (b.ditolak) return 'tolak'
    if (b.id === 'baseline') return 'dasar'
    if (!baseline || baseline.ditolak) return 'dasar'
    return b.jenis === baseline.jenis ? 'sama' : 'beda'
  }

  const jmlPatah = baris.filter(b => statusBaris(b) === 'beda').length
  const jmlTolak = baris.filter(b => b.ditolak).length
  const cukup = baris.length >= 2 && (s1.trim() || s2.trim() || s3.trim())

  function teksHasil() {
    const L = [c.docJudul, c.docSub, '',
      `${c.nama}: ${nama || '-'}`, `${c.nim}: ${nim || '-'}`,
      `${c.docWaktu}: ${new Date().toLocaleString(lang === 'en' ? 'en-GB' : 'id-ID')}`, '',
      `${c.ambangHead}: confidence < ${AMBANG_CONF}% ${lang === 'en' ? 'or' : 'atau'} ${lang === 'en' ? 'entropy' : 'entropi'} > ${lang === 'en' ? ENT_EN : ENT_ID}`, '',
      '--- ' + c.tabelHead.toUpperCase() + ' ---']
    baris.forEach(b => {
      const st = statusBaris(b)
      L.push(`${b.nama} | ${b.ditolak ? '(ditolak)' : b.jenis} | ${b.confidence.toFixed(1)}% | ${b.entropy != null ? b.entropy.toFixed(3) : '-'} | ${st === 'beda' ? c.statusBeda : st === 'tolak' ? c.statusTolak : c.statusSama}`)
    })
    L.push('', c.ringkas(baris.length, jmlPatah, jmlTolak), '', '--- ' + c.simpulHead.toUpperCase() + ' ---')
    L.push(`1. ${c.s1}`, s1 || '-', `2. ${c.s2}`, s2 || '-', `3. ${c.s3}`, s3 || '-')
    return L.join('\n')
  }

  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  function html() {
    const rows = baris.map(b => {
      const st = statusBaris(b)
      const warna = st === 'beda' ? '#fee2e2' : st === 'tolak' ? '#fef3c7' : 'transparent'
      return `<tr style="background:${warna}"><td>${esc(b.nama)}</td><td>${esc(b.ditolak ? '(ditolak model)' : b.jenis)}</td>
        <td style="text-align:right">${b.confidence.toFixed(1)}%</td>
        <td style="text-align:right">${b.entropy != null ? b.entropy.toFixed(3) : '-'}</td>
        <td><b>${esc(st === 'beda' ? c.statusBeda : st === 'tolak' ? c.statusTolak : c.statusSama)}</b></td></tr>`
    }).join('')
    const jw = (n, q, a) => `<div class="q"><b>${n}. ${esc(q)}</b><p>${esc(a || '-').replace(/\n/g, '<br>')}</p></div>`
    return `<!doctype html><html lang="${lang === 'en' ? 'en' : 'id'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.docJudul)} — ${esc(nama)}</title>
<style>body{font-family:Georgia,serif;max-width:820px;margin:32px auto;padding:0 22px;color:#1a1a1a;line-height:1.65}
h1{font-size:21px;color:#1F3864;margin:0 0 4px}h2{font-size:15px;color:#1F3864;margin:24px 0 8px;border-bottom:2px solid #DEEAF6;padding-bottom:5px}
.sub{color:#666;font-size:13px;margin:0 0 18px}table{border-collapse:collapse;width:100%;margin:8px 0;font-size:13px}
th,td{border:1px solid #cbd5e1;padding:7px 10px;text-align:left}th{background:#f2f6fb;font-weight:700}
.q{margin:12px 0}.q p{margin:5px 0 0;padding:9px 11px;background:#fafbfd;border-left:3px solid #1F3864;white-space:pre-wrap;font-size:13.5px}
.note{font-size:12.5px;color:#555;background:#f8fafc;padding:9px 12px;border-radius:6px}
@media print{body{margin:0}}</style></head><body>
<h1>${esc(c.docJudul)}</h1><p class="sub">${esc(c.docSub)}</p>
<table><tr><th>${esc(c.nama)}</th><td>${esc(nama || '-')}</td></tr><tr><th>${esc(c.nim)}</th><td>${esc(nim || '-')}</td></tr>
<tr><th>${esc(c.docWaktu)}</th><td>${esc(new Date().toLocaleString(lang === 'en' ? 'en-GB' : 'id-ID'))}</td></tr></table>
<p class="note">${esc(c.ambangTxt)}</p>
<h2>${esc(c.tabelHead)}</h2>
<table><tr>${c.th.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${rows}</table>
<p><b>${esc(c.ringkasHead)}:</b> ${esc(c.ringkas(baris.length, jmlPatah, jmlTolak))}</p>
<h2>${esc(c.simpulHead)}</h2>${jw(1, c.s1, s1)}${jw(2, c.s2, s2)}${jw(3, c.s3, s3)}
</body></html>`
  }

  function unduh() {
    if (!cukup) { setPesan(c.belumCukup); return }
    setPesan('')
    const blob = new Blob([html()], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `UjiBatas-${(nim || 'hasil').replace(/[^\w-]/g, '')}-${new Date().toISOString().slice(0, 10)}.html`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  async function salin() {
    if (!cukup) { setPesan(c.belumCukup); return }
    setPesan('')
    try { await navigator.clipboard.writeText(teksHasil()); setSalinOk(true) }
    catch (_) { setSalinOk(false) }
    setTimeout(() => setSalinOk(null), 5000)
  }

  return (
    <div className="card learn-card">
      <h4 className="learn-h">{c.title}</h4>
      <p className="learn-p">{c.sub}</p>
      <div className="bc-intro">{c.intro}</div>

      <details className="gloss bc-guide" open>
        <summary>{c.caraHead}</summary>
        <ol className="bc-steps">{c.cara.map((x, i) => <li key={i}>{x}</li>)}</ol>
      </details>

      <div className="ub-hemat">
        <b>{c.hematHead}</b>
        <p>{c.hemat}</p>
      </div>
      <div className="kv-catatan">
        <b className="learn-sub-h">{c.ambangHead}</b>
        <p className="learn-p" style={{ marginBottom: 0 }}>{c.ambangTxt}</p>
      </div>

      {/* Identitas ringkas */}
      <div className="lkpd-id" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: 14 }}>
        <label>{c.nama}<input value={nama} placeholder={c.phNama} onChange={e => setNama(e.target.value)} /></label>
        <label>{c.nim}<input value={nim} placeholder={c.phNim} onChange={e => setNim(e.target.value)} /></label>
      </div>

      {/* Foto */}
      <div className="lkpd-blok">
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pilihFoto} />
        <button className="btn btn-ghost" style={{ maxWidth: 260 }} onClick={() => fileRef.current?.click()}>
          {imgSrc ? c.gantiFoto : c.unggah}
        </button>
        {dasarUrl && (
          <div className="ub-foto">
            <figure><img src={dasarUrl} alt="dasar" /><figcaption>{c.pratinjauAsli}</figcaption></figure>
            {ubahUrl && <figure><img src={ubahUrl} alt="ubah" /><figcaption>{c.pratinjauUbah}</figcaption></figure>}
          </div>
        )}
      </div>

      {/* Baseline + transformasi */}
      <div className="lkpd-blok">
        <button className="btn btn-primary" style={{ maxWidth: 300 }} disabled={!!sibuk || !imgSrc}
          onClick={() => uji('baseline')}>
          {baseline ? c.baselineAda : c.baseline}
        </button>
        <b className="learn-sub-h" style={{ display: 'block', marginTop: 16 }}>{c.trafoHead}</b>
        <div className="kv-kernel-pilih">
          {TRANSFORMASI.map(t => (
            <button key={t.id} className="kv-chip" disabled={!!sibuk || !baseline}
              onClick={() => uji(t.id)}>{t.emoji} {c.trafo[t.id]}</button>
          ))}
        </div>
        {sibuk && <p className="bc-busy">{sibuk}</p>}
        {pesan && <p className="lkpd-warn">{pesan}</p>}
      </div>

      {/* Tabel hasil */}
      <div className="lkpd-blok">
        <b className="learn-sub-h">{c.tabelHead}</b>
        {baseline && baseline.ditolak && <p className="lkpd-warn">{c.baselineTolak}</p>}
        {baris.length === 0 ? <p className="learn-note">{c.kosongTabel}</p> : (
          <>
            <div className="ub-scroll">
              <table className="ub-tabel">
                <thead><tr>{c.th.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                <tbody>
                  {baris.map((b, i) => {
                    const st = statusBaris(b)
                    return (
                      <tr key={i} className={`ub-${st}`}>
                        <td>{b.nama}</td>
                        <td>{b.ditolak ? '—' : b.jenis}</td>
                        <td>{b.confidence.toFixed(1)}%</td>
                        <td>{b.entropy != null ? b.entropy.toFixed(3) : '—'}</td>
                        <td><b>{st === 'beda' ? c.statusBeda : st === 'tolak' ? c.statusTolak : c.statusSama}</b></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="ub-ringkas">{c.ringkas(baris.length, jmlPatah, jmlTolak)}</p>
          </>
        )}
      </div>

      {/* Kesimpulan */}
      <div className="lkpd-blok">
        <b className="learn-sub-h">{c.simpulHead}</b>
        {[[c.s1, s1, setS1], [c.s2, s2, setS2], [c.s3, s3, setS3]].map(([q, v, set], i) => (
          <div key={i}>
            <label className="lkpd-lbl">{i + 1}. {q}</label>
            <textarea className="lkpd-input" rows={3} value={v} placeholder={c.phS} onChange={e => set(e.target.value)} />
          </div>
        ))}
      </div>

      {salinOk === true && <p className="lkpd-ok">{c.tersalin}</p>}
      {salinOk === false && <p className="lkpd-warn">{c.gagalSalin}</p>}
      <div className="lkpd-aksi">
        <button className="btn btn-primary" onClick={unduh}>{c.unduh}</button>
        <button className="btn btn-ghost" onClick={salin}>{c.salin}</button>
        <button className="btn btn-ghost" onClick={() => { setBaris([]); setUbahUrl(''); setPesan(''); setS1(''); setS2(''); setS3('') }}>{c.reset}</button>
      </div>
    </div>
  )
}
