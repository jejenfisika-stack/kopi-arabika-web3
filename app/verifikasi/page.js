'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'

const PINATA_GATEWAY = 'rose-casual-warbler-710.mypinata.cloud'

// Tingkat keyakinan model disimpan di blockchain sebagai kunci berbahasa
// Inggris. Sertifikat yang di-mint sebelum penamaan diperbaiki menyimpan nilai
// lama ('Premium', 'Grade A', ...) dan TIDAK bisa diubah — nilai itu sengaja
// ditampilkan apa adanya, karena memang itulah yang tercatat di rantai.
const TIER_LABEL = {
  'Very High': { id: 'Sangat Tinggi', en: 'Very High' },
  'High':      { id: 'Tinggi',        en: 'High' },
  'Moderate':  { id: 'Sedang',        en: 'Moderate' },
  'Low':       { id: 'Rendah',        en: 'Low' },
}
function labelTier(nilai, lang) {
  return TIER_LABEL[nilai]?.[lang] || nilai
}

const T = {
  id: {
    title: '🔎 Verifikasi Sertifikat Kopi',
    sub: 'Masukkan Token ID untuk memeriksa keaslian sertifikat langsung dari blockchain Polygon Amoy. Halaman ini hanya MEMBACA data publik — tanpa wallet, tanpa transaksi.',
    ph: 'Contoh: 31',
    btn: '🔍 Verifikasi',
    checking: 'Membaca blockchain...',
    back: '← Kembali ke Beranda',
    certTitle: 'Sertifikat Terverifikasi On-Chain',
    fJenis: 'Jenis Kopi', fGrade: 'Tingkat Keyakinan Model', fConf: 'Confidence CNN', fPetani: 'Nama Petani',
    fLokasi: 'Lokasi Kebun', fTanggal: 'Tanggal Sertifikasi', fHash: 'Sidik Jari Foto (SHA-256)',
    ikMemeriksa: 'Memeriksa ikatan foto…',
    ikCocok: '✓ Foto cocok dengan catatan blockchain',
    ikCocokKet: 'Foto diambil dari IPFS, dihitung ulang SHA-256-nya di peramban Anda, dan hasilnya sama persis dengan sidik jari yang tercatat on-chain.',
    ikBeda: '✗ Foto TIDAK cocok dengan catatan blockchain',
    ikBedaKet: 'Sidik jari foto yang tersimpan di IPFS berbeda dari yang tercatat on-chain. Sertifikat ini tidak konsisten dan tidak boleh dipercaya.',
    ikTakBisa: '— Ikatan foto belum dapat diperiksa',
    ikTakBisaKet: 'Foto tidak dapat diambil dari IPFS saat ini. Ini bukan berarti sertifikatnya salah — gerbang penyimpanan mungkin sedang terganggu. Coba lagi nanti.',
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
    fJenis: 'Coffee Type', fGrade: 'Confidence Tier', fConf: 'CNN Confidence', fPetani: 'Farmer Name',
    fLokasi: 'Farm Location', fTanggal: 'Certification Date', fHash: 'Photo Fingerprint (SHA-256)',
    ikMemeriksa: 'Verifying photo binding…',
    ikCocok: '✓ Photo matches the blockchain record',
    ikCocokKet: 'The photo was retrieved from IPFS, its SHA-256 recomputed in your own browser, and the result matches the fingerprint recorded on chain exactly.',
    ikBeda: '✗ Photo does NOT match the blockchain record',
    ikBedaKet: 'The fingerprint of the photo stored on IPFS differs from the one recorded on chain. This certificate is inconsistent and should not be trusted.',
    ikTakBisa: '— Photo binding could not be checked',
    ikTakBisaKet: 'The photo could not be retrieved from IPFS right now. This does not mean the certificate is invalid — the storage gateway may be unavailable. Please try again later.',
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

// ── Pengikatan foto ke catatan on-chain ──
// Kontrak tidak bisa membuktikan bahwa hash yang tersimpan memang milik fotonya:
// keduanya masuk sebagai argumen biasa, dan smart contract tidak bisa mengunduh
// berkas lalu menghitung SHA-256. Pembuktiannya harus dikerjakan di sisi pembaca.
//
// Rantainya: CID bersifat content-addressed, jadi mengambil CID itu DIJAMIN
// mengembalikan berkas yang menghasilkannya. Hitung SHA-256 berkas tersebut,
// bandingkan dengan hash on-chain — cocok berarti foto benar-benar terikat pada
// sertifikat, tanpa perlu memercayai penerbit maupun penyedia penyimpanan.
async function periksaIkatanFoto(cid, hashOnChain) {
  if (!cid || !hashOnChain) return { status: 'tak-bisa' }
  try {
    const r = await fetch(`https://${PINATA_GATEWAY}/ipfs/${cid}`)
    if (!r.ok) return { status: 'tak-bisa' }
    const buf = await r.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', buf)
    const hitung = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
    return { status: hitung === String(hashOnChain).toLowerCase() ? 'cocok' : 'beda', hitung }
  } catch (_) {
    // Gagal mengambil berkas BUKAN bukti sertifikat palsu — bisa jadi gerbang
    // IPFS sedang bermasalah. Jangan pernah menampilkannya sebagai tidak cocok.
    return { status: 'tak-bisa' }
  }
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
  const [ikatan, setIkatan] = useState(null)   // null | 'memeriksa' | cocok | beda | tak-bisa
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
    setLoading(true); setErr(''); setCert(null); setMeta(null); setQrUrl(''); setIkatan(null)
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

      // Buktikan foto benar-benar terikat pada catatan on-chain. Dijalankan
      // tanpa ditunggu agar sertifikat langsung tampil; hasilnya menyusul.
      setIkatan({ status: 'memeriksa' })
      periksaIkatanFoto(data.ipfsCID, data.hashFoto).then(setIkatan)

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
                <div className="hasil-row"><span className="lbl">{t.fGrade}</span><span className="val">{labelTier(cert.grade, lang)}</span></div>
                <div className="hasil-row"><span className="lbl">{t.fConf}</span><span className="val">{cert.confidence}%</span></div>
                <div className="hasil-row"><span className="lbl">{t.fPetani}</span><span className="val">{cert.namaPetani}</span></div>
                <div className="hasil-row"><span className="lbl">{t.fLokasi}</span><span className="val">{cert.lokasiKebun}</span></div>
                <div className="hasil-row"><span className="lbl">{t.fTanggal}</span><span className="val">{tgl}</span></div>
                {entropy != null && <div className="hasil-row"><span className="lbl">{t.fEntropy}</span><span className="val">{entropy} bit</span></div>}
                <div className="hash-box" style={{ marginTop: 10 }}>
                  <div className="k">{t.fHash}</div>
                  <div className="v">{cert.hashFoto}</div>
                </div>

                {/* Bukti bahwa foto memang terikat pada catatan on-chain,
                    dihitung di peramban pembaca — bukan diklaim oleh situs. */}
                {ikatan && (
                  <div className={`ikatan ik-${ikatan.status}`}>
                    <div className="ik-judul">
                      {ikatan.status === 'memeriksa' && <><span className="spinner" /> {t.ikMemeriksa}</>}
                      {ikatan.status === 'cocok'    && t.ikCocok}
                      {ikatan.status === 'beda'     && t.ikBeda}
                      {ikatan.status === 'tak-bisa' && t.ikTakBisa}
                    </div>
                    {ikatan.status === 'cocok'    && <div className="ik-ket">{t.ikCocokKet}</div>}
                    {ikatan.status === 'beda'     && <div className="ik-ket">{t.ikBedaKet}</div>}
                    {ikatan.status === 'tak-bisa' && <div className="ik-ket">{t.ikTakBisaKet}</div>}
                  </div>
                )}
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
