'use client'

import { useState, useRef } from 'react'
import { ethers } from 'ethers'

// ============================================================
// KONFIGURASI — sesuaikan dengan data riset Anda
// ============================================================
const CONFIG = {
  HF_API_URL: 'https://jejenFis06-kopi-arabika-classifier.hf.space',
  PINATA_GATEWAY: 'rose-casual-warbler-710.mypinata.cloud',
  CONTRACT_ADDRESS: '0x53ff81292ea345d13da906e0f27794f8d5402853',
  POLYGON_AMOY_CHAIN_ID: '0x13882', // 80002 dalam hex
  ALCHEMY_RPC: 'https://polygon-amoy.g.alchemy.com/v2/coqrH17Ei58tkxqr3rIy4',
}

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

// Warna grade
const GRADE_STYLE = {
  Premium:  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', emoji: '🏆' },
  'Grade A': { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300',   emoji: '⭐' },
  'Grade B': { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300',  emoji: '✅' },
  'Grade C': { bg: 'bg-gray-100',   text: 'text-gray-800',   border: 'border-gray-300',   emoji: '⚠️' },
}

export default function HomePage() {
  // State
  const [foto, setFoto]               = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [hasilCNN, setHasilCNN]       = useState(null)
  const [mintStatus, setMintStatus]   = useState('')
  const [txHash, setTxHash]           = useState('')
  const [cidFoto, setCidFoto]         = useState('')
  const [namaPetani, setNamaPetani]   = useState('')
  const [lokasiKebun, setLokasiKebun] = useState('')
  const [walletAddr, setWalletAddr]   = useState('')
  const [step, setStep]               = useState(1)
  const fileRef = useRef()

  // ============================================================
  // STEP 1: Pilih foto
  // ============================================================
  function handleFotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
    setHasilCNN(null)
    setMintStatus('')
    setTxHash('')
  }

  // ============================================================
  // STEP 2: Klasifikasi CNN via Hugging Face API
  // ============================================================
  async function klasifikasiCNN() {
    if (!foto) return alert('Pilih foto kopi terlebih dahulu!')
    setLoading(true)
    setHasilCNN(null)
    setMintStatus('Mengklasifikasi foto dengan CNN RepViT...')

    try {
      const formData = new FormData()
      formData.append('data', foto)

      const response = await fetch(`${CONFIG.HF_API_URL}/run/predict`, {
        method: 'POST',
        body: JSON.stringify({
          data: [{ path: await fileToBase64(foto), mime_type: foto.type }]
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const result = await response.json()

      // Parse hasil dari Gradio API
      let hasilText = result.data?.[0] || ''
      let parsed = parseHasilCNN(hasilText)
      setHasilCNN(parsed)
      setStep(3)
      setMintStatus('')
    } catch (err) {
      console.error(err)
      setMintStatus('Error CNN: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  function parseHasilCNN(text) {
    const jenisMatch      = text.match(/JENIS KOPI\s+:\s+(.+)/)
    const confidenceMatch = text.match(/CONFIDENCE\s+:\s+([\d.]+)%/)
    const gradeMatch      = text.match(/GRADE\s+:\s+(.+)/)
    return {
      jenis_kopi:  jenisMatch?.[1]?.trim()      || 'Unknown',
      confidence:  parseFloat(confidenceMatch?.[1]) || 0,
      grade:       gradeMatch?.[1]?.trim()?.replace(/[^A-Za-z\s]/g, '').trim() || 'Grade B',
      raw:         text,
    }
  }

  // ============================================================
  // STEP 3: Upload ke IPFS via API route
  // ============================================================
  async function uploadIPFS() {
    setLoading(true)
    setMintStatus('Mengupload foto ke IPFS Pinata...')
    try {
      const b64 = await fileToBase64(foto)
      const res = await fetch('/api/upload-ipfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: b64,
          fileName: foto.name,
          hasilCNN,
          namaPetani,
          lokasiKebun,
        }),
      })
      const data = await res.json()
      if (!data.cidFoto) throw new Error(data.error || 'Upload gagal')
      setCidFoto(data.cidFoto)
      return data
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // STEP 4: Connect MetaMask
  // ============================================================
  async function connectWallet() {
    if (!window.ethereum) {
      alert('MetaMask tidak ditemukan! Install MetaMask di browser Anda.')
      return null
    }
    try {
      // Minta koneksi
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

      // Cek jaringan — harus Polygon Amoy
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== CONFIG.POLYGON_AMOY_CHAIN_ID) {
        // Auto switch ke Amoy
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.POLYGON_AMOY_CHAIN_ID }],
          })
        } catch {
          // Tambah jaringan Amoy jika belum ada
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: CONFIG.POLYGON_AMOY_CHAIN_ID,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://amoy.polygonscan.com'],
            }],
          })
        }
      }

      setWalletAddr(accounts[0])
      return accounts[0]
    } catch (err) {
      alert('Gagal connect wallet: ' + err.message)
      return null
    }
  }

  // ============================================================
  // STEP 5: Mint NFT
  // ============================================================
  async function mintNFT() {
    if (!namaPetani || !lokasiKebun) {
      alert('Isi nama petani dan lokasi kebun terlebih dahulu!')
      return
    }
    if (!hasilCNN) {
      alert('Lakukan klasifikasi CNN terlebih dahulu!')
      return
    }

    setLoading(true)
    try {
      // Connect wallet
      setMintStatus('Menghubungkan MetaMask...')
      const address = await connectWallet()
      if (!address) return

      // Upload IPFS
      setMintStatus('Mengupload foto ke IPFS...')
      const ipfsData = await uploadIPFS()

      // Mint NFT
      setMintStatus('Mengirim NFT ke Polygon Amoy...')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer   = await provider.getSigner()
      const contract = new ethers.Contract(
        CONFIG.CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )

      const tx = await contract.mintKopiNFT(
        address,
        ipfsData.cidFoto,
        `ipfs://${ipfsData.cidMetadata}`,
        hasilCNN.jenis_kopi,
        hasilCNN.grade,
        namaPetani,
        lokasiKebun,
        Math.round(hasilCNN.confidence)
      )

      setMintStatus('Menunggu konfirmasi blockchain...')
      const receipt = await tx.wait()
      setTxHash(receipt.hash)
      setStep(5)
      setMintStatus('NFT berhasil di-mint!')
    } catch (err) {
      console.error(err)
      setMintStatus('Error: ' + (err.reason || err.message))
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  const gradeStyle = hasilCNN ? (GRADE_STYLE[hasilCNN.grade] || GRADE_STYLE['Grade B']) : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50">

      {/* Header */}
      <header className="bg-green-800 text-white py-5 px-4 text-center shadow-lg">
        <h1 className="text-2xl font-bold">☕ Kopi Arabika Web3</h1>
        <p className="text-green-200 text-sm mt-1">
          Klasifikasi CNN RepViT + Sertifikasi Blockchain Polygon
        </p>
        <p className="text-green-300 text-xs mt-1">Universitas Jember</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Step 1 & 2: Upload & Data Petani */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-semibold text-green-800 mb-4">
            📸 Step 1 — Upload Foto Biji Kopi
          </h2>

          {/* Area upload foto */}
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center cursor-pointer hover:bg-green-50 transition mb-4"
          >
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Preview"
                className="mx-auto max-h-48 rounded-lg object-cover"
              />
            ) : (
              <div className="text-green-600">
                <div className="text-4xl mb-2">📷</div>
                <p className="font-medium">Klik untuk pilih foto</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG — foto biji kopi</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFotoChange}
            capture="environment"
          />

          {/* Data petani */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👤 Nama Petani
              </label>
              <input
                type="text"
                placeholder="Contoh: Pak Ahmad Fauzi"
                value={namaPetani}
                onChange={e => setNamaPetani(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📍 Lokasi Kebun
              </label>
              <input
                type="text"
                placeholder="Contoh: Desa Tugusari, Bondowoso, Jawa Timur"
                value={lokasiKebun}
                onChange={e => setLokasiKebun(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Tombol klasifikasi */}
          <button
            onClick={klasifikasiCNN}
            disabled={!foto || loading}
            className="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            {loading && step <= 2 ? '⏳ Mengklasifikasi...' : '🔍 Klasifikasi dengan CNN'}
          </button>
        </div>

        {/* Hasil CNN */}
        {hasilCNN && (
          <div className={`rounded-2xl shadow-md p-5 border ${gradeStyle.border} ${gradeStyle.bg}`}>
            <h2 className={`text-lg font-semibold mb-3 ${gradeStyle.text}`}>
              {gradeStyle.emoji} Hasil Klasifikasi CNN
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Jenis Kopi</span>
                <span className="font-semibold text-sm">{hasilCNN.jenis_kopi.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confidence CNN</span>
                <span className="font-semibold text-sm">{hasilCNN.confidence.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Grade Kualitas</span>
                <span className={`font-bold text-sm ${gradeStyle.text}`}>
                  {gradeStyle.emoji} {hasilCNN.grade}
                </span>
              </div>
              {/* Bar confidence */}
              <div className="mt-2">
                <div className="bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-green-500 transition-all"
                    style={{ width: `${hasilCNN.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tombol Mint NFT */}
            <button
              onClick={mintNFT}
              disabled={loading}
              className="w-full mt-4 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              {loading ? '⏳ ' + mintStatus : '🔗 Mint NFT ke Blockchain Polygon'}
            </button>

            {mintStatus && !txHash && (
              <p className="text-xs text-center mt-2 text-gray-600">{mintStatus}</p>
            )}
          </div>
        )}

        {/* Sukses NFT */}
        {txHash && (
          <div className="bg-white rounded-2xl shadow-md p-5 border border-green-400">
            <h2 className="text-lg font-semibold text-green-800 mb-3">
              🎉 NFT Berhasil Di-mint!
            </h2>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <p className="text-xs font-mono break-all text-green-700">{txHash}</p>
              </div>
              {cidFoto && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Foto di IPFS</p>
                  <p className="text-xs font-mono break-all text-blue-700">{cidFoto}</p>
                </div>
              )}
              <a
                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                🔍 Lihat di Polygonscan
              </a>
              <a
                href={`https://${CONFIG.PINATA_GATEWAY}/ipfs/${cidFoto}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                🖼️ Lihat Foto di IPFS
              </a>
              <button
                onClick={() => {
                  setFoto(null); setFotoPreview(null); setHasilCNN(null)
                  setMintStatus(''); setTxHash(''); setCidFoto('')
                  setNamaPetani(''); setLokasiKebun(''); setStep(1)
                }}
                className="w-full border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition"
              >
                ↩️ Klasifikasi Kopi Baru
              </button>
            </div>
          </div>
        )}

        {/* Info sistem */}
        <div className="bg-white rounded-2xl shadow-sm p-4 text-xs text-gray-500 space-y-1">
          <p>🤖 Model: RepViT-M1.1 (CVPR 2024)</p>
          <p>⛓️ Blockchain: Polygon Amoy Testnet</p>
          <p>📦 Storage: IPFS via Pinata</p>
          <p>🔬 Riset: Universitas Jember — Scopus Q1</p>
        </div>

      </main>
    </div>
  )
}
