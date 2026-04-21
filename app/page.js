'use client'

import { useState, useRef } from 'react'
import { ethers } from 'ethers'

// Gradio v4+ client
async function callGradioAPI(imageFile) {
  const b64 = await toBase64(imageFile)
  
  // Format data untuk Gradio v4
  const body = {
    data: [b64]  // langsung base64 string
  }
  
  const res = await fetch(
    `https://jejenFis06-kopi-arabika-classifier.hf.space/gradio_api/run/predict`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  )
  
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return await res.json()
}

// ============================================================
// KONFIGURASI
// ============================================================
const HF_SPACE_URL   = 'https://jejenFis06-kopi-arabika-classifier.hf.space'
const CONTRACT_ADDRESS = '0x53ff81292ea345d13da906e0f27794f8d5402853'
const PINATA_GATEWAY   = 'rose-casual-warbler-710.mypinata.cloud'
const AMOY_CHAIN_ID    = '0x13882'

const CONTRACT_ABI = [
  {
    inputs: [
      { name: 'petani',           type: 'address' },
      { name: 'cid',              type: 'string'  },
      { name: 'metadataURI',      type: 'string'  },
      { name: 'jenisKopi',        type: 'string'  },
      { name: 'grade',            type: 'string'  },
      { name: 'namaPetani',       type: 'string'  },
      { name: 'lokasiKebun',      type: 'string'  },
      { name: 'confidencePersen', type: 'uint256' },
    ],
    name: 'mintKopiNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const GRADE_STYLE = {
  'Premium':  { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', emoji: '🏆' },
  'Grade A':  { bg: 'bg-blue-50',   border: 'border-blue-400',   text: 'text-blue-800',   emoji: '⭐' },
  'Grade B':  { bg: 'bg-green-50',  border: 'border-green-400',  text: 'text-green-800',  emoji: '✅' },
  'Grade C':  { bg: 'bg-gray-50',   border: 'border-gray-400',   text: 'text-gray-700',   emoji: '⚠️' },
}

export default function HomePage() {
  const [foto, setFoto]               = useState(null)
  const [preview, setPreview]         = useState(null)
  const [namaPetani, setNamaPetani]   = useState('')
  const [lokasi, setLokasi]           = useState('')
  const [loading, setLoading]         = useState(false)
  const [status, setStatus]           = useState('')
  const [hasilCNN, setHasilCNN]       = useState(null)
  const [txHash, setTxHash]           = useState('')
  const [cidFoto, setCidFoto]         = useState('')
  const [errorMsg, setErrorMsg]       = useState('')
  const fileRef = useRef()

  // ============================================================
  // Pilih foto
  // ============================================================
  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file)
    setPreview(URL.createObjectURL(file))
    setHasilCNN(null)
    setTxHash('')
    setCidFoto('')
    setErrorMsg('')
    setStatus('')
  }

  // ============================================================
  // Konversi file ke base64
  // ============================================================
  function toBase64(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload  = e => res(e.target.result)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
  }

  // ============================================================
  // Klasifikasi CNN via Hugging Face Gradio v4 API (3-step)
  // ============================================================
  async function klasifikasiCNN() {
    if (!foto) { alert('Pilih foto kopi terlebih dahulu!'); return }
    setLoading(true)
    setHasilCNN(null)
    setErrorMsg('')

    try {
      const BASE = 'https://jejenFis06-kopi-arabika-classifier.hf.space'

      // STEP A: Upload foto ke Gradio, dapat path file
      setStatus('Mengunggah foto ke Hugging Face...')
      const formData = new FormData()
      formData.append('files', foto, foto.name)
      const uploadRes = await fetch(`${BASE}/gradio_api/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error(`Upload foto gagal: ${uploadRes.status}`)
      const uploadedPaths = await uploadRes.json()
      const filePath = uploadedPaths?.[0]
      if (!filePath) throw new Error('Path file tidak ditemukan setelah upload')
      console.log('File path:', filePath)

      // STEP B: Panggil endpoint klasifikasi_kopi dengan path file
      setStatus('Mengklasifikasi dengan CNN RepViT...')
      const predictRes = await fetch(`${BASE}/gradio_api/call/klasifikasi_kopi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{ path: filePath, mime_type: foto.type, orig_name: foto.name }]
        }),
      })
      if (!predictRes.ok) {
        const errText = await predictRes.text()
        throw new Error(`Predict gagal ${predictRes.status}: ${errText.slice(0, 200)}`)
      }
      const { event_id } = await predictRes.json()
      if (!event_id) throw new Error('event_id tidak ditemukan')
      console.log('Event ID:', event_id)

      // STEP C: Ambil hasil via SSE stream
      setStatus('Menunggu hasil CNN...')
      const resultRes = await fetch(`${BASE}/gradio_api/call/klasifikasi_kopi/${event_id}`)
      if (!resultRes.ok) throw new Error(`Gagal ambil hasil: ${resultRes.status}`)

      const reader  = resultRes.body.getReader()
      const decoder = new TextDecoder()
      let outputText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const raw = line.slice(5).trim()
            if (raw === '[DONE]') continue
            try {
              const arr = JSON.parse(raw)
              if (Array.isArray(arr) && typeof arr[0] === 'string') {
                outputText = arr[0]
              }
            } catch { /* skip */ }
          }
        }
      }

      if (!outputText) throw new Error('Tidak ada output teks dari CNN')
      console.log('Hasil CNN:', outputText)

      // Parse hasil teks CNN
      function parseOutput(text) {
        const jenisMatch = text.match(/JENIS KOPI\s*:\s*(.+)/i)
        const confMatch  = text.match(/CONFIDENCE\s*:\s*([\d.]+)%/i)
        const gradeMatch = text.match(/GRADE\s*:\s*([A-Za-z\s]+)/i)
        const jenis      = jenisMatch?.[1]?.trim() || 'Tidak Terdeteksi'
        const confidence = parseFloat(confMatch?.[1]) || 0
        let grade        = gradeMatch?.[1]?.trim()?.replace(/[^\w\s]/g,'').trim() || 'Grade B'
        if (!GRADE_STYLE[grade]) grade = 'Grade B'
        return { jenis_kopi: jenis, confidence, grade, raw: text }
      }
      
      setHasilCNN(parseOutput(outputText))
      setStatus('')
    } catch (err) {
      console.error('Error:', err)
      setErrorMsg(`Error klasifikasi: ${err.message}`)
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // Upload ke IPFS via API route Vercel
  // ============================================================
  async function uploadIPFS() {
    setStatus('Mengupload foto ke IPFS...')
    const b64 = await toBase64(foto)
    const res = await fetch('/api/upload-ipfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: b64,
        fileName: foto.name,
        hasilCNN,
        namaPetani,
        lokasiKebun: lokasi,
      }),
    })
    const data = await res.json()
    if (!data.cidFoto) throw new Error(data.error || 'Upload IPFS gagal')
    setCidFoto(data.cidFoto)
    return data
  }

  // ============================================================
  // Connect MetaMask & switch ke Amoy
  // ============================================================
  async function connectWallet() {
    if (!window.ethereum) {
      alert('MetaMask tidak ditemukan! Install MetaMask terlebih dahulu dari metamask.io')
      return null
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const chainId  = await window.ethereum.request({ method: 'eth_chainId' })

    if (chainId !== AMOY_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AMOY_CHAIN_ID }],
        })
      } catch {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: AMOY_CHAIN_ID,
            chainName: 'Polygon Amoy Testnet',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: ['https://rpc-amoy.polygon.technology'],
            blockExplorerUrls: ['https://amoy.polygonscan.com'],
          }],
        })
      }
    }
    return accounts[0]
  }

  // ============================================================
  // Mint NFT ke Blockchain
  // ============================================================
  async function mintNFT() {
    if (!namaPetani.trim()) { alert('Isi Nama Petani!');  return }
    if (!lokasi.trim())     { alert('Isi Lokasi Kebun!'); return }
    if (!hasilCNN)          { alert('Klasifikasi CNN dulu!'); return }

    setLoading(true)
    setErrorMsg('')
    try {
      setStatus('Menghubungkan MetaMask...')
      const address = await connectWallet()
      if (!address) return

      setStatus('Mengupload ke IPFS...')
      const ipfsData = await uploadIPFS()

      setStatus('Mengirim transaksi ke Polygon Amoy...')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer   = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const tx = await contract.mintKopiNFT(
        address,
        ipfsData.cidFoto,
        `ipfs://${ipfsData.cidMetadata}`,
        hasilCNN.jenis_kopi,
        hasilCNN.grade,
        namaPetani,
        lokasi,
        Math.round(hasilCNN.confidence)
      )

      setStatus('Menunggu konfirmasi blockchain (~5 detik)...')
      const receipt = await tx.wait()
      setTxHash(receipt.hash)
      setStatus('NFT berhasil di-mint!')
    } catch (err) {
      console.error(err)
      setErrorMsg('Error mint NFT: ' + (err.reason || err.message))
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  const gs = hasilCNN ? (GRADE_STYLE[hasilCNN.grade] || GRADE_STYLE['Grade B']) : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50">

      {/* Header */}
      <header className="bg-green-800 text-white py-5 px-4 text-center shadow">
        <h1 className="text-2xl font-bold">☕ Kopi Arabika Web3</h1>
        <p className="text-green-200 text-sm mt-1">Klasifikasi CNN RepViT + Sertifikasi Blockchain Polygon</p>
        <p className="text-green-300 text-xs mt-0.5">Universitas Jember</p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Card Upload */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-base font-semibold text-green-800 mb-3">📸 Step 1 — Upload Foto Biji Kopi</h2>

          {/* Area foto */}
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-green-300 rounded-xl p-4 text-center cursor-pointer hover:bg-green-50 transition mb-4 min-h-[160px] flex items-center justify-center"
          >
            {preview
              ? <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain mx-auto" />
              : <div className="text-green-500">
                  <div className="text-5xl mb-2">📷</div>
                  <p className="font-medium text-sm">Klik untuk pilih foto biji kopi</p>
                  <p className="text-xs text-gray-400 mt-1">Bisa dari kamera HP atau galeri foto</p>
                </div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} capture="environment" />

          {/* Form petani */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">👤 Nama Petani</label>
              <input
                type="text"
                placeholder="Contoh: Pak Ahmad Fauzi"
                value={namaPetani}
                onChange={e => setNamaPetani(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📍 Lokasi Kebun</label>
              <input
                type="text"
                placeholder="Contoh: Desa Tugusari, Bondowoso, Jawa Timur"
                value={lokasi}
                onChange={e => setLokasi(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Tombol klasifikasi */}
          <button
            onClick={klasifikasiCNN}
            disabled={!foto || loading}
            className="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            {loading && !hasilCNN
              ? <><span className="animate-spin">⏳</span> {status || 'Memproses...'}</>
              : '🔍 Klasifikasi dengan CNN'
            }
          </button>

          {/* Error message */}
          {errorMsg && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Hasil CNN */}
        {hasilCNN && (
          <div className={`rounded-2xl shadow p-5 border-2 ${gs.border} ${gs.bg}`}>
            <h2 className={`text-base font-semibold mb-3 ${gs.text}`}>
              {gs.emoji} Hasil Klasifikasi CNN RepViT-M1.1
            </h2>

            <div className="space-y-2 mb-4">
              <Row label="Jenis Kopi"     value={hasilCNN.jenis_kopi.replace(/_/g,' ')} bold />
              <Row label="Confidence CNN" value={`${hasilCNN.confidence.toFixed(2)}%`} />
              <Row label="Grade Kualitas" value={`${gs.emoji} ${hasilCNN.grade}`} bold />
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-full h-2.5 mb-4 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${hasilCNN.confidence}%` }}
              />
            </div>

            {/* Tombol Mint NFT */}
            {!txHash && (
              <button
                onClick={mintNFT}
                disabled={loading}
                className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="animate-spin">⏳</span> {status}</>
                  : '🔗 Mint NFT ke Blockchain Polygon'
                }
              </button>
            )}

            {status && !txHash && !loading && (
              <p className="text-xs text-center mt-2 text-gray-500">{status}</p>
            )}
          </div>
        )}

        {/* Sukses */}
        {txHash && (
          <div className="bg-white rounded-2xl shadow p-5 border-2 border-green-500">
            <h2 className="text-base font-semibold text-green-800 mb-3">🎉 NFT Berhasil Di-mint!</h2>
            <div className="space-y-2">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                <p className="text-xs font-mono break-all text-green-700">{txHash}</p>
              </div>
              {cidFoto && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">CID Foto IPFS</p>
                  <p className="text-xs font-mono break-all text-blue-700">{cidFoto}</p>
                </div>
              )}
              <a
                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                target="_blank" rel="noreferrer"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition"
              >
                🔍 Verifikasi di Polygonscan
              </a>
              {cidFoto && (
                <a
                  href={`https://${PINATA_GATEWAY}/ipfs/${cidFoto}`}
                  target="_blank" rel="noreferrer"
                  className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-lg transition"
                >
                  🖼️ Lihat Foto di IPFS
                </a>
              )}
              <button
                onClick={() => {
                  setFoto(null); setPreview(null); setHasilCNN(null)
                  setTxHash(''); setCidFoto(''); setNamaPetani(''); setLokasi('')
                  setStatus(''); setErrorMsg('')
                }}
                className="w-full border border-gray-200 text-gray-500 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                ↩️ Klasifikasi Kopi Baru
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="bg-white rounded-xl shadow-sm p-4 text-xs text-gray-400 space-y-1">
          <p>🤖 Model: RepViT-M1.1 (CVPR 2024)</p>
          <p>⛓️ Blockchain: Polygon Amoy Testnet (Chain ID: 80002)</p>
          <p>📦 Storage: IPFS via Pinata</p>
          <p>🔬 Universitas Jember — Riset Scopus Q1</p>
        </div>

      </main>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${bold ? 'font-semibold' : ''}`}>{value}</span>
    </div>
  )
}
