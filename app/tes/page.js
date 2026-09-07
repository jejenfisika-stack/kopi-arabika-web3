'use client'

import { useState } from 'react'
import { SOAL_PP, DIM_PP } from '../data/soalPrePost'

const MAKS = 25

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Siapkan set soal teracak: urutan soal diacak + opsi tiap soal diacak,
// dengan tetap melacak posisi jawaban benar.
function siapkanSoal(form) {
  const bank = form === 'post' ? SOAL_PP.B : SOAL_PP.A
  return shuffle(bank).map((q) => {
    const order = shuffle(q.opts.map((_, i) => i)) // indeks asli teracak
    return {
      dim: q.dim, bloom: q.bloom, teks: q.teks,
      opts: order.map((i) => q.opts[i]),
      correctPos: order.indexOf(q.jwb), // posisi jawaban benar setelah diacak
    }
  })
}

function kategoriNgain(g) {
  if (g >= 0.7) return 'Tinggi'
  if (g >= 0.3) return 'Sedang'
  return 'Rendah'
}

export default function TesPage() {
  const [step, setStep] = useState('form') // form | quiz | result
  const [nama, setNama] = useState('')
  const [nim, setNim] = useState('')
  const [kelas, setKelas] = useState('')
  const [form, setForm] = useState('pre')

  const [soal, setSoal] = useState([])
  const [cur, setCur] = useState(0)
  const [jawab, setJawab] = useState([])

  const [kirim, setKirim] = useState(false)
  const [hasil, setHasil] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  function mulai() {
    if (!nama.trim() || !nim.trim()) { setErrMsg('Nama dan NIM/absen wajib diisi.'); return }
    setErrMsg('')
    setSoal(siapkanSoal(form))
    setJawab(Array(MAKS).fill(null))
    setCur(0)
    setStep('quiz')
  }

  function pilih(pos) {
    setJawab((a) => { const n = [...a]; n[cur] = pos; return n })
  }

  async function selesai() {
    // hitung skor + per dimensi
    let skor = 0
    const perDim = { AIL1: 0, AIL2: 0, AIL3: 0, AIL4: 0 }
    const jawaban = soal.map((q, i) => {
      const benar = jawab[i] === q.correctPos
      if (benar) { skor++; perDim[q.dim]++ }
      return { no: i + 1, dim: q.dim, benar }
    })

    setKirim(true); setErrMsg('')

    // Kirim dengan percobaan ulang. Satu kelas biasanya selesai berbarengan,
    // sehingga sebagian pengiriman bisa tertolak sesaat atau kena gangguan
    // jaringan. Tanpa percobaan ulang, data mahasiswa itu HILANG diam-diam.
    const JEDA = [0, 1500, 4000, 8000]   // 4 percobaan, jeda menaik
    let data = null, galat = 'Gagal menyimpan ke server.'

    for (let coba = 0; coba < JEDA.length; coba++) {
      if (JEDA[coba] > 0) {
        setErrMsg(`Menyimpan ulang… percobaan ${coba + 1} dari ${JEDA.length}`)
        await new Promise(r => setTimeout(r, JEDA[coba]))
      }
      try {
        const res = await fetch('/api/simpan-hasil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama, nim, kelas, form, skor, maks: MAKS, perDim, jawaban }),
        })
        const j = await res.json().catch(() => ({}))

        // Berhasil, duplikat, atau ditolak validasi → semuanya final, jangan diulang
        if (j.status === 'ok' || j.status === 'duplicate') { data = j; break }
        if (res.status === 400 || res.status === 503) { galat = j.error || galat; break }

        galat = j.error || `Gagal menyimpan (kode ${res.status}).`
      } catch (e) {
        galat = 'Gangguan jaringan saat menyimpan.'
      }
    }

    setErrMsg('')
    if (data && data.status === 'duplicate') {
      setHasil({ duplicate: true, skor, perDim })
    } else if (data && data.status === 'ok') {
      setHasil({
        skor, perDim,
        ngain: data.ngain != null ? Number(data.ngain) : null,
        skorPre: data.skorPre != null ? Number(data.skorPre) : null,
      })
    } else {
      // tetap tampilkan skor lokal walau simpan gagal
      setHasil({ skor, perDim, gagalSimpan: galat })
    }
    setKirim(false)
    setStep('result')
  }

  // ---------- STEP: FORM IDENTITAS ----------
  if (step === 'form') {
    return (
      <main className="container">
        <TopBar />
        <section className="section" style={{ marginTop: 8 }}>
          <div className="section-head"><span className="ic">📝</span><h3>Pre-test / Post-test AI Literacy</h3></div>
          <p className="section-sub">
            Instrumen penilaian AI Literacy (25 soal, framework Ng et al. 2021). Urutan soal & pilihan jawaban
            diacak otomatis. Tes ini <b>tidak menampilkan pembahasan</b> — hanya skor akhir. Isi identitas dengan benar;
            tiap peserta hanya boleh mengerjakan <b>satu kali</b> per jenis tes.
          </p>
          <div className="card" style={{ maxWidth: 560 }}>
            <div className="field" style={{ marginTop: 0 }}>
              <label>👤 Nama Lengkap</label>
              <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama sesuai daftar hadir" />
            </div>
            <div className="field">
              <label>🆔 NIM / Nomor Absen</label>
              <input value={nim} onChange={(e) => setNim(e.target.value)} placeholder="Contoh: 210210102001" />
            </div>
            <div className="field">
              <label>🏫 Kelas / Rombel</label>
              <input value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="Contoh: Pendidikan IPA A" />
            </div>
            <div className="field">
              <label>🧪 Jenis Tes</label>
              <div className="tes-pick">
                <button className={`tes-opt ${form === 'pre' ? 'on' : ''}`} onClick={() => setForm('pre')}>Pre-test (sebelum belajar)</button>
                <button className={`tes-opt ${form === 'post' ? 'on' : ''}`} onClick={() => setForm('post')}>Post-test (sesudah belajar)</button>
              </div>
            </div>
            {errMsg && <div className="alert alert-err">{errMsg}</div>}
            <div className="row">
              <button className="btn btn-primary" onClick={mulai}>🚀 Mulai Tes ({form === 'post' ? 'Post-test' : 'Pre-test'})</button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  // ---------- STEP: KUIS ----------
  if (step === 'quiz') {
    const s = soal[cur]
    const d = DIM_PP[s.dim]
    const terjawab = jawab.filter((x) => x != null).length
    return (
      <main className="container">
        <TopBar />
        <section className="section" style={{ marginTop: 8 }}>
          <div className="card learn-card">
            <h4 className="learn-h">📝 {form === 'post' ? 'Post-test' : 'Pre-test'} AI Literacy</h4>
            <p className="learn-p">Peserta: <b>{nama}</b> · {nim} · Terjawab {terjawab}/{MAKS}</p>
            <div className="aili-prog-top"><span className="learn-note" style={{ margin: 0 }}>Progress</span><span className="aili-prog-num">{cur + 1} / {MAKS}</span></div>
            <div className="aili-bar"><div className="aili-bar-fill" style={{ width: `${(cur + 1) / MAKS * 100}%` }} /></div>
          </div>

          <div className="card learn-card">
            <div className="aili-qhead">
              <div className="aili-num" style={{ background: d.color }}>{cur + 1}</div>
              <div>
                <span className="aili-dim" style={{ background: d.bg, color: d.color, borderColor: d.bd }}>{s.dim}: {d.label}</span>
                <div className="aili-bloom">Level {s.bloom}</div>
              </div>
            </div>
            <div className="aili-q">{s.teks}</div>
            <div className="aili-opts">
              {s.opts.map((o, j) => (
                <button key={j} className={`aili-opt ${jawab[cur] === j ? 'picked' : ''}`} onClick={() => pilih(j)}>
                  <span className="aili-letter">{'ABCD'[j]}</span><span>{o}</span>
                </button>
              ))}
            </div>
            <div className="aili-nav">
              <button className="btn btn-ghost" style={{ width: 'auto' }} disabled={cur === 0} onClick={() => setCur((c) => c - 1)}>← Sebelumnya</button>
              {cur < MAKS - 1
                ? <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setCur((c) => c + 1)}>Selanjutnya →</button>
                : <button className="btn btn-mint" style={{ width: 'auto' }} disabled={kirim} onClick={selesai}>
                    {kirim ? <><span className="spinner" /> Menyimpan…</> : '✅ Selesai & Simpan'}
                  </button>}
            </div>
            {terjawab < MAKS && cur === MAKS - 1 && (
              <p className="note" style={{ color: '#b45309' }}>⚠️ Masih ada {MAKS - terjawab} soal belum dijawab (akan dihitung salah).</p>
            )}
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  // ---------- STEP: HASIL ----------
  const pct = Math.round(hasil.skor / MAKS * 100)
  return (
    <main className="container">
      <TopBar />
      <section className="section" style={{ marginTop: 8 }}>
        <div className="card learn-card aili-result">
          {hasil.duplicate ? (
            <div className="alert alert-warn" style={{ textAlign: 'left' }}>
              <b>⚠️ Anda sudah pernah mengerjakan {form === 'post' ? 'Post-test' : 'Pre-test'} ini.</b>
              <p style={{ marginTop: 6 }}>Data yang tersimpan adalah percobaan pertama. Skor kali ini <b>tidak disimpan ulang</b>. Hubungi pengajar bila ini keliru.</p>
              <p className="note" style={{ marginTop: 8 }}>Skor kali ini (tidak tersimpan): {hasil.skor}/{MAKS}</p>
            </div>
          ) : (
            <>
              <div className="aili-score">{hasil.skor}/{MAKS}</div>
              <div className="aili-pct">{pct}% jawaban benar · {form === 'post' ? 'Post-test' : 'Pre-test'}</div>

              {hasil.gagalSimpan && <div className="alert alert-err" style={{ textAlign: 'left' }}>⚠️ {hasil.gagalSimpan} (skor di atas dihitung lokal)</div>}

              {form === 'post' && hasil.ngain != null && (
                <div className="ngain-box">
                  <div className="ngain-label">N-gain (Hake)</div>
                  <div className="ngain-val">{hasil.ngain.toFixed(2)}</div>
                  <div className={`ngain-cat cat-${kategoriNgain(hasil.ngain).toLowerCase()}`}>{kategoriNgain(hasil.ngain)}</div>
                  {hasil.skorPre != null && <div className="note">Pre-test {hasil.skorPre}/{MAKS} → Post-test {hasil.skor}/{MAKS}</div>}
                </div>
              )}
              {form === 'post' && hasil.ngain == null && !hasil.gagalSimpan && (
                <p className="note">N-gain belum bisa dihitung — pastikan Anda sudah mengerjakan Pre-test dengan NIM yang sama.</p>
              )}

              <div className="learn-sub-h">Skor per Dimensi AI Literacy</div>
              <div className="aili-dimgrid">
                {Object.entries(DIM_PP).map(([k, v]) => {
                  const sc = hasil.perDim[k], dp = Math.round(sc / v.max * 100)
                  return (
                    <div className="aili-dimcard" key={k} style={{ background: v.bg, borderColor: v.bd }}>
                      <div className="aili-dimtop"><b style={{ color: v.color }}>{k}: {v.label}</b><span style={{ color: v.color, fontWeight: 800 }}>{sc}/{v.max}</span></div>
                      <div className="aili-dimbar"><div style={{ width: `${dp}%`, background: v.color }} /></div>
                    </div>
                  )
                })}
              </div>
              <p className="note" style={{ marginTop: 14 }}>
                {form === 'pre'
                  ? 'Terima kasih. Silakan lanjut belajar di Pusat Belajar, lalu kerjakan Post-test dengan NIM yang sama untuk melihat N-gain Anda.'
                  : 'Terima kasih telah menyelesaikan Post-test.'}
              </p>
            </>
          )}
          <a className="btn btn-ghost" style={{ maxWidth: 260, margin: '16px auto 0', textDecoration: 'none', display: 'inline-flex' }} href="/">← Kembali ke Beranda</a>
        </div>
      </section>
      <Footer />
    </main>
  )
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo"><img src="/kopi-cherry.jpg" alt="Kopi Arabika" /></div>
        <div>
          <h1>Kopi Arabika Web3</h1>
          <p>Instrumen AI Literacy</p>
        </div>
      </div>
      <a className="pill lang" href="/" style={{ textDecoration: 'none' }}>← Beranda</a>
    </header>
  )
}
function Footer() {
  return <p className="footer">☕ <b>Kopi Arabika Web3</b> — Pre/Post-test AI Literacy · Universitas Jember</p>
}
