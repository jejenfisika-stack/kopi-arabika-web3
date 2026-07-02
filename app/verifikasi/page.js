'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'

const PINATA_GATEWAY = 'rose-casual-warbler-710.mypinata.cloud'

const T = {
  id: {
    title: '🔎 Verifikasi Sertifikat Kopi',
    sub: 'Masukkan Token ID untuk memeriksa keaslian sertifikat langsung dari blockchain Polygon Amoy. Halaman ini hanya MEMBACA data publik — tanpa wallet, tanpa transaksi.',
    ph: 'Contoh: 31',
    btn: '🔍 Verifikasi',
    checking: 'Membaca blockchain...',
    back: '← Kembali ke Beranda',
    certTitle: 'Sertifikat Terverifikasi On-Chain',
    fJenis: 'Jenis Kopi', fGrade: 'Grade', fConf: 'Confidence CNN', fPetani: 'Nama Petani',
    fLokasi: 'Lokasi Kebun', fTanggal: 'Tanggal Sertifikasi', fHash: 'Sidik Jari Foto (SHA-256)',
    fEntropy: 'Entropy XAI', fToken: 'Token ID',
    foto: 'Foto biji kopi', gradcam: 'Grad-CAM (fokus model)',
    trust: 'Jangan hanya percaya halaman ini — cek silang secara independen:',
    seeToken: '🔗 Lihat NFT di Polygonscan', seeContract: '📜 Smart Contract (Verified)',
    seeMeta: '🧾 Metadata mentah di IPFS',
    qrTitle: 'QR Sertifikat ini', qrDesc: 'Cetak di kemasan — pembeli scan untuk membuka halaman verifikasi ini.',
    qrDownload: '⬇️ Unduh QR (PNG)',
    metaLoading: 'Memuat metadata & penjelasan AI dari IPFS...',
  },
  en: {
    title: '🔎 Coffee Certificate Verification',
    sub: 'Enter a Token ID to check certificate authenticity straight from the Polygon Amoy blockchain. This page only READS public data — no wallet, no transactions.',
    ph: 'e.g. 31',
    btn: '🔍 Verify',
    checking: 'Reading the blockchain...',
    back: '← Back to Home',
    certTitle: 'On-Chain Verified Certificate',
    fJenis: 'Coffee Type', fGrade: 'Grade', fConf: 'CNN Confidence', fPetani: 'Farmer Name',
    fLokasi: 'Farm Location', fTanggal: 'Certification Date', fHash: 'Photo Fingerprint (SHA-256)',
    fEntropy: 'XAI Entropy', fToken: 'Token ID',
    foto: 'Coffee bean photo', gradcam: 'Grad-CAM (model focus)',
    trust: 'Do not trust this page alone — cross-check independently:',
    seeToken: '🔗 View NFT on Polygonscan', seeContract: '📜 Smart Contract (Verified)',
    seeMeta: '🧾 Raw metadata on IPFS',
    qrTitle: 'QR for this certificate', qrDesc: 'Print it on packaging — buyers scan it to open this verification page.',
    qrDownload: '⬇️ Download QR (PNG)',
    metaLoading: 'Loading metadata & AI explanation from IPFS...',
  },
}

function ipfsToHttp(uri) {
  if (!uri) return ''
  return uri.startsWith('ipfs://') ? `https://${PINATA_GATEWAY}/ipfs/${uri.slice(7)}` : uri
}

function VerifikasiInner() {
  const params = useSearchParams()
  const [lang, setLang] = useState('id')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [cert, setCert] = useState(null)
  const [meta, setMeta] = useState(null)
  const [metaLoading, setMetaLoading] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  const t = T[lang] || T.id

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved === 'id' || saved === 'en') setLang(saved)
    const id = params.get('id')
    if (id && /^\d{1,10}$/.test(id)) {
      setInput(id)
      cek(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cek(idArg) {
    const id = String(idArg ?? input).trim()
    if (!/^\d{1,10}$/.test(id)) { setErr(lang === 'en' ? 'Token ID must be a number.' : 'Token ID harus berupa angka.'); return }
    setLoading(true); setErr(''); setCert(null); setMeta(null); setQrUrl('')
    try {
      const res = await fetch(`/api/verifikasi?id=${id}`)
      const data = await res.json()
      if (!res.ok || !data.success) { setErr(data.error || 'Gagal memverifikasi.'); return }
      setCert(data)

      // QR berisi URL halaman ini (bukan rahasia apa pun)
      try {
        const link = `${window.location.origin}/verifikasi?id=${data.tokenId}`
        setQrUrl(await QRCode.toDataURL(link, { width: 280, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } }))
      } catch (_) {}

      // Metadata (XAI: probabilitas, entropy, gradcam) dari IPFS — opsional
      if (data.metadataURI) {
        setMetaLoading(true)
        try {
          const m = await fetch(ipfsToHttp(data.metadataURI))
          if (m.ok) setMeta(await m.json())
        } catch (_) {}
        setMetaLoading(false)
      }
    } catch (e) {
      setErr(lang === 'en' ? 'Network error, try again.' : 'Gangguan jaringan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const tgl = cert ? new Date(cert.timestamp * 1000).toLocaleString(lang === 'en' ? 'en-GB' : 'id-ID', { dateStyle: 'long', timeStyle: 'short' }) : ''
  const entropy = meta?.xai?.entropy_bit

  return (
    <main className="container">
      <header className="topbar">
        <div className="brand">
          <div className="logo"><img src="/kopi-cherry.jpg" alt="Kopi Arabika" /></div>
          <div>
            <h1>Kopi Arabika Web3</h1>
            <p>{lang === 'en' ? 'Certificate Verification' : 'Verifikasi Sertifikat'}</p>
          </div>
        </div>
        <a className="pill lang" href="/">{t.back}</a>
      </header>

      <section className="section" style={{ marginTop: 8 }}>
        <div className="section-head"><span className="ic">🔎</span><h3>{t.title}</h3></div>
        <p className="section-sub">{t.sub}</p>

        <div className="card" style={{ maxWidth: 560 }}>
          <div className="field" style={{ marginTop: 0 }}>
            <label>🏷️ {t.fToken}</label>
            <input inputMode="numeric" placeholder={t.ph} value={input}
              onChange={e => setInput(e.target.value.replace(/[^\d]/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') cek() }} />
          </div>
          <div className="row">
            <button className="btn btn-primary" onClick={() => cek()} disabled={loading || !input}>
              {loading ? <><span className="spinner" /> {t.checking}</> : t.btn}
            </button>
          </div>
          {err && <div className="alert alert-err">{err}</div>}
        </div>

        {cert && (
          <div className="card" style={{ marginTop: 18 }}>
            <div className="alert alert-ok" style={{ marginTop: 0, marginBottom: 16 }}>
              <b>✅ {t.certTitle}</b> — #{cert.tokenId}
            </div>

            <div className="verif-grid">
              <div className="verif-media">
                {cert.ipfsCID && (
                  <figure>
                    <img src={`https://${PINATA_GATEWAY}/ipfs/${cert.ipfsCID}`} alt="foto biji kopi" />
                    <figcaption>{t.foto}</figcaption>
                  </figure>
                )}
                {meta?.xai?.gradcam_url && (
                  <figure>
                    <img src={meta.xai.gradcam_url} alt="grad-cam" />
                    <figcaption>{t.gradcam}</figcaption>
                  </figure>
                )}
                {metaLoading && <p className="note">{t.metaLoading}</p>}
              </div>

              <div className="verif-fields">
                <div className="hasil-row"><span className="lbl">{t.fJenis}</span><span className="val">{cert.jenisKopi.replace(/_/g, ' ')}</span></div>
                <div className="hasil-row"><span className="lbl">{t.fGrade}</span><span className="val">{cert.grade}</span></div>
                <div className="hasil-row"><span className="lbl">{t.fConf}</span><span className="val">{cert.confidence}%</span></div>
                <div className="hasil-row"><span className="lbl">{t.fPetani}</span><span className="val">{cert.namaPetani}</span></div>
                <div className="hasil-row"><span className="lbl">{t.fLokasi}</span><span className="val">{cert.lokasiKebun}</span></div>
                <div className="hasil-row"><span className="lbl">{t.fTanggal}</span><span className="val">{tgl}</span></div>
                {entropy != null && <div className="hasil-row"><span className="lbl">{t.fEntropy}</span><span className="val">{entropy} bit</span></div>}
                <div className="hash-box" style={{ marginTop: 10 }}>
                  <div className="k">{t.fHash}</div>
                  <div className="v">{cert.hashFoto}</div>
                </div>
              </div>
            </div>

            {/* QR sertifikat ini */}
            {qrUrl && (
              <div className="qr-box">
                <img src={qrUrl} alt="QR verifikasi" />
                <div>
                  <b>{t.qrTitle}</b>
                  <p className="note" style={{ marginTop: 4 }}>{t.qrDesc}</p>
                  <a className="btn btn-ghost" style={{ width: 'auto', marginTop: 8, textDecoration: 'none' }}
                     href={qrUrl} download={`sertifikat-kopi-${cert.tokenId}-qr.png`}>
                    {t.qrDownload}
                  </a>
                </div>
              </div>
            )}

            {/* Jangkar kepercayaan — cek silang independen */}
            <p className="note" style={{ marginTop: 16, fontWeight: 700 }}>{t.trust}</p>
            <a className="link-btn link-blue" target="_blank" rel="noreferrer"
               href={`https://amoy.polygonscan.com/nft/${cert.contract}/${cert.tokenId}`}>{t.seeToken}</a>
            <a className="link-btn link-meta" target="_blank" rel="noreferrer"
               href={`https://amoy.polygonscan.com/address/${cert.contract}#code`}>{t.seeContract} · {cert.contract.slice(0, 8)}…{cert.contract.slice(-6)}</a>
            {cert.metadataURI && (
              <a className="link-btn link-amber" target="_blank" rel="noreferrer"
                 href={ipfsToHttp(cert.metadataURI)}>{t.seeMeta}</a>
            )}
          </div>
        )}
      </section>

      <p className="footer">
        ☕ <b>Kopi Arabika Web3</b> — {lang === 'en' ? 'read-only verification, data straight from Polygon Amoy' : 'verifikasi baca-saja, data langsung dari Polygon Amoy'} · Universitas Jember
      </p>
    </main>
  )
}

export default function VerifikasiPage() {
  return (
    <Suspense fallback={<main className="container"><p className="note">Loading…</p></main>}>
      <VerifikasiInner />
    </Suspense>
  )
}
