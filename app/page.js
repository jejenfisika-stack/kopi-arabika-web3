'use client'

import { useState, useRef } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x5392C2F10d8Dea3e498726BcB8c806E8DA78834b'  // V3 — Open Mint + Verified + 6-Class Fix
const PINATA_GATEWAY   = 'rose-casual-warbler-710.mypinata.cloud'
const AMOY_CHAIN_ID    = '0x13882'

const CONTRACT_ABI = [
  // mintKopiNFT v2 — 9 parameter (tambah hashFoto)
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
      { name: 'hashFoto',         type: 'string'  }, // ← BARU di v2
    ],
    name: 'mintKopiNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // cekHashFoto — BARU di v2 (anti-duplikat)
  {
    inputs: [{ name: 'hashFoto', type: 'string' }],
    name: 'cekHashFoto',
    outputs: [
      { name: 'sudahAda',    type: 'bool'    },
      { name: 'tokenIdLama', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // getDataKopi v2 — tambah hashFoto di output
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getDataKopi',
    outputs: [
      { name: 'ipfsCID',     type: 'string'  },
      { name: 'jenisKopi',   type: 'string'  },
      { name: 'grade',       type: 'string'  },
      { name: 'namaPetani',  type: 'string'  },
      { name: 'lokasiKebun', type: 'string'  },
      { name: 'timestamp',   type: 'uint256' },
      { name: 'confidence',  type: 'uint256' },
      { name: 'hashFoto',    type: 'string'  },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // totalNFT
  {
    inputs: [],
    name: 'totalNFT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const GRADE_STYLE = {
  'Premium': { bg:'#FEF9C3', border:'#EAB308', text:'#713F12', emoji:'🏆' },
  'Grade A': { bg:'#EFF6FF', border:'#3B82F6', text:'#1E3A8A', emoji:'⭐' },
  'Grade B': { bg:'#F0FDF4', border:'#22C55E', text:'#14532D', emoji:'✅' },
  'Grade C': { bg:'#F9FAFB', border:'#9CA3AF', text:'#374151', emoji:'⚠️' },
}

const INFO_KOPI = [
  { emoji:'🌋', judul:'Arabika Natural Ijen',      color:'#B5793F', isi:'Ditanam di lereng Gunung Ijen, Bondowoso pada ketinggian 900–1.500 mdpl. Terkenal dengan cita rasa fruity dan wine-like yang khas dari proses natural.' },
  { emoji:'🫘', judul:'Arabika Peaberry',           color:'#8B5A2B', isi:'Biji kopi bulat tunggal hasil mutasi alami. Rasa lebih terkonsentrasi, aroma floral kuat, body lebih ringan dibanding biji normal.' },
  { emoji:'🧪', judul:'Arabika Anaerob Carbonic',   color:'#6F4E37', isi:'Diproses fermentasi anaerobik karbonasi. Menghasilkan rasa eksotis, kompleks — buah tropis dengan sparkling sensation yang unik.' },
  { emoji:'🍊', judul:'Arabika Orange Bourbon',     color:'#C9822E', isi:'Varietas Bourbon langka berwarna oranye. Rasa manis, citrus, honey, body sedang-tebal. Sangat diminati di pasar specialty coffee dunia.' },
  { emoji:'🏔️', judul:'Arabika Blue Mountain',     color:'#6F8FA8', isi:'Varietas premium adaptasi Jamaica. Rasa ringan, bersih, balance sempurna, tidak pahit. Salah satu kopi paling prestigious di dunia.' },
]

const CARA_PAKAI = [
  { no:'01', judul:'Upload Foto',        isi:'Klik area foto, pilih gambar biji kopi dari galeri HP atau ambil langsung dengan kamera.' },
  { no:'02', judul:'Isi Data Petani',    isi:'Masukkan nama petani dan lokasi kebun. Data ini akan tercatat dalam sertifikat NFT di blockchain.' },
  { no:'03', judul:'Klasifikasi CNN',    isi:'Klik tombol klasifikasi. Model AI RepViT-M1.1 mengidentifikasi jenis dan grade kopi dalam hitungan detik.' },
  { no:'04', judul:'Mint NFT',           isi:'Klik "Mint NFT". MetaMask terbuka untuk konfirmasi transaksi ke blockchain Polygon Amoy.' },
  { no:'05', judul:'Sertifikat Digital', isi:'NFT tersimpan permanen di blockchain sebagai bukti keaslian dan kualitas kopi Anda.' },
]

const TECH = [
  ['🤖', 'RepViT-M1.1', 'CNN CVPR 2024, akurasi 99.78%'],
  ['⛓️', 'Polygon Amoy', 'Blockchain testnet, standar ERC-721'],
  ['📦', 'Pinata IPFS', 'Penyimpanan gambar terdesentralisasi'],
  ['🦊', 'MetaMask', 'Dompet Web3 & tanda tangan transaksi'],
  ['🤗', 'Hugging Face', 'Inferensi AI server-side (API)'],
  ['▲', 'Vercel', 'Deployment edge global'],
]

const LAYERS = [
  ['Sidik Jari SHA-256', 'Setiap foto biji kopi dikonversi menjadi fingerprint kriptografis 256-bit unik via Web Cryptography API. Hash ini tidak dapat dibalik atau dipalsukan.', "crypto.subtle.digest('SHA-256', imageBuffer) → 64-char hex"],
  ['Registry On-Chain', 'Hash SHA-256 tersimpan dalam mapping registry di smart contract. Foto yang sama tidak bisa di-mint ulang — ditolak di level konsensus blockchain.', 'if (registry[hash] != 0) revert FotoDuplikat()'],
  ['Perceptual Hash', 'Average hash 16×16 piksel dibandingkan dengan Hamming distance. Jarak ≤5 bit menandai foto yang nyaris identik meski SHA-256-nya berbeda.', 'pHash(img1) XOR pHash(img2) → distance ≤5 = WARNING ⚠️'],
  ['Sertifikat ERC-721', 'Sertifikat NFT immutable menyimpan jenis kopi, grade, confidence CNN, nama petani, lokasi, timestamp, dan hash foto secara permanen di Polygon Amoy.', 'Token ID #N → ipfs://CID_metadata · immutable'],
  ['IPFS Content-Addressing', 'Foto & metadata disimpan via CID yang dihitung dari isi file. Jika file berubah, CID-nya berubah — manipulasi langsung terdeteksi.', 'CID = hash(content) via Pinata Gateway'],
  ['MetaMask ECDSA', 'Transaksi ditandatangani kriptografis oleh MetaMask; private key tetap di perangkat pengguna. Mendukung permissionless minting dengan audit trail.', 'ECDSA signature · private key never leaves device'],
  ['Deteksi OOD (AI)', 'Validasi 3 lapis: kelas "Non-Coffee" eksplisit, ambang confidence <60%, dan entropy >1.40. Test accuracy 99.78%, OOD recall 98.7%.', 'Non-Coffee / conf<60% / entropy>1.40 → DITOLAK'],
]

export default function HomePage() {
  const [foto, setFoto]             = useState(null)
  const [preview, setPreview]       = useState(null)
  const [namaPetani, setNamaPetani] = useState('')
  const [lokasi, setLokasi]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [status, setStatus]         = useState('')
  const [hasilCNN, setHasilCNN]     = useState(null)
  const [txHash, setTxHash]         = useState('')
  const [cidFoto, setCidFoto]       = useState('')
  const [errorMsg, setErrorMsg]     = useState('')
  const [tokenId, setTokenId]       = useState(null)
  const [addingNFT, setAddingNFT]   = useState(false)
  const [nftAdded, setNftAdded]     = useState(false)
  const [fotoHash, setFotoHash]     = useState('')
  const [duplikat, setDuplikat]     = useState(null)
  const [verifying, setVerifying]   = useState(false)
  const [bukanKopi, setBukanKopi]   = useState(false)
  const [walletAddr, setWalletAddr] = useState('')
  const [walletLoading, setWalletLoading] = useState(false)
  const fileRef = useRef()

  // ============================================================
  // Connect / Disconnect Wallet
  // ============================================================
  async function handleConnectWallet() {
    if (walletAddr) { setWalletAddr(''); return }
    if (!window.ethereum) {
      alert('MetaMask tidak ditemukan!\nInstall MetaMask dari metamask.io')
      return
    }
    setWalletLoading(true)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const chainId  = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== AMOY_CHAIN_ID) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY_CHAIN_ID }] })
        } catch {
          await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: AMOY_CHAIN_ID, chainName: 'Polygon Amoy Testnet', nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 }, rpcUrls: ['https://rpc-amoy.polygon.technology'], blockExplorerUrls: ['https://amoy.polygonscan.com'] }] })
        }
      }
      setWalletAddr(accounts[0])
      window.ethereum.on('accountsChanged', accs => setWalletAddr(accs[0] || ''))
      window.ethereum.on('chainChanged', () => window.location.reload())
    } catch (err) {
      alert('Gagal connect: ' + err.message)
    } finally {
      setWalletLoading(false)
    }
  }

  function shortAddr(addr) {
    return addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : ''
  }

  // ============================================================
  // Hitung SHA-256 hash dari file foto (fingerprint unik)
  // ============================================================
  async function hitungHashFoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const buffer   = e.target.result
          const hashBuf  = await crypto.subtle.digest('SHA-256', buffer)
          const hashArr  = Array.from(new Uint8Array(hashBuf))
          const hashHex  = hashArr.map(b => b.toString(16).padStart(2, '0')).join('')
          resolve(hashHex)
        } catch(err) { reject(err) }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  // ============================================================
  // Cek duplikat via smart contract (hashFoto sudah pernah di-mint?)
  // ============================================================
  async function cekDuplikatOnChain(hashHex) {
    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.JsonRpcProvider(
        'https://polygon-amoy.g.alchemy.com/v2/coqrH17Ei58tkxqr3rIy4'
      )
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const [sudahAda, tokenIdLama] = await contract.cekHashFoto(hashHex)
      return { sudahAda, tokenIdLama: Number(tokenIdLama) }
    } catch(err) {
      console.log('cekDuplikat error (contract mungkin belum punya fungsi ini):', err.message)
      return { sudahAda: false, tokenIdLama: 0 }
    }
  }

  // ============================================================
  // Hitung Perceptual Hash sederhana (untuk deteksi foto serupa)
  // ============================================================
  async function hitungPHash(file) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        try {
          const SIZE = 16
          const canvas = document.createElement('canvas')
          canvas.width = SIZE; canvas.height = SIZE
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, SIZE, SIZE)
          const data  = ctx.getImageData(0, 0, SIZE, SIZE).data
          const grays = []
          for (let i = 0; i < data.length; i += 4) {
            grays.push(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2])
          }
          const avg  = grays.reduce((a, b) => a + b, 0) / grays.length
          const bits = grays.map(g => g >= avg ? '1' : '0').join('')
          let hex = ''
          for (let i = 0; i < bits.length; i += 4) {
            hex += parseInt(bits.slice(i, i+4), 2).toString(16)
          }
          resolve(hex)
        } catch(e) { resolve('') }
      }
      img.onerror = () => resolve('')
      img.src = URL.createObjectURL(file)
    })
  }

  // ============================================================
  // Hitung jarak Hamming antara 2 pHash (0 = identik, >10 = berbeda)
  // ============================================================
  function hammingDistance(h1, h2) {
    if (!h1 || !h2 || h1.length !== h2.length) return 999
    let dist = 0
    for (let i = 0; i < h1.length; i++) {
      const b1 = parseInt(h1[i], 16).toString(2).padStart(4,'0')
      const b2 = parseInt(h2[i], 16).toString(2).padStart(4,'0')
      for (let j = 0; j < 4; j++) if (b1[j] !== b2[j]) dist++
    }
    return dist
  }

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file); setPreview(URL.createObjectURL(file))
    setHasilCNN(null); setTxHash(''); setCidFoto(''); setErrorMsg('')
    setStatus(''); setDuplikat(null); setFotoHash(''); setBukanKopi(false)

    hitungHashFoto(file).then(hash => {
      setFotoHash(hash)
      console.log('SHA-256 foto:', hash)
    }).catch(err => console.log('Hash error:', err))
  }

  function parseOutput(text) {
    if (!text || text.trim().length === 0) {
      return { bukan_kopi: true, alasan: 'Output kosong dari model', raw: text }
    }

    console.log('parseOutput text:', text.substring(0, 300))

    const REJECTION_KEYWORDS = [
      'BUKAN BIJI KOPI',
      'GAMBAR TIDAK DAPAT DIKLASIFIKASI',
      'CONFIDENCE TERLALU RENDAH',
      'MODEL TIDAK YAKIN',
    ]
    const isExplicitRejection = REJECTION_KEYWORDS.some(kw => text.toUpperCase().includes(kw.toUpperCase()))

    if (isExplicitRejection) {
      const confMatch = text.match(/Confidence[^:]*:\s*([\d.]+)%/i)
      const confVal   = parseFloat(confMatch?.[1]) || 0
      const alasanMatch = text.match(/Alasan[^:]*:\s*(.+)/i)
      const alasan    = alasanMatch?.[1]?.trim() || 'Model menolak gambar'
      return { bukan_kopi: true, confidence: confVal, alasan, raw: text }
    }

    const jenisMatch = (
      text.match(/JENIS KOPI\s*:\s*(.+)/i) ||
      text.match(/☕ JENIS KOPI\s*:\s*(.+)/i)
    )
    const confMatch = (
      text.match(/CONFIDENCE\s*:\s*([\d.]+)%/i) ||
      text.match(/📊 CONFIDENCE\s*:\s*([\d.]+)%/i)
    )
    const gradeMatch = (
      text.match(/GRADE\s*:\s*([A-Za-z][A-Za-z\s]+)/i) ||
      text.match(/[🏆⭐✅⚠️]\s*GRADE\s*:\s*([A-Za-z][A-Za-z\s]+)/i)
    )

    const jenis      = jenisMatch?.[1]?.trim() || ''
    const confidence = parseFloat(confMatch?.[1]) || 0
    let   grade      = gradeMatch?.[1]?.trim()?.replace(/[^\w\s]/g,'').trim() || 'Grade B'
    if (!GRADE_STYLE[grade]) grade = 'Grade B'

    console.log('Parsed → jenis:', jenis, 'conf:', confidence, 'grade:', grade)

    if (!jenis && confidence === 0) {
      console.warn('Parsing gagal, raw text:', text.substring(0, 200))
      const hasPositiveSign = text.includes('Arabica') || text.includes('Arabika') || text.includes('Premium') || text.includes('Grade')
      if (!hasPositiveSign) {
        return { bukan_kopi: true, alasan: 'Format output tidak dikenali', raw: text }
      }
    }

    if (confidence > 0 && confidence < 40) {
      return {
        bukan_kopi: true,
        confidence,
        alasan: `confidence terlalu rendah (${confidence.toFixed(1)}% < 40%)`,
        raw: text
      }
    }

    return { bukan_kopi: false, jenis_kopi: jenis, confidence, grade }
  }

  async function klasifikasiCNN() {
    if (!foto) { alert('Pilih foto kopi terlebih dahulu!'); return }
    setLoading(true); setHasilCNN(null); setErrorMsg(''); setDuplikat(null)

    // ── Verifikasi foto sebelum klasifikasi ──
    try {
      setStatus('🔍 Memverifikasi keaslian foto...')
      const hash = fotoHash || await hitungHashFoto(foto)
      if (!fotoHash) setFotoHash(hash)

      setVerifying(true)
      const { sudahAda, tokenIdLama } = await cekDuplikatOnChain(hash)
      setVerifying(false)

      if (sudahAda) {
        setDuplikat({
          tipe: 'IDENTIK',
          tokenId: tokenIdLama,
          hash,
          pesan: `Foto ini IDENTIK dengan NFT #${tokenIdLama} yang sudah ada di blockchain!`,
          icon: '🚫'
        })
        setLoading(false)
        return
      }

      const pHash = await hitungPHash(foto)
      const pHashLama = localStorage.getItem('lastPHash')
      if (pHashLama && pHash) {
        const dist = hammingDistance(pHash, pHashLama)
        console.log('Hamming distance:', dist)
        if (dist <= 5) {
          setDuplikat({
            tipe: 'MIRIP',
            dist,
            hash,
            pesan: `Foto ini SANGAT MIRIP dengan foto yang baru-baru ini diproses (jarak: ${dist}/64). Pastikan ini foto yang berbeda!`,
            icon: '⚠️'
          })
        }
      }
      if (pHash) localStorage.setItem('lastPHash', pHash)

    } catch(err) {
      console.log('Verifikasi error:', err)
      setVerifying(false)
    }
    try {
      const BASE = 'https://jejenFis06-kopi-arabika-classifier.hf.space'
      setStatus('Mengunggah foto ke model AI...')
      const fd = new FormData(); fd.append('files', foto, foto.name)
      const upRes = await fetch(`${BASE}/gradio_api/upload`, { method:'POST', body:fd })
      if (!upRes.ok) throw new Error(`Upload gagal: ${upRes.status}`)
      const paths = await upRes.json()
      const filePath = paths?.[0]
      if (!filePath) throw new Error('Path file tidak ditemukan')

      setStatus('Mengklasifikasi dengan CNN RepViT-M1.1...')
      const prRes = await fetch(`${BASE}/gradio_api/call/klasifikasi_kopi`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ data:[{ path:filePath, mime_type:foto.type, orig_name:foto.name }] }),
      })
      if (!prRes.ok) throw new Error(`Predict gagal: ${prRes.status}`)
      const { event_id } = await prRes.json()
      if (!event_id) throw new Error('event_id tidak ditemukan')

      setStatus('Menunggu hasil AI...')
      const resRes = await fetch(`${BASE}/gradio_api/call/klasifikasi_kopi/${event_id}`)
      if (!resRes.ok) throw new Error(`Hasil gagal: ${resRes.status}`)

      const reader = resRes.body.getReader()
      const dec    = new TextDecoder()
      let out = ''; let buf = ''

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
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
              if (typeof parsed[0] === 'string' && parsed[0].length > 0) {
                out = parsed[0]
              } else if (parsed[0] && typeof parsed[0] === 'object') {
                out = JSON.stringify(parsed[0])
              }
            } else if (typeof parsed === 'string') {
              out = parsed
            }
          } catch (_) {}
        }
      }

      console.log('Raw output dari HF:', out?.substring(0, 200))

      if (!out || out.trim().length === 0) {
        throw new Error('Tidak ada output dari CNN — cek Hugging Face Space')
      }
      const parsed = parseOutput(out)
      console.log('CNN parsed:', parsed)
      if (parsed && parsed.bukan_kopi) {
        setBukanKopi(true)
        setHasilCNN(null)
      } else if (parsed) {
        setBukanKopi(false)
        setHasilCNN(parsed)
      } else {
        setErrorMsg('Gagal parsing hasil CNN')
      }
      setStatus('')
    } catch(err) { setErrorMsg(`Error: ${err.message}`); setStatus('') }
    finally { setLoading(false) }
  }

  async function uploadIPFS() {
    setStatus('Mengupload foto ke IPFS...')
    const b64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(foto) })
    const res = await fetch('/api/upload-ipfs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ imageBase64:b64, fileName:foto.name, hasilCNN, namaPetani, lokasiKebun:lokasi, hashFoto:fotoHash }) })
    const data = await res.json()
    if (!data.cidFoto) throw new Error(data.error||'Upload IPFS gagal')
    setCidFoto(data.cidFoto); return data
  }

  async function connectWallet() {
    if (!window.ethereum) { alert('Install MetaMask terlebih dahulu!'); return null }
    const accounts = await window.ethereum.request({ method:'eth_requestAccounts' })
    const chainId  = await window.ethereum.request({ method:'eth_chainId' })
    if (chainId !== AMOY_CHAIN_ID) {
      try { await window.ethereum.request({ method:'wallet_switchEthereumChain', params:[{ chainId:AMOY_CHAIN_ID }] }) }
      catch { await window.ethereum.request({ method:'wallet_addEthereumChain', params:[{ chainId:AMOY_CHAIN_ID, chainName:'Polygon Amoy Testnet', nativeCurrency:{ name:'POL', symbol:'POL', decimals:18 }, rpcUrls:['https://rpc-amoy.polygon.technology'], blockExplorerUrls:['https://amoy.polygonscan.com'] }] }) }
    }
    return accounts[0]
  }

  async function mintNFT() {
    if (!namaPetani.trim()) { alert('Isi Nama Petani!'); return }
    if (!lokasi.trim())     { alert('Isi Lokasi Kebun!'); return }
    if (!hasilCNN)          { alert('Klasifikasi CNN dulu!'); return }
    setLoading(true); setErrorMsg('')
    try {
      setStatus('Menghubungkan MetaMask...')
      const address = await connectWallet(); if (!address) return
      const ipfsData = await uploadIPFS()
      setStatus('Mengirim transaksi ke Polygon Amoy...')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer   = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      // ── Get current gas price dari network + safety margin ──
      let gasOverrides = {}
      try {
        const feeData = await provider.getFeeData()
        const minGas = ethers.parseUnits('30', 'gwei')
        const networkGas = feeData.gasPrice || feeData.maxFeePerGas || minGas
        const finalGas = networkGas < minGas ? minGas : networkGas
        gasOverrides = {
          maxFeePerGas:         finalGas,
          maxPriorityFeePerGas: finalGas,
        }
        console.log('Gas price set to:', ethers.formatUnits(finalGas, 'gwei'), 'Gwei')
      } catch(e) {
        gasOverrides = {
          maxFeePerGas:         ethers.parseUnits('30', 'gwei'),
          maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'),
        }
      }

      const tx = await contract.mintKopiNFT(
        address, ipfsData.cidFoto, `ipfs://${ipfsData.cidMetadata}`,
        hasilCNN.jenis_kopi, hasilCNN.grade, namaPetani, lokasi,
        Math.round(hasilCNN.confidence),
        fotoHash,
        gasOverrides
      )
      setStatus('Menunggu konfirmasi blockchain...')
      const receipt = await tx.wait()
      setTxHash(receipt.hash)

      let mintedTokenId = null
      try {
        const transferTopic = ethers.id('Transfer(address,address,uint256)')
        const transferLog = receipt.logs.find(log =>
          log.topics[0] === transferTopic &&
          log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
        )
        if (transferLog) {
          mintedTokenId = parseInt(transferLog.topics[3], 16)
          setTokenId(mintedTokenId)
        }
      } catch(e) { console.warn('Gagal ambil tokenId:', e) }

      if (mintedTokenId !== null && window.ethereum) {
        setStatus('Menambahkan NFT ke MetaMask...')
        try {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC721',
              options: {
                address: CONTRACT_ADDRESS,
                tokenId: String(mintedTokenId),
              },
            },
          })
        } catch(e) {
          console.warn('wallet_watchAsset tidak didukung:', e)
        }
      }

      setStatus('')
    } catch(err) { setErrorMsg('Error: '+(err.reason||err.message)); setStatus('') }
    finally { setLoading(false) }
  }

  // ============================================================
  // Tambah NFT ke MetaMask Wallet
  // ============================================================
  async function addNFTtoWallet() {
    if (!window.ethereum) {
      alert('MetaMask tidak ditemukan!')
      return
    }
    if (!tokenId && tokenId !== 0) {
      alert('Token ID tidak ditemukan. Coba import manual.')
      return
    }
    setAddingNFT(true)
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== AMOY_CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AMOY_CHAIN_ID }]
        })
      }

      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: CONTRACT_ADDRESS,
            tokenId: String(tokenId),
          },
        },
      })

      if (wasAdded) {
        setNftAdded(true)
      } else {
        alert('NFT tidak ditambahkan. Coba import manual.')
      }
    } catch (err) {
      console.error(err)
      if (err.code === 4001) {
        alert('Ditolak user.')
      } else {
        alert('Gunakan cara manual: MetaMask → NFTs → Import NFT\n' +
              'Contract: ' + CONTRACT_ADDRESS + '\n' +
              'Token ID: ' + tokenId)
      }
    } finally {
      setAddingNFT(false)
    }
  }

  function resetAll() {
    setFoto(null); setPreview(null); setHasilCNN(null)
    setTxHash(''); setCidFoto(''); setNamaPetani(''); setLokasi('')
    setStatus(''); setErrorMsg(''); setTokenId(null); setNftAdded(false)
    setBukanKopi(false); setDuplikat(null); setFotoHash('')
  }

  // Safe null check untuk gs — hindari crash saat hasilCNN null
  const gs = (hasilCNN && !hasilCNN.bukan_kopi)
    ? (GRADE_STYLE[hasilCNN.grade] || GRADE_STYLE['Grade B'])
    : GRADE_STYLE['Grade B']

  return (
    <main className="container">
      {/* ---------- Top bar ---------- */}
      <header className="topbar">
        <div className="brand">
          <div className="logo">☕</div>
          <div>
            <h1>Kopi Arabika Web3</h1>
            <p>Riset Unggulan · Universitas Jember</p>
          </div>
        </div>
        <button
          className={`pill wallet ${walletAddr ? 'connected' : ''}`}
          onClick={handleConnectWallet}
          disabled={walletLoading}
        >
          {walletLoading
            ? '⏳ Menghubungkan...'
            : walletAddr
              ? `🦊 ${shortAddr(walletAddr)} · Disconnect`
              : '🦊 Connect Wallet'}
        </button>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <h2>Klasifikasi Kopi Arabika dengan AI</h2>
        <p className="sub">
          5 varietas arabika unggulan terverifikasi AI &amp; tercatat di blockchain.
          Deteksi jenis &amp; grade kopi secara cepat, transparan, dan terdesentralisasi
          untuk kopi specialty Nusantara.
        </p>
        <div className="badges">
          <span className="badge2">🏆 RepViT-M1.1 · 6-Class · 99.78%</span>
          <span className="badge2">⛓️ Polygon Amoy</span>
          <span className="badge2">📦 IPFS Pinata</span>
        </div>
        <div className="blocks">
          <div className="block"><b>HASH</b>{fotoHash ? `${fotoHash.slice(0,8)}…${fotoHash.slice(-3)}` : '0xa3f…9c2'}</div>
          <div className="block"><b>SERTIFIKAT</b>{tokenId != null ? `#${tokenId}` : '#0042'}</div>
          <div className="block"><b>DIAGNOSIS</b>{hasilCNN ? 'Verified ✓' : 'Menunggu'}</div>
        </div>
      </section>

      {/* ---------- Classifier ---------- */}
      <section className="section" id="cek">
        <div className="section-head"><span className="ic">🔬</span><h3>Cek Kualitas Biji Kopi dengan AI</h3></div>
        <p className="section-sub">
          Unggah foto biji kopi arabika — model RepViT akan mengklasifikasikan jenis &amp; grade,
          dan otomatis menolak gambar yang bukan biji kopi.
        </p>
        <div className="card">
          <div className="drop" onClick={() => fileRef.current.click()}>
            {preview
              ? <img className="preview" src={preview} alt="preview" />
              : <><div className="icon">📷</div><p><strong>Klik untuk unggah foto</strong></p><p>Dari kamera HP atau galeri · JPG, PNG</p></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} capture="environment" />

          <div className="field">
            <label>👤 Nama Petani</label>
            <input placeholder="Contoh: Pak Ahmad Fauzi" value={namaPetani} onChange={e => setNamaPetani(e.target.value)} />
          </div>
          <div className="field">
            <label>📍 Lokasi Kebun</label>
            <input placeholder="Contoh: Desa Tugusari, Bondowoso, Jawa Timur" value={lokasi} onChange={e => setLokasi(e.target.value)} />
          </div>

          <div className="row">
            <button className="btn btn-primary" onClick={klasifikasiCNN} disabled={!foto || loading}>
              {loading && !hasilCNN
                ? <><span className="spinner" /> {status || 'Memproses...'}</>
                : <>🔍 Klasifikasi dengan CNN</>}
            </button>
          </div>

          {errorMsg && <div className="alert alert-err">{errorMsg}</div>}

          {/* Info hash foto */}
          {fotoHash && !duplikat && (
            <div className="alert alert-info">
              <b>🔐 Fingerprint SHA-256 Foto</b>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, wordBreak: 'break-all', marginTop: 3 }}>
                {fotoHash.slice(0, 32)}…{fotoHash.slice(-8)}
              </div>
              <div className="note" style={{ marginTop: 3 }}>Hash unik ini membuktikan keaslian foto Anda di blockchain.</div>
            </div>
          )}

          {/* Peringatan / blokir duplikat */}
          {duplikat && (
            <div className={`alert ${duplikat.tipe === 'IDENTIK' ? 'alert-err' : 'alert-warn'}`}>
              <b>{duplikat.icon} {duplikat.tipe === 'IDENTIK' ? 'FOTO TERDETEKSI DUPLIKAT!' : 'PERINGATAN: Foto Sangat Mirip'}</b>
              <div style={{ marginTop: 4 }}>{duplikat.pesan}</div>
              {duplikat.tokenId && (
                <a href={`https://amoy.polygonscan.com/token/${CONTRACT_ADDRESS}?a=${duplikat.tokenId}`}
                   target="_blank" rel="noreferrer"
                   style={{ display: 'block', marginTop: 8, fontWeight: 700 }}>
                  🔍 Lihat NFT Asli #{duplikat.tokenId} di Polygonscan →
                </a>
              )}
              {duplikat.tipe === 'IDENTIK' && (
                <div style={{ marginTop: 8, fontWeight: 700 }}>❌ Foto ini tidak dapat di-mint ulang — sudah terdaftar di blockchain.</div>
              )}
            </div>
          )}

          {/* Bukan biji kopi */}
          {bukanKopi && !hasilCNN && (
            <div className="alert alert-warn" style={{ marginTop: 14 }}>
              <b style={{ fontSize: 15 }}>🚫 Gambar Tidak Dapat Diklasifikasi</b>
              <p style={{ marginTop: 6 }}>
                Model CNN RepViT-M1.1 tidak mendeteksi ciri-ciri biji kopi Arabika pada gambar Anda.
                Sistem otomatis menolak gambar yang tidak sesuai untuk mencegah klasifikasi yang salah.
              </p>
              <div style={{ marginTop: 10, fontWeight: 700 }}>✅ Panduan foto yang benar:</div>
              <ul style={{ margin: '6px 0 0 18px', fontSize: 13 }}>
                <li>Foto biji kopi Arabika (belum digiling/diseduh)</li>
                <li>Pencahayaan cukup, latar polos, fokus jelas</li>
                <li>Ambil dari atas (top-view) lebih baik</li>
                <li>Hindari foto minuman/bubuk kopi atau tanaman kopi</li>
              </ul>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={resetAll}>
                📷 Upload Foto Biji Kopi yang Benar
              </button>
            </div>
          )}

          {/* Hasil CNN */}
          {hasilCNN && !txHash && (
            <div style={{ marginTop: 16, background: gs.bg, border: `1px solid ${gs.border}`, borderTop: `3px solid ${gs.border}`, borderRadius: 14, padding: 18 }}>
              <div className="result-head">
                <span className="result-label" style={{ color: gs.text }}>{gs.emoji} {hasilCNN.jenis_kopi.replace(/_/g, ' ')}</span>
              </div>
              <div className="hasil-row"><span className="lbl">Confidence CNN</span><span className="val">{hasilCNN.confidence.toFixed(2)}%</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${hasilCNN.confidence}%`, background: gs.border }} /></div>
              <div className="hasil-row"><span className="lbl">Grade Kualitas</span><span className="val" style={{ color: gs.text }}>{gs.emoji} {hasilCNN.grade}</span></div>
              <div className="hasil-row"><span className="lbl">Model AI</span><span className="val" style={{ fontSize: 12 }}>RepViT-M1.1 (CVPR 2024)</span></div>
              <button className="btn btn-mint" style={{ marginTop: 14 }} onClick={mintNFT} disabled={loading}>
                {loading ? <><span className="spinner" /> {status}</> : <>🔗 Mint NFT ke Blockchain Polygon</>}
              </button>
              {status && !loading && <p className="note" style={{ textAlign: 'center' }}>{status}</p>}
              {errorMsg && <div className="alert alert-err">{errorMsg}</div>}
            </div>
          )}

          {/* Sukses NFT */}
          {txHash && (
            <div className="alert alert-ok" style={{ marginTop: 16, padding: 18 }}>
              <b style={{ fontSize: 18 }}>🎉 NFT Berhasil Di-mint!</b>
              {tokenId !== null && (
                <div className="hash-box" style={{ marginTop: 10 }}>
                  <div className="k">🏷️ Token ID NFT Anda</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#14532D', fontFamily: 'ui-monospace, monospace' }}>#{tokenId}</div>
                </div>
              )}
              <div className="hash-box"><div className="k">Transaction Hash</div><div className="v">{txHash}</div></div>
              {cidFoto && <div className="hash-box"><div className="k">CID Foto IPFS</div><div className="v">{cidFoto}</div></div>}

              {!nftAdded ? (
                <button className="btn btn-mint" onClick={addNFTtoWallet} disabled={addingNFT} style={{ marginTop: 6 }}>
                  {addingNFT ? <><span className="spinner" /> Menambahkan ke wallet...</> : <>🦊 Tambah NFT ke MetaMask Wallet</>}
                </button>
              ) : (
                <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 700, color: '#14532D' }}>
                  ✅ NFT berhasil masuk ke MetaMask! Buka tab <b>NFTs</b> untuk melihat.
                </div>
              )}

              <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="link-btn link-blue">🔍 Verifikasi di Polygonscan</a>
              {cidFoto && <a href={`https://${PINATA_GATEWAY}/ipfs/${cidFoto}`} target="_blank" rel="noreferrer" className="link-btn link-amber">🖼️ Lihat Foto di IPFS</a>}
              <button className="link-btn link-ghost" onClick={resetAll}>↩️ Klasifikasi Kopi Baru</button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- 5 Varietas ---------- */}
      <section className="section">
        <div className="section-head"><span className="ic">🍒</span><h3>5 Varietas yang Dikenali</h3></div>
        <p className="section-sub">
          Model dilatih mengenali lima varietas arabika unggulan, lengkap dengan karakter rasa khasnya.
        </p>
        <div className="grid">
          {INFO_KOPI.map((k, i) => (
            <div className="variety" key={i} style={{ '--c': k.color }}>
              <div className="dh"><span className="emoji">{k.emoji}</span><h4>{k.judul}</h4></div>
              <p>{k.isi}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Cara pakai ---------- */}
      <section className="section">
        <div className="section-head"><span className="ic">📋</span><h3>Cara Menggunakan</h3></div>
        <p className="section-sub">Lima langkah dari foto biji kopi hingga sertifikat digital di blockchain.</p>
        <div className="steps">
          {CARA_PAKAI.map((c, i) => (
            <div className="step" key={i}>
              <div className="n">{i + 1}</div>
              <h5>{c.judul}</h5>
              <p>{c.isi}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Teknologi ---------- */}
      <section className="section">
        <div className="section-head"><span className="ic">🛠️</span><h3>Tumpukan Teknologi</h3></div>
        <p className="section-sub">Komponen inti yang menyusun sistem Kopi Arabika Web3.</p>
        <div className="tech">
          {TECH.map(([e, t, p], i) => (
            <div className="techc" key={i}>
              <span className="te">{e}</span>
              <div><h5>{t}</h5><p>{p}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Keamanan ---------- */}
      <section className="section">
        <div className="section-head"><span className="ic">🛡️</span><h3>Arsitektur Keamanan</h3></div>
        <p className="section-sub">
          Tujuh lapis pertahanan untuk menjamin keaslian foto, integritas data, dan validitas sertifikat kopi.
        </p>
        <div className="layers">
          {LAYERS.map(([t, p, code], i) => (
            <div className="layer" key={i}>
              <div className="lh"><span className="chk">✓</span><h5>{t}</h5></div>
              <p>{p}</p>
              {code && <div className="code">{code}</div>}
            </div>
          ))}
        </div>
        <div className="scorecard">
          <div>
            <div className="big">7/7 Lapis Aktif</div>
            <div style={{ opacity: .9, fontSize: 13 }}>Sistem pertahanan berlapis melindungi setiap sertifikat kopi.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: .85 }}>Smart Contract V3 (Polygon Amoy)</div>
            <a href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}#code`} target="_blank" rel="noreferrer">
              {CONTRACT_ADDRESS.slice(0, 6)}…{CONTRACT_ADDRESS.slice(-5)} ↗
            </a>
          </div>
        </div>
      </section>

      <p className="footer">
        ☕ <b>Kopi Arabika Web3</b> — Klasifikasi Kopi Arabika berbasis AI &amp; Blockchain ·
        Model RepViT-M1.1 di Hugging Face Space (server-side) ·
        Jaringan Polygon Amoy Testnet · Universitas Jember
      </p>
    </main>
  )
}
