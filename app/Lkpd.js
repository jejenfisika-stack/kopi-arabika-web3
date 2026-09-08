'use client'

// ============================================================
// LKPD Digital berbasis Predict–Observe–Explain (POE)
// Hasil diunduh/disalin mahasiswa — TIDAK memerlukan webhook,
// Apps Script, maupun variabel lingkungan apa pun.
// Prinsip POE: prediksi WAJIB dikunci sebelum observasi terlihat.
// ============================================================
import { useState, useEffect } from 'react'

const VARIETAS = [
  'Arabika Peaberry',
  'Arabika Natural Ijen',
  'Arabika Anaerob Carbonic',
  'Arabika Orange Bourbon',
  'Arabica Blue Mountain',
  'Bukan biji kopi',
]

const CH = {
  id: {
    title: '📝 LKPD Digital — Predict · Observe · Explain',
    sub: 'Lembar kerja terpandu: tebak lebih dulu, baru amati, lalu jelaskan selisihnya. Jawabanmu diunduh sebagai berkas untuk dikumpulkan ke dosen.',
    aktifkan: 'Aktifkan Mode LKPD',
    matikan: 'Matikan Mode LKPD',
    hint: 'Saat mode LKPD aktif, tombol klasifikasi terkunci sampai kamu mengunci prediksimu. Ini disengaja — inti POE adalah menebak sebelum melihat.',
    idHead: '① Identitas',
    nama: 'Nama Lengkap', nim: 'NIM', kelas: 'Kelas / Rombel',
    phNama: 'Nama sesuai daftar hadir', phNim: 'Contoh: 210210102001', phKelas: 'Contoh: Pendidikan IPA A',
    predictHead: '② PREDICT — Tebak sebelum melihat hasil',
    predictSub: 'Amati foto biji kopi yang kamu unggah di atas, lalu jawab tanpa menjalankan klasifikasi terlebih dahulu.',
    pJenis: 'Menurutmu, apa jenis kopinya?',
    pYakin: 'Seberapa yakin kamu?',
    pAlasan: 'Apa alasanmu? Ciri visual apa yang kamu pakai?',
    phAlasan: 'Saya menebak begitu karena bentuk bijinya…',
    kunci: '🔒 Kunci Prediksi',
    kunciNote: 'Setelah dikunci, prediksi tidak bisa diubah lagi.',
    terkunci: '🔒 Prediksi terkunci',
    lanjut: '⬆️ Sekarang gulir ke atas dan tekan "Klasifikasi dengan CNN"',
    belumLengkap: 'Isi identitas, jenis kopi, dan alasan terlebih dahulu.',
    observeHead: '③ OBSERVE — Hasil pengamatan (diisi otomatis sistem)',
    observeKosong: 'Bagian ini akan terisi sendiri setelah kamu menjalankan klasifikasi.',
    oJenis: 'Jenis menurut model', oYakin: 'Tingkat keyakinan', oGrade: 'Grade',
    oEntropi: 'Entropi', oTidakPasti: 'Ketidakpastian', oProb: 'Distribusi probabilitas seluruh kelas',
    oGradcam: 'Peta Grad-CAM',
    bandingHead: 'Prediksimu versus hasil model',
    bTebak: 'Tebakanmu', bModel: 'Model',
    tepat: '✓ Tebakanmu TEPAT', meleset: '✗ Tebakanmu MELESET',
    explainHead: '④ EXPLAIN — Jelaskan',
    e1: 'Apakah tebakanmu sama dengan hasil model? Menurutmu mengapa demikian?',
    e2: 'Lihat peta Grad-CAM di atas. Bagian biji kopi mana yang paling memengaruhi keputusan model? Apakah masuk akal?',
    e3: 'Lihat nilai entropi dan distribusi probabilitas. Apakah model yakin atau ragu? Dari mana kamu tahu?',
    phE: 'Tulis jawabanmu di sini…',
    unduh: '⬇️ Unduh LKPD (HTML)',
    salin: '📋 Salin Jawaban',
    tersalin: '✓ Tersalin! Tempel di Google Classroom atau WhatsApp.',
    gagalSalin: 'Gagal menyalin. Pakai tombol unduh saja.',
    belumSelesai: 'Lengkapi prediksi, jalankan klasifikasi, dan isi minimal satu jawaban Explain.',
    unduhNote: 'Berkas HTML bisa dibuka di peramban mana pun dan ditekan Cetak untuk menjadi PDF. Di ponsel, tombol Salin biasanya lebih praktis.',
    draf: '💾 Jawabanmu tersimpan sementara di peramban ini.',
    reset: '↩️ Kosongkan LKPD',
    docJudul: 'LKPD Digital — Predict · Observe · Explain',
    docSub: 'Klasifikasi Kopi Arabika berbasis CNN & Blockchain · Universitas Jember',
    docWaktu: 'Waktu pengerjaan',
  },
  en: {
    title: '📝 Digital Worksheet — Predict · Observe · Explain',
    sub: 'A guided worksheet: predict first, then observe, then explain the gap. Your answers are downloaded as a file to submit to your lecturer.',
    aktifkan: 'Enable Worksheet Mode',
    matikan: 'Disable Worksheet Mode',
    hint: 'While worksheet mode is on, the classify button stays locked until you lock in your prediction. That is deliberate — the heart of POE is predicting before seeing.',
    idHead: '① Identity',
    nama: 'Full Name', nim: 'Student ID', kelas: 'Class / Group',
    phNama: 'Name as on the attendance list', phNim: 'e.g. 210210102001', phKelas: 'e.g. Science Education A',
    predictHead: '② PREDICT — Guess before seeing the result',
    predictSub: 'Look at the coffee bean photo you uploaded above, then answer without running the classification first.',
    pJenis: 'What coffee variety do you think it is?',
    pYakin: 'How confident are you?',
    pAlasan: 'Why? Which visual features did you use?',
    phAlasan: 'I guessed that because the bean shape…',
    kunci: '🔒 Lock Prediction',
    kunciNote: 'Once locked, your prediction can no longer be changed.',
    terkunci: '🔒 Prediction locked',
    lanjut: '⬆️ Now scroll up and press "Classify with CNN"',
    belumLengkap: 'Please fill in your identity, the variety, and your reasoning first.',
    observeHead: '③ OBSERVE — Observation (filled in automatically)',
    observeKosong: 'This section fills itself once you run the classification.',
    oJenis: 'Variety per model', oYakin: 'Confidence', oGrade: 'Grade',
    oEntropi: 'Entropy', oTidakPasti: 'Uncertainty', oProb: 'Probability distribution across all classes',
    oGradcam: 'Grad-CAM map',
    bandingHead: 'Your prediction versus the model',
    bTebak: 'Your guess', bModel: 'Model',
    tepat: '✓ Your guess was CORRECT', meleset: '✗ Your guess MISSED',
    explainHead: '④ EXPLAIN — Explain',
    e1: 'Did your guess match the model? Why do you think that happened?',
    e2: 'Look at the Grad-CAM map above. Which part of the bean influenced the decision most? Does that make sense?',
    e3: 'Look at the entropy and the probability distribution. Is the model confident or unsure? How can you tell?',
    phE: 'Write your answer here…',
    unduh: '⬇️ Download Worksheet (HTML)',
    salin: '📋 Copy Answers',
    tersalin: '✓ Copied! Paste it into Google Classroom or WhatsApp.',
    gagalSalin: 'Copy failed. Please use the download button instead.',
    belumSelesai: 'Complete your prediction, run the classification, and answer at least one Explain question.',
    unduhNote: 'The HTML file opens in any browser and can be printed to PDF. On phones, the Copy button is usually easier.',
    draf: '💾 Your answers are saved temporarily in this browser.',
    reset: '↩️ Clear Worksheet',
    docJudul: 'Digital Worksheet — Predict · Observe · Explain',
    docSub: 'CNN & Blockchain-based Arabica Coffee Classification · University of Jember',
    docWaktu: 'Completed at',
  },
}

const KOSONG = {
  nama: '', nim: '', kelas: '',
  pJenis: '', pYakin: 60, pAlasan: '',
  terkunci: false,
  e1: '', e2: '', e3: '',
}

export default function LKPD({ lang, hasil, gradcam, onStatus }) {
  const c = CH[lang] || CH.id
  const [aktif, setAktif] = useState(false)
  const [d, setD] = useState(KOSONG)
  const [salinOk, setSalinOk] = useState(null)
  const [peringatan, setPeringatan] = useState('')
  // Dipakai state, BUKAN ref: menandainya lewat state membuat React membatch
  // pemulihan draf bersama penandaan siap, sehingga efek penyimpanan tidak
  // sempat berjalan lebih dulu dengan nilai kosong dan menimpa draf.
  const [siapSimpan, setSiapSimpan] = useState(false)

  // Muat draf dari peramban sekali di awal (lewat efek, agar tidak bentrok hidrasi)
  useEffect(() => {
    try {
      const s = localStorage.getItem('lkpd-draft')
      if (s) { const j = JSON.parse(s); setD({ ...KOSONG, ...j }); if (j.aktif) setAktif(true) }
    } catch (_) {}
    setSiapSimpan(true)
  }, [])

  // Simpan draf setiap perubahan (jawaban uraian panjang — jangan sampai hilang)
  useEffect(() => {
    if (!siapSimpan) return
    try { localStorage.setItem('lkpd-draft', JSON.stringify({ ...d, aktif })) } catch (_) {}
  }, [d, aktif, siapSimpan])

  // Laporkan ke halaman induk: null = LKPD mati, false = aktif belum dikunci, true = terkunci
  useEffect(() => {
    onStatus && onStatus(aktif ? d.terkunci : null)
  }, [aktif, d.terkunci, onStatus])

  // Saat komponen ini hilang dari layar — misalnya menu Belajar ditutup —
  // status WAJIB dikembalikan ke null. Tanpa ini, tombol klasifikasi di
  // halaman utama tetap terkunci padahal LKPD tidak terlihat lagi, dan
  // mahasiswa tidak punya cara membukanya kembali.
  useEffect(() => () => { onStatus && onStatus(null) }, [onStatus])

  const set = (k, v) => setD(p => ({ ...p, [k]: v }))

  function kunciPrediksi() {
    if (!d.nama.trim() || !d.nim.trim() || !d.pJenis || !d.pAlasan.trim()) {
      setPeringatan(c.belumLengkap); return
    }
    setPeringatan(''); set('terkunci', true)
  }

  function kosongkan() {
    setD(KOSONG); setSalinOk(null); setPeringatan('')
    try { localStorage.removeItem('lkpd-draft') } catch (_) {}
  }

  const adaHasil = !!(hasil && !hasil.bukan_kopi && hasil.jenis_kopi)
  const cocok = adaHasil && d.pJenis &&
    d.pJenis.toLowerCase().replace(/\s+/g, '') === String(hasil.jenis_kopi).toLowerCase().replace(/[_\s]+/g, '')
  const siapKirim = d.terkunci && adaHasil && (d.e1.trim() || d.e2.trim() || d.e3.trim())

  function ringkasanTeks() {
    const L = []
    L.push(c.docJudul)
    L.push(c.docSub)
    L.push('')
    L.push(`${c.nama}: ${d.nama}`)
    L.push(`${c.nim}: ${d.nim}`)
    L.push(`${c.kelas}: ${d.kelas || '-'}`)
    L.push(`${c.docWaktu}: ${new Date().toLocaleString(lang === 'en' ? 'en-GB' : 'id-ID')}`)
    L.push('')
    L.push('--- PREDICT ---')
    L.push(`${c.pJenis} ${d.pJenis}`)
    L.push(`${c.pYakin} ${d.pYakin}%`)
    L.push(`${c.pAlasan} ${d.pAlasan}`)
    L.push('')
    L.push('--- OBSERVE ---')
    if (adaHasil) {
      L.push(`${c.oJenis}: ${hasil.jenis_kopi}`)
      L.push(`${c.oYakin}: ${Number(hasil.confidence).toFixed(1)}%`)
      L.push(`${c.oGrade}: ${hasil.grade || '-'}`)
      if (hasil.entropy != null) L.push(`${c.oEntropi}: ${Number(hasil.entropy).toFixed(3)}`)
      if (hasil.uncertainty != null) L.push(`${c.oTidakPasti}: ${(Number(hasil.uncertainty) * 100).toFixed(0)}%`)
      if (Array.isArray(hasil.probs) && hasil.probs.length) {
        L.push(`${c.oProb}:`)
        hasil.probs.forEach(p => L.push(`  - ${p.name}: ${p.value}%`))
      }
      L.push(`${c.bandingHead}: ${c.bTebak} = ${d.pJenis} | ${c.bModel} = ${hasil.jenis_kopi} → ${cocok ? c.tepat : c.meleset}`)
    } else {
      L.push(c.observeKosong)
    }
    L.push('')
    L.push('--- EXPLAIN ---')
    L.push(`1. ${c.e1}`); L.push(d.e1 || '-')
    L.push(`2. ${c.e2}`); L.push(d.e2 || '-')
    L.push(`3. ${c.e3}`); L.push(d.e3 || '-')
    return L.join('\n')
  }

  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function berkasHtml() {
    const baris = (k, v) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`
    const probRows = Array.isArray(hasil?.probs)
      ? hasil.probs.map(p => `<tr><td>${esc(p.name)}</td><td style="text-align:right">${esc(p.value)}%</td></tr>`).join('')
      : ''
    const jawab = (n, q, a) =>
      `<div class="q"><b>${n}. ${esc(q)}</b><p>${esc(a || '-').replace(/\n/g, '<br>')}</p></div>`

    return `<!doctype html><html lang="${lang === 'en' ? 'en' : 'id'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.docJudul)} — ${esc(d.nama)}</title>
<style>
 body{font-family:Georgia,'Times New Roman',serif;max-width:820px;margin:32px auto;padding:0 22px;color:#1a1a1a;line-height:1.65}
 h1{font-size:21px;color:#1F3864;margin:0 0 4px} h2{font-size:15px;color:#1F3864;margin:26px 0 8px;border-bottom:2px solid #DEEAF6;padding-bottom:5px}
 .sub{color:#666;font-size:13px;margin:0 0 20px}
 table{border-collapse:collapse;width:100%;margin:8px 0;font-size:13.5px}
 th,td{border:1px solid #cbd5e1;padding:7px 10px;text-align:left;vertical-align:top}
 th{background:#f2f6fb;width:38%;font-weight:700}
 .q{margin:12px 0} .q b{font-size:13.5px} .q p{margin:5px 0 0;padding:9px 11px;background:#fafbfd;border-left:3px solid #1F3864;font-size:13.5px;white-space:pre-wrap}
 .verd{display:inline-block;padding:5px 12px;border-radius:999px;font-weight:700;font-size:13px;margin-top:6px}
 .ok{background:#dcfce7;color:#15803d} .no{background:#fee2e2;color:#b91c1c}
 img{max-width:260px;border:1px solid #cbd5e1;border-radius:8px;margin-top:6px}
 @media print{body{margin:0}}
</style></head><body>
<h1>${esc(c.docJudul)}</h1><p class="sub">${esc(c.docSub)}</p>
<table>${baris(c.nama, d.nama)}${baris(c.nim, d.nim)}${baris(c.kelas, d.kelas || '-')}${baris(c.docWaktu, new Date().toLocaleString(lang === 'en' ? 'en-GB' : 'id-ID'))}</table>
<h2>${esc(c.predictHead)}</h2>
<table>${baris(c.pJenis, d.pJenis)}${baris(c.pYakin, d.pYakin + '%')}${baris(c.pAlasan, d.pAlasan)}</table>
<h2>${esc(c.observeHead)}</h2>
${adaHasil ? `<table>
${baris(c.oJenis, hasil.jenis_kopi)}${baris(c.oYakin, Number(hasil.confidence).toFixed(1) + '%')}${baris(c.oGrade, hasil.grade || '-')}
${hasil.entropy != null ? baris(c.oEntropi, Number(hasil.entropy).toFixed(3)) : ''}
${hasil.uncertainty != null ? baris(c.oTidakPasti, (Number(hasil.uncertainty) * 100).toFixed(0) + '%') : ''}</table>
${probRows ? `<p style="font-size:13px;margin:14px 0 4px"><b>${esc(c.oProb)}</b></p><table>${probRows}</table>` : ''}
${gradcam ? `<p style="font-size:13px;margin:14px 0 4px"><b>${esc(c.oGradcam)}</b></p><img src="${gradcam}" alt="Grad-CAM">` : ''}
<p style="font-size:13.5px;margin-top:14px"><b>${esc(c.bandingHead)}</b><br>${esc(c.bTebak)}: ${esc(d.pJenis)} &nbsp;·&nbsp; ${esc(c.bModel)}: ${esc(hasil.jenis_kopi)}</p>
<span class="verd ${cocok ? 'ok' : 'no'}">${esc(cocok ? c.tepat : c.meleset)}</span>`
      : `<p>${esc(c.observeKosong)}</p>`}
<h2>${esc(c.explainHead)}</h2>
${jawab(1, c.e1, d.e1)}${jawab(2, c.e2, d.e2)}${jawab(3, c.e3, d.e3)}
</body></html>`
  }

  function unduh() {
    if (!siapKirim) { setPeringatan(c.belumSelesai); return }
    setPeringatan('')
    const blob = new Blob([berkasHtml()], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const nim = (d.nim || 'lkpd').replace(/[^\w-]/g, '')
    a.href = url
    a.download = `LKPD-${nim}-${new Date().toISOString().slice(0, 10)}.html`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  async function salin() {
    if (!siapKirim) { setPeringatan(c.belumSelesai); return }
    setPeringatan('')
    try {
      await navigator.clipboard.writeText(ringkasanTeks())
      setSalinOk(true)
    } catch (_) { setSalinOk(false) }
    setTimeout(() => setSalinOk(null), 5000)
  }

  return (
    <div className="card learn-card lkpd" id="lkpd">
      <h4 className="learn-h">{c.title}</h4>
      <p className="learn-p">{c.sub}</p>

      <button className={`btn ${aktif ? 'btn-ghost' : 'btn-primary'} lkpd-toggle`}
        onClick={() => setAktif(v => !v)}>
        {aktif ? c.matikan : c.aktifkan}
      </button>

      {aktif && (
        <>
          <p className="bc-intro" style={{ marginTop: 14 }}>{c.hint}</p>

          {/* ① Identitas */}
          <div className="lkpd-blok">
            <b className="learn-sub-h">{c.idHead}</b>
            <div className="lkpd-id">
              <label>{c.nama}
                <input value={d.nama} disabled={d.terkunci} placeholder={c.phNama} onChange={e => set('nama', e.target.value)} /></label>
              <label>{c.nim}
                <input value={d.nim} disabled={d.terkunci} placeholder={c.phNim} onChange={e => set('nim', e.target.value)} /></label>
              <label>{c.kelas}
                <input value={d.kelas} disabled={d.terkunci} placeholder={c.phKelas} onChange={e => set('kelas', e.target.value)} /></label>
            </div>
          </div>

          {/* ② Predict */}
          <div className="lkpd-blok">
            <b className="learn-sub-h">{c.predictHead}</b>
            <p className="learn-p">{c.predictSub}</p>
            <label className="lkpd-lbl">{c.pJenis}</label>
            <select className="lkpd-input" value={d.pJenis} disabled={d.terkunci}
              onChange={e => set('pJenis', e.target.value)}>
              <option value="">—</option>
              {VARIETAS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <label className="lkpd-lbl">{c.pYakin} <b>{d.pYakin}%</b></label>
            <input className="learn-slider" type="range" min="0" max="100" value={d.pYakin}
              disabled={d.terkunci} onChange={e => set('pYakin', Number(e.target.value))} />
            <label className="lkpd-lbl">{c.pAlasan}</label>
            <textarea className="lkpd-input" rows={3} value={d.pAlasan} disabled={d.terkunci}
              placeholder={c.phAlasan} onChange={e => set('pAlasan', e.target.value)} />

            {!d.terkunci ? (
              <>
                <button className="btn btn-primary lkpd-kunci" onClick={kunciPrediksi}>{c.kunci}</button>
                <p className="learn-note">{c.kunciNote}</p>
              </>
            ) : (
              <div className="lkpd-locked">
                <span className="bc-badge ok">{c.terkunci}</span>
                {!adaHasil && <a href="#cek" className="lkpd-lanjut">{c.lanjut}</a>}
              </div>
            )}
          </div>

          {/* ③ Observe */}
          <div className="lkpd-blok">
            <b className="learn-sub-h">{c.observeHead}</b>
            {!adaHasil ? <p className="learn-note">{c.observeKosong}</p> : (
              <>
                <table className="lkpd-tabel">
                  <tbody>
                    <tr><th>{c.oJenis}</th><td>{hasil.jenis_kopi}</td></tr>
                    <tr><th>{c.oYakin}</th><td>{Number(hasil.confidence).toFixed(1)}%</td></tr>
                    <tr><th>{c.oGrade}</th><td>{hasil.grade || '-'}</td></tr>
                    {hasil.entropy != null && <tr><th>{c.oEntropi}</th><td>{Number(hasil.entropy).toFixed(3)}</td></tr>}
                    {hasil.uncertainty != null && <tr><th>{c.oTidakPasti}</th><td>{(Number(hasil.uncertainty) * 100).toFixed(0)}%</td></tr>}
                  </tbody>
                </table>
                {Array.isArray(hasil.probs) && hasil.probs.length > 0 && (
                  <>
                    <label className="lkpd-lbl">{c.oProb}</label>
                    <table className="lkpd-tabel">
                      <tbody>{hasil.probs.map((p, i) => (
                        <tr key={i}><th>{p.name}</th><td>{p.value}%</td></tr>
                      ))}</tbody>
                    </table>
                  </>
                )}
                {gradcam && (
                  <>
                    <label className="lkpd-lbl">{c.oGradcam}</label>
                    <img className="lkpd-cam" src={gradcam} alt="Grad-CAM" />
                  </>
                )}
                <div className="lkpd-banding">
                  <span>{c.bTebak}: <b>{d.pJenis || '—'}</b></span>
                  <span>{c.bModel}: <b>{hasil.jenis_kopi}</b></span>
                  <span className={`bc-badge ${cocok ? 'ok' : 'bad'}`}>{cocok ? c.tepat : c.meleset}</span>
                </div>
              </>
            )}
          </div>

          {/* ④ Explain */}
          <div className="lkpd-blok">
            <b className="learn-sub-h">{c.explainHead}</b>
            {[['e1', c.e1], ['e2', c.e2], ['e3', c.e3]].map(([k, q], i) => (
              <div key={k}>
                <label className="lkpd-lbl">{i + 1}. {q}</label>
                <textarea className="lkpd-input" rows={3} value={d[k]} placeholder={c.phE}
                  onChange={e => set(k, e.target.value)} />
              </div>
            ))}
          </div>

          {peringatan && <p className="lkpd-warn">{peringatan}</p>}
          {salinOk === true && <p className="lkpd-ok">{c.tersalin}</p>}
          {salinOk === false && <p className="lkpd-warn">{c.gagalSalin}</p>}

          <div className="lkpd-aksi">
            <button className="btn btn-primary" onClick={unduh}>{c.unduh}</button>
            <button className="btn btn-ghost" onClick={salin}>{c.salin}</button>
            <button className="btn btn-ghost" onClick={kosongkan}>{c.reset}</button>
          </div>
          <p className="learn-note">{c.unduhNote}</p>
          <p className="learn-note">{c.draf}</p>
        </>
      )}
    </div>
  )
}
