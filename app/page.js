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
  { emoji:'🌋', judul:'Arabika Natural Ijen',      isi:'Ditanam di lereng Gunung Ijen, Bondowoso pada ketinggian 900–1.500 mdpl. Terkenal dengan cita rasa fruity dan wine-like yang khas dari proses natural.' },
  { emoji:'🫘', judul:'Arabika Peaberry',           isi:'Biji kopi bulat tunggal hasil mutasi alami. Rasa lebih terkonsentrasi, aroma floral kuat, body lebih ringan dibanding biji normal.' },
  { emoji:'🧪', judul:'Arabika Anaerob Carbonic',   isi:'Diproses fermentasi anaerobik karbonasi. Menghasilkan rasa eksotis, kompleks — buah tropis dengan sparkling sensation yang unik.' },
  { emoji:'🍊', judul:'Arabika Orange Bourbon',     isi:'Varietas Bourbon langka berwarna oranye. Rasa manis, citrus, honey, body sedang-tebal. Sangat diminati di pasar specialty coffee dunia.' },
  { emoji:'🏔️', judul:'Arabika Blue Mountain',     isi:'Varietas premium adaptasi Jamaica. Rasa ringan, bersih, balance sempurna, tidak pahit. Salah satu kopi paling prestigious di dunia.' },
]

const CARA_PAKAI = [
  { no:'01', judul:'Upload Foto',        isi:'Klik area foto di kanan, pilih gambar biji kopi dari galeri HP atau ambil langsung dengan kamera.' },
  { no:'02', judul:'Isi Data Petani',    isi:'Masukkan nama petani dan lokasi kebun. Data ini akan tercatat dalam sertifikat NFT di blockchain.' },
  { no:'03', judul:'Klasifikasi CNN',    isi:'Klik tombol hijau. Model AI RepViT-M1.1 mengidentifikasi jenis dan grade kopi dalam hitungan detik.' },
  { no:'04', judul:'Mint NFT',           isi:'Klik "Mint NFT". MetaMask terbuka untuk konfirmasi transaksi ke blockchain Polygon Amoy.' },
  { no:'05', judul:'Sertifikat Digital', isi:'NFT tersimpan permanen di blockchain sebagai bukti keaslian dan kualitas kopi Anda.' },
]


// ============================================================
// BLOCKCHAIN DOODLE BACKGROUND
// ============================================================
function BlockchainDoodle() {
  return (
    <div className="bg-doodle" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C8E6C9" strokeWidth="0.5" opacity="0.6"/>
          </pattern>
        </defs>

        {/* Base background gradient */}
        <rect width="1440" height="900" fill="url(#bgGrad)"/>
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F8E9"/>
            <stop offset="40%" stopColor="#E8F5E9"/>
            <stop offset="100%" stopColor="#F3E5F5"/>
          </linearGradient>
        </defs>

        {/* Grid dots pattern */}
        <rect width="1440" height="900" fill="url(#grid)" opacity="0.5"/>

        {/* ===== BLOCKCHAIN NODES & CONNECTIONS ===== */}

        {/* Connection lines - main chain */}
        <g stroke="#81C784" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5" fill="none">
          <line x1="120" y1="180" x2="280" y2="260"/>
          <line x1="280" y1="260" x2="480" y2="200"/>
          <line x1="480" y1="200" x2="650" y2="310"/>
          <line x1="650" y1="310" x2="850" y2="240"/>
          <line x1="850" y1="240" x2="1050" y2="320"/>
          <line x1="1050" y1="320" x2="1240" y2="210"/>
          <line x1="1240" y1="210" x2="1380" y2="280"/>
          <line x1="200" y1="500" x2="400" y2="580"/>
          <line x1="400" y1="580" x2="600" y2="510"/>
          <line x1="600" y1="510" x2="800" y2="600"/>
          <line x1="800" y1="600" x2="1000" y2="520"/>
          <line x1="1000" y1="520" x2="1200" y2="620"/>
          <line x1="1200" y1="620" x2="1400" y2="550"/>
        </g>

        {/* Cross connections */}
        <g stroke="#A5D6A7" strokeWidth="1" strokeDasharray="4,6" opacity="0.3" fill="none">
          <line x1="280" y1="260" x2="400" y2="580"/>
          <line x1="650" y1="310" x2="600" y2="510"/>
          <line x1="850" y1="240" x2="800" y2="600"/>
          <line x1="1050" y1="320" x2="1000" y2="520"/>
        </g>

        {/* ===== BLOCK NODES — kotak blockchain ===== */}
        {/* Node 1 */}
        <g transform="translate(80,150)">
          <rect width="80" height="60" rx="8" fill="#FFFFFF" stroke="#4CAF50" strokeWidth="1.5" filter="url(#shadow)"/>
          <rect width="80" height="16" rx="8" fill="#4CAF50" opacity="0.15"/>
          <text x="40" y="11" textAnchor="middle" fontSize="8" fill="#2E7D32" fontWeight="700" fontFamily="monospace">BLOCK #001</text>
          <text x="40" y="30" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">Hash: 0xa3f...</text>
          <text x="40" y="42" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">Kopi: Arabika</text>
          <text x="40" y="54" textAnchor="middle" fontSize="7" fill="#4CAF50" fontFamily="monospace">✓ Valid</text>
        </g>

        {/* Node 2 */}
        <g transform="translate(240,230)">
          <rect width="80" height="60" rx="8" fill="#FFFFFF" stroke="#388E3C" strokeWidth="1.5"/>
          <rect width="80" height="16" rx="8" fill="#388E3C" opacity="0.15"/>
          <text x="40" y="11" textAnchor="middle" fontSize="8" fill="#2E7D32" fontWeight="700" fontFamily="monospace">BLOCK #002</text>
          <text x="40" y="30" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">Hash: 0xb7c...</text>
          <text x="40" y="42" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">NFT: #0042</text>
          <text x="40" y="54" textAnchor="middle" fontSize="7" fill="#4CAF50" fontFamily="monospace">✓ Minted</text>
        </g>

        {/* Node 3 */}
        <g transform="translate(440,170)">
          <rect width="80" height="60" rx="8" fill="#FFFFFF" stroke="#66BB6A" strokeWidth="1.5"/>
          <rect width="80" height="16" rx="8" fill="#66BB6A" opacity="0.15"/>
          <text x="40" y="11" textAnchor="middle" fontSize="8" fill="#2E7D32" fontWeight="700" fontFamily="monospace">BLOCK #003</text>
          <text x="40" y="30" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">Hash: 0xd2e...</text>
          <text x="40" y="42" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">Grade: A+</text>
          <text x="40" y="54" textAnchor="middle" fontSize="7" fill="#4CAF50" fontFamily="monospace">✓ Verified</text>
        </g>

        {/* Node 4 */}
        <g transform="translate(1200,180)">
          <rect width="80" height="60" rx="8" fill="#FFFFFF" stroke="#4CAF50" strokeWidth="1.5"/>
          <rect width="80" height="16" rx="8" fill="#4CAF50" opacity="0.15"/>
          <text x="40" y="11" textAnchor="middle" fontSize="8" fill="#2E7D32" fontWeight="700" fontFamily="monospace">BLOCK #009</text>
          <text x="40" y="30" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">Hash: 0xf1a...</text>
          <text x="40" y="42" textAnchor="middle" fontSize="7" fill="#666" fontFamily="monospace">Polygon ✓</text>
          <text x="40" y="54" textAnchor="middle" fontSize="7" fill="#4CAF50" fontFamily="monospace">✓ On-chain</text>
        </g>

        {/* ===== COFFEE DOODLE ICONS (sederhana, sketch style) ===== */}

        {/* Cangkir kopi - kiri bawah */}
        <g transform="translate(50,680)" opacity="0.25">
          <ellipse cx="35" cy="50" rx="30" ry="8" fill="none" stroke="#5D4037" strokeWidth="2"/>
          <path d="M5,20 L65,20 L58,50 L12,50 Z" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M65,28 Q80,28 80,38 Q80,48 65,48" fill="none" stroke="#5D4037" strokeWidth="2"/>
          <path d="M25,20 Q28,8 35,5 Q42,8 45,20" fill="none" stroke="#8D6E63" strokeWidth="1.5"/>
          <path d="M30,12 Q30,4 35,2" fill="none" stroke="#8D6E63" strokeWidth="1.5" strokeLinecap="round"/>
          <text x="35" y="43" textAnchor="middle" fontSize="9" fill="#5D4037" fontFamily="serif">☕</text>
        </g>

        {/* Biji kopi - kanan atas */}
        <g transform="translate(1320,60)" opacity="0.2">
          <ellipse cx="30" cy="25" rx="28" ry="18" fill="none" stroke="#6D4C41" strokeWidth="2"/>
          <path d="M30,7 Q35,25 30,43" fill="none" stroke="#6D4C41" strokeWidth="1.5"/>
          <ellipse cx="80" cy="45" rx="22" ry="14" fill="none" stroke="#6D4C41" strokeWidth="2" transform="rotate(-20,80,45)"/>
          <path d="M71,34 Q80,45 89,56" fill="none" stroke="#6D4C41" strokeWidth="1.5" transform="rotate(-20,80,45)"/>
        </g>

        {/* ===== FLOATING CIRCUIT NODES ===== */}
        {/* Kecil di berbagai sudut */}
        <g opacity="0.35">
          {/* Hexagon nodes */}
          <polygon points="1350,400 1368,390 1386,400 1386,420 1368,430 1350,420" fill="none" stroke="#4CAF50" strokeWidth="1.5"/>
          <text x="1368" y="413" textAnchor="middle" fontSize="9" fill="#2E7D32">⛓</text>

          <polygon points="60,400 78,390 96,400 96,420 78,430 60,420" fill="none" stroke="#66BB6A" strokeWidth="1.5"/>
          <text x="78" y="413" textAnchor="middle" fontSize="9" fill="#388E3C">🔗</text>

          <polygon points="700,60 718,50 736,60 736,80 718,90 700,80" fill="none" stroke="#81C784" strokeWidth="1.5"/>
          <text x="718" y="73" textAnchor="middle" fontSize="9" fill="#2E7D32">◈</text>

          <polygon points="700,800 718,790 736,800 736,820 718,830 700,820" fill="none" stroke="#4CAF50" strokeWidth="1.5"/>
          <text x="718" y="813" textAnchor="middle" fontSize="9" fill="#2E7D32">◈</text>
        </g>

        {/* ===== FLOATING LABELS / TAGS ===== */}
        <g fontFamily="monospace" opacity="0.3">
          {/* Top area */}
          <rect x="620" y="50" width="90" height="22" rx="11" fill="#E8F5E9" stroke="#81C784" strokeWidth="1"/>
          <text x="665" y="65" textAnchor="middle" fontSize="9" fill="#2E7D32" fontWeight="700">ERC-721 NFT</text>

          <rect x="850" y="70" width="80" height="22" rx="11" fill="#FFF8E1" stroke="#FFD54F" strokeWidth="1"/>
          <text x="890" y="85" textAnchor="middle" fontSize="9" fill="#F57F17" fontWeight="700">RepViT CNN</text>

          <rect x="1070" y="50" width="90" height="22" rx="11" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="1"/>
          <text x="1115" y="65" textAnchor="middle" fontSize="9" fill="#1565C0" fontWeight="700">Polygon Amoy</text>

          {/* Bottom area */}
          <rect x="300" y="820" width="80" height="22" rx="11" fill="#F3E5F5" stroke="#CE93D8" strokeWidth="1"/>
          <text x="340" y="835" textAnchor="middle" fontSize="9" fill="#6A1B9A" fontWeight="700">IPFS Pinata</text>

          <rect x="800" y="840" width="90" height="22" rx="11" fill="#E8F5E9" stroke="#81C784" strokeWidth="1"/>
          <text x="845" y="855" textAnchor="middle" fontSize="9" fill="#2E7D32" fontWeight="700">Smart Contract</text>

          <rect x="1100" y="820" width="80" height="22" rx="11" fill="#FFF3E0" stroke="#FFCC02" strokeWidth="1"/>
          <text x="1140" y="835" textAnchor="middle" fontSize="9" fill="#E65100" fontWeight="700">MetaMask🦊</text>
        </g>

        {/* ===== DOTS/NODES ALONG CHAIN ===== */}
        <g fill="#4CAF50" opacity="0.6">
          <circle cx="120" cy="180" r="5"/>
          <circle cx="280" cy="260" r="5"/>
          <circle cx="480" cy="200" r="5"/>
          <circle cx="650" cy="310" r="5"/>
          <circle cx="850" cy="240" r="5"/>
          <circle cx="1050" cy="320" r="5"/>
          <circle cx="1240" cy="210" r="5"/>
          <circle cx="200" cy="500" r="4"/>
          <circle cx="400" cy="580" r="4"/>
          <circle cx="600" cy="510" r="4"/>
          <circle cx="800" cy="600" r="4"/>
          <circle cx="1000" cy="520" r="4"/>
          <circle cx="1200" cy="620" r="4"/>
        </g>
        <g fill="#81C784" opacity="0.4">
          <circle cx="120" cy="180" r="10" fillOpacity="0.2"/>
          <circle cx="480" cy="200" r="10" fillOpacity="0.2"/>
          <circle cx="850" cy="240" r="10" fillOpacity="0.2"/>
          <circle cx="1240" cy="210" r="10" fillOpacity="0.2"/>
          <circle cx="400" cy="580" r="10" fillOpacity="0.2"/>
          <circle cx="800" cy="600" r="10" fillOpacity="0.2"/>
        </g>

        {/* ===== LARGE DECORATIVE CIRCLES (subtle) ===== */}
        <circle cx="200" cy="450" r="180" fill="none" stroke="#C8E6C9" strokeWidth="1" opacity="0.4" strokeDasharray="8,8"/>
        <circle cx="1250" cy="450" r="150" fill="none" stroke="#BBDEFB" strokeWidth="1" opacity="0.3" strokeDasharray="6,6"/>
        <circle cx="720" cy="450" r="300" fill="none" stroke="#E1BEE7" strokeWidth="0.5" opacity="0.2" strokeDasharray="10,10"/>
      </svg>
    </div>
  )
}

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
  const [activeTab, setActiveTab]   = useState(0)
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
      // ABI fungsi cekHashFoto
      // Gunakan CONTRACT_ABI yang sudah include cekHashFoto
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const [sudahAda, tokenIdLama] = await contract.cekHashFoto(hashHex)
      return { sudahAda, tokenIdLama: Number(tokenIdLama) }
    } catch(err) {
      console.log('cekDuplikat error (contract mungkin belum punya fungsi ini):', err.message)
      // Jika contract lama belum ada fungsi ini, skip cek on-chain
      return { sudahAda: false, tokenIdLama: 0 }
    }
  }

  // ============================================================
  // Hitung Perceptual Hash sederhana (untuk deteksi foto serupa)
  // Menggunakan canvas untuk resize + average hash
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
          // Convert bits to hex string
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

    // Hitung hash foto otomatis saat dipilih
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

    // ══════════════════════════════════════════════════════
    // LAYER 1: Cek apakah output adalah penolakan eksplisit
    // Hanya tolak jika kata kunci penolakan ADA di teks
    // ══════════════════════════════════════════════════════
    const REJECTION_KEYWORDS = [
      'BUKAN BIJI KOPI',
      'GAMBAR TIDAK DAPAT DIKLASIFIKASI',
      'CONFIDENCE TERLALU RENDAH',
      'MODEL TIDAK YAKIN',
    ]
    // Cek kata kunci penolakan
    const isExplicitRejection = REJECTION_KEYWORDS.some(kw => text.toUpperCase().includes(kw.toUpperCase()))

    if (isExplicitRejection) {
      const confMatch = text.match(/Confidence[^:]*:\s*([\d.]+)%/i)
      const confVal   = parseFloat(confMatch?.[1]) || 0
      const alasanMatch = text.match(/Alasan[^:]*:\s*(.+)/i)
      const alasan    = alasanMatch?.[1]?.trim() || 'Model menolak gambar'
      return { bukan_kopi: true, confidence: confVal, alasan, raw: text }
    }

    // ══════════════════════════════════════════════════════
    // LAYER 2: Parse hasil klasifikasi kopi yang berhasil
    // Support format lama (JENIS KOPI) dan format baru (nama_indo)
    // ══════════════════════════════════════════════════════
    // Coba berbagai format output
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

    // Jika tidak ada jenis kopi yang terdeteksi sama sekali → error parsing
    if (!jenis && confidence === 0) {
      console.warn('Parsing gagal, raw text:', text.substring(0, 200))
      // Jangan langsung tolak — mungkin format output berubah
      // Coba cari tanda-tanda positif dalam teks
      const hasPositiveSign = text.includes('Arabica') || text.includes('Arabika') || text.includes('Premium') || text.includes('Grade')
      if (!hasPositiveSign) {
        return { bukan_kopi: true, alasan: 'Format output tidak dikenali', raw: text }
      }
    }

    // ══════════════════════════════════════════════════════
    // LAYER 3: Safety net confidence — HANYA jika confidence benar-benar ada
    // Threshold 40% sangat konservatif untuk hindari false reject
    // ══════════════════════════════════════════════════════
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

    // ── TIMING MEASUREMENT ──
    const timing = {
      t_start    : performance.now(),
      t_hash     : 0,
      t_hf_upload: 0,
      t_hf_infer : 0,
      t_ipfs_foto: 0,
      t_ipfs_meta: 0,
      t_blockchain: 0,
      t_end      : 0,
    }

    // ── Verifikasi foto sebelum klasifikasi ──
    try {
      setStatus('🔍 Memverifikasi keaslian foto...')
      const hash = fotoHash || await hitungHashFoto(foto)
      if (!fotoHash) setFotoHash(hash)

      // Cek duplikat on-chain
      setVerifying(true)
      const { sudahAda, tokenIdLama } = await cekDuplikatOnChain(hash)
      setVerifying(false)

      if (sudahAda) {
        setDuplikat({
          tipe: 'IDENTIK',
          tokenId: tokenIdLama,
          hash,
          pesan: `Foto ini IDENTIK dengan NFT #${tokenIdLama} yang sudah ada di blockchain!`,
          warna: '#FEF2F2',
          border: '#FECACA',
          icon: '🚫'
        })
        setLoading(false)
        return // Hentikan proses
      }

      // Hitung pHash untuk deteksi foto serupa
      const pHash = await hitungPHash(foto)
      const pHashLama = localStorage.getItem('lastPHash')
      if (pHashLama && pHash) {
        const dist = hammingDistance(pHash, pHashLama)
        console.log('Hamming distance:', dist)
        if (dist <= 5) {
          // Sangat mirip — peringatan
          setDuplikat({
            tipe: 'MIRIP',
            dist,
            hash,
            pesan: `Foto ini SANGAT MIRIP dengan foto yang baru-baru ini diproses (jarak: ${dist}/64). Pastikan ini foto yang berbeda!`,
            warna: '#FFFBEB',
            border: '#FDE68A',
            icon: '⚠️'
          })
          // Tidak hentikan proses, hanya peringatan
        }
      }
      // Simpan pHash foto ini untuk perbandingan berikutnya
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

      timing.t_hf_upload = performance.now()
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

      // Baca SSE response dari Gradio dengan robust parsing
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
            // Gradio bisa return: [string] atau [{...}] atau string langsung
            if (Array.isArray(parsed)) {
              if (typeof parsed[0] === 'string' && parsed[0].length > 0) {
                out = parsed[0]
              } else if (parsed[0] && typeof parsed[0] === 'object') {
                // Kadang Gradio wrap dalam object
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
      timing.t_hf_infer = performance.now()
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
    const t_mint_start = performance.now()  // timing mulai
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
        // Polygon Amoy minimum 25 Gwei. Pakai max(networkGas, 30 Gwei) untuk safety
        const minGas = ethers.parseUnits('30', 'gwei')
        const networkGas = feeData.gasPrice || feeData.maxFeePerGas || minGas
        const finalGas = networkGas < minGas ? minGas : networkGas
        gasOverrides = {
          maxFeePerGas:         finalGas,
          maxPriorityFeePerGas: finalGas,
        }
        console.log('Gas price set to:', ethers.formatUnits(finalGas, 'gwei'), 'Gwei')
      } catch(e) {
        // Fallback: 30 Gwei manual
        gasOverrides = {
          maxFeePerGas:         ethers.parseUnits('30', 'gwei'),
          maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'),
        }
      }

      const tx = await contract.mintKopiNFT(
        address, ipfsData.cidFoto, `ipfs://${ipfsData.cidMetadata}`,
        hasilCNN.jenis_kopi, hasilCNN.grade, namaPetani, lokasi,
        Math.round(hasilCNN.confidence),
        fotoHash,    // ← SHA-256 hash foto — anti-duplikat v2
        gasOverrides // ← override gas price untuk Polygon Amoy
      )
      setStatus('Menunggu konfirmasi blockchain...')
      const receipt = await tx.wait()
      const t_after_blockchain = performance.now()
      const t_total_mint = (t_after_blockchain - t_mint_start) / 1000

      // ── LATENCY REPORT — copy ke spreadsheet ──
      console.log('\n' + '='.repeat(50))
      console.log('⏱️ LATENCY MEASUREMENT REPORT')
      console.log('='.repeat(50))
      console.log('T_total (IPFS+Blockchain):', t_total_mint.toFixed(3), 's')
      console.log('='.repeat(50))
      console.log('COPY KE SPREADSHEET (T_total_mint detik):')
      console.log(t_total_mint.toFixed(3))
      console.log('='.repeat(50) + '\n')

      setTxHash(receipt.hash)

      // ============================================================
      // Ambil Token ID dari event log transaksi
      // ============================================================
      let mintedTokenId = null
      try {
        // Decode event Transfer(from, to, tokenId) dari receipt
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

      // ============================================================
      // Auto import NFT ke MetaMask wallet user
      // ============================================================
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
          // Tidak apa-apa jika gagal — NFT tetap ada di blockchain
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
      // Pastikan di jaringan Amoy
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== AMOY_CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AMOY_CHAIN_ID }]
        })
      }

      // Minta MetaMask untuk import NFT
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
      // Fallback: arahkan ke Polygonscan
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

  // Safe null check untuk gs — hindari crash saat hasilCNN null
  const gs = (hasilCNN && !hasilCNN.bukan_kopi)
    ? (GRADE_STYLE[hasilCNN.grade] || GRADE_STYLE['Grade B'])
    : GRADE_STYLE['Grade B']

  return (
    <>
      <BlockchainDoodle/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{
          font-family:'Lato',sans-serif;
          min-height:100vh;
          position:relative;
          background-color:#F0F7F0;
        }

        /* BACKGROUND DOODLE BLOCKCHAIN — SVG inline cerah */
        .bg-doodle{
          position:fixed;inset:0;z-index:0;
          overflow:hidden;pointer-events:none;
        }
        .bg-doodle svg{width:100%;height:100%}

        .layout{position:relative;z-index:1}
        .card{background:#FFFFFF !important;}
        .hero-card{
          background:linear-gradient(160deg,#0A1A08 0%,#14290F 50%,#1A3810 100%) !important;
        }

        /* HEADER */
        .hdr{
          background:linear-gradient(135deg,#0A1A08 0%,#14290F 40%,#1A3810 100%);
          padding:0;position:relative;overflow:hidden;
          border-bottom:1px solid rgba(74,222,128,.15);
        }
        .hdr::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 600px 300px at 20% 50%,rgba(74,222,128,.06) 0%,transparent 70%),
            radial-gradient(ellipse 400px 200px at 80% 50%,rgba(96,165,250,.05) 0%,transparent 70%);
          pointer-events:none;
        }
        .hdr-in{max-width:1380px;margin:0 auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:relative;z-index:1}
        .hdr-brand{display:flex;align-items:center;gap:14px}

        /* LOGO BARU — latar putih, gambar kopi estetik di tengah */
        .logo-wrap{
          position:relative;
          width:56px;height:56px;
          flex-shrink:0;
        }
        .logo-circle{
          width:56px;height:56px;
          border-radius:50%;
          background:#FFFFFF;
          box-shadow:
            0 0 0 2px rgba(255,255,255,.3),
            0 4px 20px rgba(0,0,0,.35),
            inset 0 1px 0 rgba(255,255,255,.8);
          display:flex;align-items:center;justify-content:center;
          position:relative;overflow:hidden;
        }
        .logo-circle::before{
          content:'';
          position:absolute;inset:0;
          background:linear-gradient(135deg,#FFFFFF 0%,#F0EDE8 100%);
        }
        .logo-img-wrap{
          position:relative;z-index:1;
          width:38px;height:38px;
          border-radius:50%;
          overflow:hidden;
          border:2px solid rgba(139,90,43,.15);
          box-shadow:0 2px 8px rgba(0,0,0,.12);
        }
        .logo-img{
          width:100%;height:100%;
          object-fit:cover;
          object-position:center;
          filter:saturate(1.3) contrast(1.05);
        }
        .logo-badge{
          position:absolute;bottom:-1px;right:-1px;
          width:18px;height:18px;
          background:linear-gradient(135deg,#1A4A1A,#2E7D32);
          border-radius:50%;
          border:2px solid #FFF;
          display:flex;align-items:center;justify-content:center;
          font-size:8px;
          box-shadow:0 2px 6px rgba(0,0,0,.2);
        }
        .logo-ring{
          position:absolute;inset:-4px;
          border-radius:50%;
          border:1.5px solid rgba(255,255,255,.25);
          animation:spin 10s linear infinite;
        }
        .logo-ring::after{
          content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
          width:4px;height:4px;background:#FFF;border-radius:50%;
          box-shadow:0 0 6px rgba(255,255,255,.8);
        }
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        .hdr-text{}
        .hdr-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#FFF;letter-spacing:-0.5px;line-height:1.1}
        .hdr-title span{color:#4ADE80}
        .hdr-sub{font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2.5px;text-transform:uppercase;margin-top:3px}
        .hdr-badges{display:flex;gap:7px;flex-wrap:wrap}
        .bdg{padding:4px 10px;border-radius:4px;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;font-family:'DM Mono',monospace}
        .bdg-g{
          background:linear-gradient(135deg,#1A1A2E,#16213E);color:#FCD34D;
          border:1px solid rgba(252,211,77,.5);font-weight:700;
          text-shadow:0 1px 2px rgba(0,0,0,.4);
          box-shadow:0 2px 12px rgba(252,211,77,.15),inset 0 1px 0 rgba(252,211,77,.1);
        }
        .bdg-gr{
          background:linear-gradient(135deg,#0D2818,#1B5E20);color:#86EFAC;
          border:1px solid rgba(134,239,172,.4);font-weight:700;
          text-shadow:0 1px 2px rgba(0,0,0,.4);
          box-shadow:0 2px 12px rgba(46,125,50,.25),inset 0 1px 0 rgba(134,239,172,.1);
        }
        .bdg-b{
          background:linear-gradient(135deg,#0A2342,#0D47A1);color:#93C5FD;
          border:1px solid rgba(147,197,253,.4);font-weight:700;
          text-shadow:0 1px 2px rgba(0,0,0,.4);
          box-shadow:0 2px 12px rgba(13,71,161,.25),inset 0 1px 0 rgba(147,197,253,.1);
        }
        .bdg-verified{
          background:linear-gradient(135deg,#064E3B,#047857);color:#A7F3D0;
          border:1px solid rgba(167,243,208,.5);font-weight:800;
          text-shadow:0 1px 2px rgba(0,0,0,.5);
          padding:5px 11px;border-radius:4px;
          font-size:9px;letter-spacing:1.5px;text-transform:uppercase;
          font-family:'DM Mono',monospace;
          display:inline-flex;align-items:center;gap:4px;
          box-shadow:0 2px 12px rgba(4,120,87,.3);
          animation:verifiedPulse 3s ease-in-out infinite;
        }
        @keyframes verifiedPulse{
          0%,100%{box-shadow:0 2px 12px rgba(4,120,87,.3)}
          50%{box-shadow:0 2px 16px rgba(4,120,87,.5)}
        }

        /* WALLET BUTTON */
        .hdr-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .btn-wallet{display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:24px;font-size:12px;font-weight:700;font-family:'Lato',sans-serif;cursor:pointer;border:none;transition:all .25s;letter-spacing:.3px;white-space:nowrap}
        .btn-wallet-off{background:rgba(255,255,255,.1);color:#FFF;border:1.5px solid rgba(255,255,255,.25)}
        .btn-wallet-off:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.45);transform:translateY(-1px)}
        .btn-wallet-on{background:rgba(74,222,128,.15);color:#86EFAC;border:1.5px solid rgba(74,222,128,.3)}
        .btn-wallet-on:hover{background:rgba(239,68,68,.15);color:#FCA5A5;border-color:rgba(239,68,68,.3)}
        .btn-wallet-on:hover .w-addr{display:none}
        .btn-wallet-on:hover .w-disc{display:inline}
        .w-disc{display:none}
        .w-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
        .w-dot-on{background:#4ADE80;animation:blink 2s infinite}
        .w-dot-off{background:rgba(255,255,255,.4)}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}

        /* LAYOUT */
        .layout{max-width:1380px;margin:0 auto;padding:32px 28px;display:grid;grid-template-columns:380px 1fr;gap:28px;align-items:start}
        @media(max-width:900px){.layout{grid-template-columns:1fr;padding:20px 16px}}

        /* CARDS */
        .card{
          background:rgba(255,255,255,.97);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
          border-radius:6px;
          border:1px solid rgba(200,210,190,.4);
          border-top:3px solid var(--green-600);
          box-shadow:
            0 4px 32px rgba(12,31,12,.05),
            0 1px 3px rgba(12,31,12,.04),
            inset 0 1px 0 rgba(255,255,255,.7);
          overflow:hidden;margin-bottom:22px;
          transition:all .3s cubic-bezier(.4,0,.2,1);
          position:relative;
        }
        .card:hover{
          box-shadow:
            0 12px 48px rgba(12,31,12,.1),
            0 4px 12px rgba(12,31,12,.06),
            inset 0 1px 0 rgba(255,255,255,.9);
          transform:translateY(-2px);
          border-top-color:var(--gold);
        }
        .card::after{
          content:'';position:absolute;top:0;left:0;right:0;height:60px;
          background:linear-gradient(180deg,rgba(255,255,255,.4),transparent);
          pointer-events:none;
        }

        /* HERO CARD */
        .hero-card{
          background:var(--green-900);
          border-radius:3px;padding:28px 24px 0;overflow:hidden;position:relative;margin-bottom:20px;
          border:1px solid rgba(201,168,76,.12);
          border-top:3px solid var(--gold);
        }
        .hero-card::before{
          content:'';position:absolute;inset:0;
          background:
            radial-gradient(ellipse 200px 150px at 90% 20%,rgba(201,168,76,.06) 0%,transparent 70%),
            radial-gradient(ellipse 150px 100px at 10% 80%,rgba(76,175,80,.05) 0%,transparent 70%);
          pointer-events:none;
        }
        .hero-card::after{
          content:'';position:absolute;right:0;top:0;bottom:0;width:120px;
          background:linear-gradient(90deg,transparent,rgba(201,168,76,.03));
          pointer-events:none;
        }
        .hero-nodes{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .hero-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:#FFF;line-height:1.2;position:relative;z-index:1;letter-spacing:.3px}
        .hero-sub{font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,.4);margin-top:8px;margin-bottom:20px;position:relative;z-index:1;letter-spacing:2px;text-transform:uppercase}

        /* TABS */
        .tabs{display:flex;border-bottom:1px solid rgba(201,168,76,.15);gap:0;position:relative;z-index:1}
        .tab{padding:10px 18px;font-size:18px;cursor:pointer;border-bottom:2px solid transparent;opacity:.4;transition:all .2s;background:none;border-top:none;border-left:none;border-right:none}
        .tab.on{opacity:1;border-bottom-color:var(--gold)}
        .tab:hover{opacity:.75}
        .tab-body{background:#FFF;border-radius:0 0 18px 18px;padding:22px}
        .tab-emoji{font-size:32px;margin-bottom:10px}
        .tab-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#14290F;margin-bottom:8px}
        .tab-text{font-size:13px;color:#6B7280;line-height:1.7}
        .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid #F0EFE8}
        .stat{background:#F7F7F2;border-radius:10px;padding:10px;text-align:center}
        .stat-v{font-size:15px;font-weight:700;color:#14290F}
        .stat-k{font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}

        /* CARA PAKAI */
        .card-head{padding:14px 20px;border-bottom:1px solid #F0EFE8;display:flex;align-items:center;gap:10px;background:#FAFAF5}
        .head-ico{width:28px;height:28px;background:var(--green-50);border:1px solid var(--green-100);border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:13px}
        .head-title{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:var(--green-700);letter-spacing:1px;text-transform:uppercase}
        .cara-list{padding:18px 20px;display:flex;flex-direction:column;gap:14px}
        .cara-item{display:flex;gap:12px;align-items:flex-start}
        .cara-no{width:28px;height:28px;flex-shrink:0;background:var(--green-800);border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;color:var(--gold-light);font-family:'DM Mono',monospace;letter-spacing:0}
        .cara-title{font-size:13px;font-weight:700;color:#1F2937;margin-bottom:2px}
        .cara-text{font-size:12px;color:#9CA3AF;line-height:1.5}

        /* TECH */
        .tech-grid{padding:14px 20px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .tech-item{background:#F7F7F2;border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px}
        .tech-ico{font-size:16px}
        .tech-name{font-size:11px;font-weight:700;color:#374151}
        .tech-desc{font-size:10px;color:#9CA3AF}

        /* RIGHT COLUMN */
        .sec-label{font-family:'DM Mono',monospace;font-size:9px;font-weight:500;text-transform:uppercase;letter-spacing:2.5px;color:#9CA3AF;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #F0EDE8}
        .upload-zone{border:2px dashed #C8DFC8;border-radius:14px;min-height:210px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;overflow:hidden;background:#F7FAF7}
        .upload-zone:hover{border-color:#2A5520;background:#F0F6F0}
        .up-ph{text-align:center;padding:28px}
        .up-ico{font-size:44px;opacity:.35;margin-bottom:10px}
        .up-txt{font-size:13px;font-weight:600;color:#4B5563}
        .up-sub{font-size:11px;color:#9CA3AF;margin-top:3px}

        .lbl{font-family:'DM Mono',monospace;font-size:10px;font-weight:500;color:#6B7280;margin-bottom:6px;display:block;letter-spacing:1.5px;text-transform:uppercase}
        .inp{width:100%;border:1px solid #E5E7EB;border-bottom:2px solid #E5E7EB;border-radius:0;padding:11px 0;font-size:14px;font-family:'DM Sans',sans-serif;color:#1F2937;background:transparent;outline:none;transition:border-color .2s}
        .inp:focus{border-bottom-color:var(--green-600);background:transparent}
        .inp::placeholder{color:#D1D5DB}

        .btn-go{
          width:100%;padding:16px 20px;
          background:linear-gradient(135deg,#1B5E20 0%,#2E7D32 50%,#43A047 100%) !important;
          color:#FFFFFF !important;font-size:14px;font-weight:800;
          border:none;border-radius:12px;cursor:pointer;
          transition:all .25s;font-family:'DM Sans',sans-serif;
          display:flex;align-items:center;justify-content:center;gap:10px;
          letter-spacing:1px;text-transform:uppercase;
          position:relative;overflow:hidden;
          text-shadow:0 2px 4px rgba(0,0,0,.4);
          box-shadow:0 4px 16px rgba(46,125,50,.45),inset 0 1px 0 rgba(255,255,255,.2);
        }
        .btn-go::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);transform:translateX(-100%);transition:transform .5s ease}
        .btn-go:hover:not(:disabled)::before{transform:translateX(100%)}
        .btn-go:hover:not(:disabled){background:var(--green-700);box-shadow:0 4px 20px rgba(20,41,15,.25)}
        .btn-go:disabled{background:#D1D5DB;cursor:not-allowed}

        .btn-mint{width:100%;padding:14px;background:#1A1A2E;color:var(--gold-light);font-size:12px;font-weight:600;border:1px solid rgba(201,168,76,.3);border-radius:2px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:1.5px;text-transform:uppercase}
        .btn-mint:hover:not(:disabled){background:#16213E;border-color:var(--gold);box-shadow:0 4px 20px rgba(201,168,76,.15)}
        .btn-mint:disabled{background:#D1D5DB;color:#9CA3AF;border-color:transparent;cursor:not-allowed}

        .err{background:#FEF2F2;border:1px solid #FECACA;border-radius:11px;padding:11px 13px;font-size:12px;color:#B91C1C;margin-top:10px}
        .sts{text-align:center;font-size:11px;color:#6B7280;margin-top:7px}

        .hasil-box{border-radius:3px;padding:18px;border:1px solid;border-top:3px solid}
        .hasil-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;margin-bottom:14px;letter-spacing:.2px}
        .hasil-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px}
        .hasil-lbl{font-size:12px;color:#6B7280}
        .hasil-val{font-size:13px;font-weight:700}
        .bar-bg{height:6px;background:rgba(255,255,255,.5);border-radius:3px;overflow:hidden;margin-bottom:14px}
        .bar-fg{height:100%;border-radius:3px;transition:width 1s ease}

        .sukses{border-radius:3px;padding:22px;background:#F8FFF8;border:1px solid #C8E6C9;border-top:3px solid #4CAF50}
        .sukses-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--green-800);margin-bottom:14px;letter-spacing:.2px}
        .hash-box{background:#FFF;border-radius:11px;padding:11px 13px;margin-bottom:9px;border:1px solid #BBF7D0}
        .hash-lbl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6B7280;margin-bottom:3px}
        .hash-val{font-size:11px;font-family:monospace;color:#15803D;word-break:break-all}
        .btn-a{display:block;width:100%;padding:11px;border-radius:11px;font-size:13px;font-weight:700;text-align:center;text-decoration:none;margin-bottom:8px;transition:all .2s;cursor:pointer;border:none;font-family:'Lato',sans-serif}
        .a-blue{background:#1D4ED8;color:#FFF}
        .a-blue:hover{background:#1E40AF}
        .a-orange{background:#EA580C;color:#FFF}
        .a-orange:hover{background:#C2410C}
        .a-ghost{background:none;border:1.5px solid #D1D5DB;color:#6B7280}
        .a-ghost:hover{background:#F9FAFB}

        .mg-b-3{margin-bottom:12px}
        .mg-b-4{margin-bottom:16px}
        .mg-t-4{margin-top:16px}
        .mg-t-5{margin-top:20px}
        .sec-code{font-family:'DM Mono',monospace;font-size:10px;background:#F8FAFC;border:1px solid #E2E8F0;border-left:3px solid #4CAF50;border-radius:2px;padding:8px 10px;color:#374151;line-height:1.8;margin-top:6px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}


        /* ═══════════════════════════════════
           OVERRIDE — SEMUA TOMBOL KONTRAS
           ═══════════════════════════════════ */
        .btn-go,.btn-go *{color:#FFFFFF !important;font-weight:800 !important;text-shadow:0 1px 2px rgba(0,0,0,.3)}
        .btn-mint,.btn-mint *{color:#FFFFFF !important;font-weight:800 !important;text-shadow:0 1px 2px rgba(0,0,0,.3)}
        .btn-a,.btn-a *{font-weight:800 !important}
        .a-blue,.a-blue *{color:#FFFFFF !important;text-shadow:0 1px 2px rgba(0,0,0,.3)}
        .a-orange,.a-orange *{color:#FFFFFF !important;text-shadow:0 1px 2px rgba(0,0,0,.3)}
        .a-ghost{
          background:linear-gradient(135deg,#37474F,#455A64) !important;
          border:none !important;
          color:#FFFFFF !important;
          box-shadow:0 4px 14px rgba(55,71,79,.4) !important;
        }
        .a-ghost *{color:#FFFFFF !important;text-shadow:0 1px 2px rgba(0,0,0,.3) !important}
        .a-ghost:hover{background:linear-gradient(135deg,#263238,#37474F) !important}

        /* Wallet button — oranye terang */
        .btn-wallet-off{
          background:linear-gradient(135deg,#F57C00,#FB8C00) !important;
          color:#FFFFFF !important;
          border:1.5px solid rgba(255,255,255,.5) !important;
          font-weight:800 !important;
          text-shadow:0 1px 2px rgba(0,0,0,.25) !important;
          box-shadow:0 3px 12px rgba(245,124,0,.4) !important;
        }
        .btn-wallet-off:hover{
          background:linear-gradient(135deg,#E65100,#F57C00) !important;
          transform:translateY(-1px);
        }

        /* Tombol disabled — tetap kontras */
        .btn-go:disabled,.btn-mint:disabled{
          background:linear-gradient(135deg,#757575,#9E9E9E) !important;
          color:#FFFFFF !important;
          opacity:1 !important;
        }



        /* ═══════════════════════════════════
           SECURITY SECTION — typography elegan
           ═══════════════════════════════════ */
        .sec-item{padding:18px 0;border-bottom:1px solid rgba(0,0,0,.05)}
        .sec-item:last-child{border-bottom:none}
        .sec-item-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
        .sec-badge{
          display:inline-flex;align-items:center;gap:6px;
          padding:5px 12px;border-radius:20px;
          font-size:11px;font-weight:600;
          font-family:'DM Sans',sans-serif;
          border:1px solid;letter-spacing:.2px;
        }
        .sec-status{
          display:inline-flex;align-items:center;gap:5px;
          font-family:'DM Mono',monospace;
          font-size:10px;font-weight:600;color:#16A34A;
          letter-spacing:1px;text-transform:uppercase;
          padding:3px 9px;background:#F0FDF4;
          border:1px solid #BBF7D0;border-radius:12px;
        }
        .sec-status::before{
          content:'';width:6px;height:6px;
          background:#22C55E;border-radius:50%;
          box-shadow:0 0 6px #22C55E;
          animation:blink 2s infinite;
        }
        .sec-title{
          font-family:'Cormorant Garamond',serif !important;
          font-size:18px !important;
          font-weight:700 !important;
          color:#0C1F0C !important;
          line-height:1.3;
          margin-bottom:8px !important;
          letter-spacing:.2px;
        }
        .sec-desc{
          font-family:'DM Sans',sans-serif !important;
          font-size:14px !important;
          line-height:1.7 !important;
          color:#4B5563 !important;
          margin-bottom:10px !important;
          font-weight:400;
        }
        .sec-code{
          font-family:'DM Mono',monospace !important;
          font-size:11px !important;
          background:#F8FAFC !important;
          border:1px solid #E2E8F0 !important;
          border-left:3px solid var(--green-500) !important;
          border-radius:6px !important;
          padding:10px 14px !important;
          color:#1F2937 !important;
          line-height:1.7 !important;
          margin-top:8px;
          overflow-x:auto;
        }
        .sec-divider{
          height:1px;
          background:linear-gradient(90deg,transparent,rgba(0,0,0,.08),transparent);
          margin:0;border:none;
        }

      `}</style>

      {/* HEADER */}
      <header className="hdr">
        <div className="hdr-in">
          <div className="hdr-brand">
            {/* LOGO BARU — putih dengan foto kopi estetik */}
            <div className="logo-wrap">
              <div className="logo-circle">
                <div className="logo-img-wrap">
                  <img
                    className="logo-img"
                    src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=120&h=120&fit=crop&q=90"
                    alt="Kopi Arabika"
                  />
                </div>
                <div className="logo-badge">⛓</div>
              </div>
              <div className="logo-ring"/>
            </div>
            <div className="hdr-text">
              <div className="hdr-title">Kopi Arabika <span>Web3</span></div>
              <div className="hdr-sub"> Riset Unggulan Universitas Jember</div>
            </div>
          </div>
          <div className="hdr-right">
            <div className="hdr-badges">
              <span className="bdg bdg-g">🏆 RepViT-M1.1 · 6-Class · 99.78%</span>
              <span className="bdg bdg-gr">⛓️ Polygon Amoy</span>
              <span className="bdg bdg-b">📦 IPFS Pinata</span>
            </div>
            <button
              className={`btn-wallet ${walletAddr ? 'btn-wallet-on' : 'btn-wallet-off'} ${walletLoading ? 'w-loading' : ''}`}
              onClick={handleConnectWallet}
              disabled={walletLoading}
            >
              <span className={`w-dot ${walletAddr ? 'w-dot-on' : 'w-dot-off'}`}/>
              {walletLoading
                ? '⏳ Menghubungkan...'
                : walletAddr
                  ? <><span className="w-addr">🦊 {shortAddr(walletAddr)}</span><span className="w-disc">✕ Disconnect</span></>
                  : '🦊 Connect Wallet'
              }
            </button>
          </div>
        </div>
      </header>

      {/* LAYOUT 2 KOLOM */}
      <div className="layout">

        {/* ====== KOLOM KIRI ====== */}
        <div>
          {/* Hero + tab info kopi */}
          <div className="hero-card">
            <div className="hero-title">Kopi Arabika<br/>Nusantara</div>
            <div className="hero-sub">5 varietas unggulan terverifikasi AI</div>
            <div className="tabs">
              {INFO_KOPI.map((k,i) => (
                <button key={i} className={`tab ${activeTab===i?'on':''}`} onClick={()=>setActiveTab(i)}>{k.emoji}</button>
              ))}
            </div>
          </div>
          <div className="tab-body-wrap" style={{background:'#FFFFFF',borderRadius:'0 0 18px 18px',padding:'22px',marginTop:'-18px',boxShadow:'0 2px 16px rgba(0,0,0,.06)',border:'1px solid #E4E4DC',borderTop:'none',marginBottom:'20px'}}>
            <div className="tab-emoji">{INFO_KOPI[activeTab].emoji}</div>
            <div className="tab-title">{INFO_KOPI[activeTab].judul}</div>
            <div className="tab-text">{INFO_KOPI[activeTab].isi}</div>
            <div className="stats">
              <div className="stat"><div className="stat-v">900–1500</div><div className="stat-k">Mdpl</div></div>
              <div className="stat"><div className="stat-v">Specialty</div><div className="stat-k">Kategori</div></div>
              <div className="stat"><div className="stat-v">Arabika</div><div className="stat-k">Spesies</div></div>
              <div className="stat"><div className="stat-v">Ijen</div><div className="stat-k">Origin</div></div>
            </div>
          </div>

          {/* Cara penggunaan */}
          <div className="card">
            <div className="card-head">
              <div className="head-ico">📖</div>
              <div className="head-title">Cara Penggunaan</div>
            </div>
            <div className="cara-list">
              {CARA_PAKAI.map((c,i)=>(
                <div key={i} className="cara-item">
                  <div className="cara-no">{c.no}</div>
                  <div>
                    <div className="cara-title">{c.judul}</div>
                    <div className="cara-text">{c.isi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="card">
            <div className="card-head">
              <div className="head-ico">⚙️</div>
              <div className="head-title">Teknologi yang Digunakan</div>
            </div>
            <div className="tech-grid">
              {[
                {ico:'🤖',name:'RepViT-M1.1',desc:'CVPR 2024 CNN Model'},
                {ico:'⛓️',name:'Polygon Amoy',desc:'ERC-721 Blockchain'},
                {ico:'📦',name:'Pinata IPFS',desc:'Decentralized Storage'},
                {ico:'🔑',name:'MetaMask',desc:'Web3 Wallet'},
                {ico:'🤗',name:'Hugging Face',desc:'AI Inference API'},
                {ico:'▲', name:'Vercel',desc:'Edge Deployment'},
              ].map((t,i)=>(
                <div key={i} className="tech-item">
                  <div className="tech-ico">{t.ico}</div>
                  <div><div className="tech-name">{t.name}</div><div className="tech-desc">{t.desc}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ SECURITY SECTION ══ */}
          <div className="card">
            <div className="card-head">
              <div className="head-ico">🔐</div>
              <div className="head-title">Security Architecture</div>
            </div>
            <div style={{padding:'20px'}}>

              {/* SHA-256 */}
              <div className="sec-item">
                <div className="sec-item-head">
                  <div className="sec-badge" style={{background:'#EFF6FF',borderColor:'#93C5FD',color:'#1E40AF'}}>
                    <span>🔑</span> Cryptographic Hash
                  </div>
                  <div className="sec-status">Active</div>
                </div>
                <div className="sec-title">SHA-256 Photo Fingerprint</div>
                <div className="sec-desc">
                  Setiap foto kopi dikonversi menjadi fingerprint kriptografis 256-bit unik menggunakan algoritma SHA-256 via Web Cryptography API. Hash ini tidak dapat dibalik, diubah, atau dipalsukan — memastikan setiap NFT merepresentasikan foto kopi yang unik dan asli.
                </div>
                <div className="sec-code">
                  crypto.subtle.digest('SHA-256', imageBuffer)
                  <br/>→ 64-char hex fingerprint
                </div>
              </div>

              <div className="sec-divider"/>

              {/* ON-CHAIN REGISTRY */}
              <div className="sec-item">
                <div className="sec-item-head">
                  <div className="sec-badge" style={{background:'#F0FDF4',borderColor:'#86EFAC',color:'#14532D'}}>
                    <span>⛓️</span> Blockchain Layer
                  </div>
                  <div className="sec-status">Active</div>
                </div>
                <div className="sec-title">On-Chain Anti-Duplication Registry</div>
                <div className="sec-desc">
                  Hash SHA-256 setiap foto tersimpan dalam mapping <code style={{fontFamily:'monospace',fontSize:11,background:'#F3F4F6',padding:'1px 5px',borderRadius:3}}>_hashFotoRegistry</code> di smart contract. Jika foto yang sama coba di-mint ulang, transaksi ditolak langsung di level konsensus blockchain — tidak bisa dibypass dari aplikasi manapun.
                </div>
                <div className="sec-code">
                  mapping(string =&gt; uint256) private _hashFotoRegistry<br/>
                  if (registry[hash] != 0) revert FotoDuplikat()
                </div>
              </div>

              <div className="sec-divider"/>

              {/* PERCEPTUAL HASH */}
              <div className="sec-item">
                <div className="sec-item-head">
                  <div className="sec-badge" style={{background:'#FFF7ED',borderColor:'#FED7AA',color:'#9A3412'}}>
                    <span>👁️</span> Visual Analysis
                  </div>
                  <div className="sec-status">Active</div>
                </div>
                <div className="sec-title">Perceptual Hash + Hamming Distance</div>
                <div className="sec-desc">
                  Selain SHA-256, sistem menghitung perceptual hash (pHash) menggunakan average hash 16×16 pixel. Dua foto dibandingkan dengan Hamming distance — jika jarak ≤5 bit dari 64 bit total, foto ditandai sebagai "sangat mirip" meski hash SHA-256-nya berbeda (misalnya foto diambil ulang atau di-screenshot).
                </div>
                <div className="sec-code">
                  pHash(img1) XOR pHash(img2)<br/>
                  → Hamming distance ≤5 = WARNING ⚠️
                </div>
              </div>

              <div className="sec-divider"/>

              {/* ERC-721 IMMUTABLE */}
              <div className="sec-item">
                <div className="sec-item-head">
                  <div className="sec-badge" style={{background:'#F5F3FF',borderColor:'#C4B5FD',color:'#5B21B6'}}>
                    <span>🎫</span> NFT Standard
                  </div>
                  <div className="sec-status">Active</div>
                </div>
                <div className="sec-title">ERC-721 Immutable Certification</div>
                <div className="sec-desc">
                  Setiap sertifikat kopi adalah NFT unik berbasis standar ERC-721 yang tidak dapat diduplikasi, diubah, atau dihapus setelah di-mint. Data kopi — jenis, grade, confidence CNN, nama petani, lokasi kebun, timestamp, dan hash foto — tersimpan permanen di blockchain Polygon Amoy.
                </div>
                <div className="sec-code">
                  Token ID #N → ipfs://CID_metadata<br/>
                  Immutable on Polygon Amoy · Block 37M+
                </div>
              </div>

              <div className="sec-divider"/>

              {/* IPFS CONTENT ADDRESSING */}
              <div className="sec-item">
                <div className="sec-item-head">
                  <div className="sec-badge" style={{background:'#FFF1F2',borderColor:'#FECDD3',color:'#9F1239'}}>
                    <span>📦</span> Decentralised Storage
                  </div>
                  <div className="sec-status">Active</div>
                </div>
                <div className="sec-title">IPFS Content-Addressed Storage</div>
                <div className="sec-desc">
                  Foto dan metadata NFT disimpan di IPFS menggunakan content addressing — CID (Content Identifier) dihitung dari konten file itu sendiri. Jika file berubah, CID-nya berubah. Ini memastikan foto kopi yang tersimpan di IPFS tidak bisa dimanipulasi tanpa terdeteksi.
                </div>
                <div className="sec-code">
                  CID = hash(content) via Pinata Gateway<br/>
                  ipfs://Qm... → permanent + verifiable
                </div>
              </div>

              <div className="sec-divider"/>

              {/* METAMASK */}
              <div className="sec-item">
                <div className="sec-item-head">
                  <div className="sec-badge" style={{background:'#FFFBEB',borderColor:'#FDE68A',color:'#92400E'}}>
                    <span>🦊</span> Wallet Security
                  </div>
                  <div className="sec-status">Active</div>
                </div>
                <div className="sec-title">MetaMask Transaction Signing</div>
                <div className="sec-desc">
                  Semua transaksi minting ditandatangani secara kriptografis oleh MetaMask menggunakan private key pengguna yang tidak pernah meninggalkan perangkat. Smart contract V3 mendukung permissionless minting — setiap petani dapat mensertifikasi kopi mereka sendiri dengan tetap mencatat wallet address untuk audit trail.
                </div>
                <div className="sec-code">
                  ECDSA signature · permissionless mint v3<br/>
                  Private key never leaves device · audit trail
                </div>
              </div>

              <div className="sec-divider"/>

              {/* OOD DETECTION — BARU */}
              <div className="sec-item" style={{marginBottom:0}}>
                <div className="sec-item-head">
                  <div className="sec-badge" style={{background:'#FFF7ED',borderColor:'#FED7AA',color:'#C2410C'}}>
                    <span>🛡️</span> AI Validation
                  </div>
                  <div className="sec-status">Active</div>
                </div>
                <div className="sec-title">Out-of-Distribution (OOD) Detection — 6-Class Model</div>
                <div className="sec-desc">
                  Model CNN RepViT-M1.1 versi terbaru menggunakan <strong>kelas ke-6 eksplisit "Non-Coffee"</strong>
                  yang dilatih dengan 1.500+ foto bukan biji kopi. Sistem penolakan kini berlapis tiga:
                  (1) Kelas Non-Coffee terdeteksi langsung → otomatis ditolak,
                  (2) Confidence &lt;60% → ditolak meskipun bukan kelas Non-Coffee,
                  (3) Entropy &gt;1.40 → model bingung → ditolak.
                  Test accuracy model: <strong>99.78%</strong> · OOD recall: <strong>98.7%</strong>.
                </div>
                <div className="sec-code">
                  if (pred_class == Non_Coffee) → DITOLAK (explicit)<br/>
                  if (confidence &lt; 60%) → DITOLAK (threshold)<br/>
                  if (entropy &gt; 1.40) → DITOLAK (entropy)<br/>
                  → 3-layer OOD · Accuracy 99.78%
                </div>
              </div>

            </div>

            {/* Security Score */}
            <div style={{margin:'0 20px 20px',background:'linear-gradient(135deg,#0C1F0C,#1A1A2E)',borderRadius:6,padding:'18px 20px',border:'1px solid rgba(201,168,76,.2)'}}>

              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,paddingBottom:12,borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                <div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.4)',letterSpacing:'2px',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:3}}>
                    SECURITY SCORE
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.3)',fontFamily:'sans-serif'}}>
                    Kopi Arabika Web3 — v2
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:28,fontWeight:700,color:'#86EFAC',lineHeight:1,fontFamily:'sans-serif'}}>
                    7/7
                  </div>
                  <div style={{fontSize:9,color:'#4CAF50',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'sans-serif',marginTop:2}}>
                    Layers Active
                  </div>
                </div>
              </div>

              {/* Layer rows */}
              {[
                {
                  icon:'🔑',
                  label:'SHA-256 Fingerprint',
                  desc:'Cryptographic photo hash',
                  color:'#4ADE80',
                  bg:'rgba(74,222,128,.15)',
                },
                {
                  icon:'⛓️',
                  label:'On-Chain Registry',
                  desc:'Consensus-layer block',
                  color:'#34D399',
                  bg:'rgba(52,211,153,.15)',
                },
                {
                  icon:'👁️',
                  label:'Perceptual Hash (pHash)',
                  desc:'Visual similarity ≤5 bits',
                  color:'#6EE7B7',
                  bg:'rgba(110,231,183,.15)',
                },
                {
                  icon:'🎫',
                  label:'ERC-721 Immutable NFT',
                  desc:'Polygon Amoy · Tamper-proof',
                  color:'#A78BFA',
                  bg:'rgba(167,139,250,.15)',
                },
                {
                  icon:'📦',
                  label:'IPFS Content-Addressing',
                  desc:'Decentralised · CID verified',
                  color:'#FCD34D',
                  bg:'rgba(252,211,77,.12)',
                },
                {
                  icon:'🦊',
                  label:'MetaMask ECDSA Signing',
                  desc:'onlyOwner · Private key safe',
                  color:'#FB923C',
                  bg:'rgba(251,146,60,.12)',
                },
                {
                  icon:'🛡️',
                  label:'OOD Detection (AI Validation)',
                  desc:'6-class · OOD 98.7% · Acc 99.78%',
                  color:'#F87171',
                  bg:'rgba(248,113,113,.12)',
                },
              ].map((item,i) => (
                <div key={i} style={{
                  display:'flex',alignItems:'center',gap:10,
                  padding:'9px 10px',marginBottom:6,
                  background:item.bg,
                  borderRadius:4,
                  border:`1px solid ${item.color}22`,
                }}>
                  {/* Icon */}
                  <div style={{
                    width:28,height:28,flexShrink:0,
                    background:'rgba(255,255,255,.05)',
                    borderRadius:4,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:14,
                  }}>
                    {item.icon}
                  </div>

                  {/* Label + desc */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{
                      fontSize:12,fontWeight:600,
                      color:'rgba(255,255,255,.9)',
                      fontFamily:'sans-serif',
                      lineHeight:1.2,
                      marginBottom:2,
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize:10,
                      color:'rgba(255,255,255,.4)',
                      fontFamily:'monospace',
                      letterSpacing:'.3px',
                    }}>
                      {item.desc}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div style={{
                    display:'flex',alignItems:'center',gap:4,
                    padding:'3px 8px',
                    background:'rgba(255,255,255,.05)',
                    borderRadius:20,
                    border:`1px solid ${item.color}44`,
                    flexShrink:0,
                  }}>
                    <div style={{
                      width:5,height:5,borderRadius:'50%',
                      background:item.color,
                      boxShadow:`0 0 4px ${item.color}`,
                    }}/>
                    <span style={{
                      fontSize:9,fontWeight:600,
                      color:item.color,
                      fontFamily:'monospace',
                      letterSpacing:'1px',
                      textTransform:'uppercase',
                    }}>
                      Active
                    </span>
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div style={{
                marginTop:12,paddingTop:10,
                borderTop:'1px solid rgba(255,255,255,.06)',
                display:'flex',justifyContent:'space-between',
                alignItems:'center',
              }}>
                <div style={{fontSize:9,color:'rgba(167,243,208,.6)',fontFamily:'monospace',letterSpacing:'1px',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#10B981',boxShadow:'0 0 6px #10B981'}}/>
                  CONTRACT V3 · VERIFIED
                </div>
                <a
                  href="https://amoy.polygonscan.com/address/0x5392C2F10d8Dea3e498726BcB8c806E8DA78834b#code"
                  target="_blank" rel="noreferrer"
                  style={{fontSize:9,color:'rgba(167,243,208,.6)',fontFamily:'monospace',textDecoration:'none',transition:'color .2s'}}
                  onMouseOver={(e)=>e.target.style.color='#A7F3D0'}
                  onMouseOut={(e)=>e.target.style.color='rgba(167,243,208,.6)'}
                >
                  0x5392...8834b ↗
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* ====== KOLOM KANAN ====== */}
        <div>
          {/* Card upload & form */}
          <div className="card">
            <div className="card-head">
              <div className="head-ico">📸</div>
              <div className="head-title">Klasifikasi Biji Kopi dengan AI</div>
            </div>
            <div style={{padding:'20px'}}>
              <p className="sec-label">Foto Biji Kopi</p>
              <div className="upload-zone mg-b-4" onClick={()=>fileRef.current.click()}>
                {preview
                  ? <img src={preview} alt="preview" style={{width:'100%',maxHeight:'260px',objectFit:'contain'}}/>
                  : <div className="up-ph"><div className="up-ico">📷</div><div className="up-txt">Klik untuk upload foto</div><div className="up-sub">Dari kamera HP atau galeri · JPG, PNG</div></div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFoto} capture="environment"/>

              <p className="sec-label mg-t-5">Data Petani</p>
              <div className="mg-b-3">
                <label className="lbl">👤 Nama Petani</label>
                <input className="inp" placeholder="Contoh: Pak Ahmad Fauzi" value={namaPetani} onChange={e=>setNamaPetani(e.target.value)}/>
              </div>
              <div className="mg-b-4">
                <label className="lbl">📍 Lokasi Kebun</label>
                <input className="inp" placeholder="Contoh: Desa Tugusari, Bondowoso, Jawa Timur" value={lokasi} onChange={e=>setLokasi(e.target.value)}/>
              </div>

              <button className="btn-go" onClick={klasifikasiCNN} disabled={!foto||loading}>
                {loading&&!hasilCNN
                  ? <span style={{color:'#FFFFFF',fontWeight:800,fontSize:14,textShadow:'0 2px 4px rgba(0,0,0,.4)',letterSpacing:'1px'}}>⏳ {status||'Memproses...'}</span>
                  : <span style={{color:'#FFFFFF',fontWeight:800,fontSize:14,textShadow:'0 2px 4px rgba(0,0,0,.4)',letterSpacing:'1px'}}>🔍 Klasifikasi dengan CNN</span>}
              </button>
              {errorMsg && <div className="err">{errorMsg}</div>}

              {/* Info hash foto */}
              {fotoHash && !duplikat && (
                <div style={{marginTop:10,background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:10,padding:'8px 12px',fontSize:11}}>
                  <div style={{color:'#166534',fontWeight:700,marginBottom:2}}>🔐 Fingerprint SHA-256 Foto</div>
                  <div style={{fontFamily:'monospace',color:'#166534',wordBreak:'break-all',fontSize:10}}>{fotoHash.slice(0,32)}...{fotoHash.slice(-8)}</div>
                  <div style={{color:'#6B7280',marginTop:2,fontSize:10}}>Hash unik ini membuktikan keaslian foto Anda di blockchain</div>
                </div>
              )}

              {/* Peringatan / blokir duplikat */}
              {duplikat && (
                <div style={{marginTop:10,background:duplikat.warna,border:`1.5px solid ${duplikat.border}`,borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>
                    {duplikat.icon} {duplikat.tipe === 'IDENTIK' ? 'FOTO TERDETEKSI DUPLIKAT!' : 'PERINGATAN: Foto Sangat Mirip'}
                  </div>
                  <div style={{fontSize:12,lineHeight:1.6,color:'#374151'}}>{duplikat.pesan}</div>
                  {duplikat.tokenId && (
                    <a href={`https://amoy.polygonscan.com/token/${CONTRACT_ADDRESS}?a=${duplikat.tokenId}`}
                       target="_blank" rel="noreferrer"
                       style={{display:'block',marginTop:8,fontSize:11,color:'#1D4ED8',fontWeight:700}}>
                      🔍 Lihat NFT Asli #{duplikat.tokenId} di Polygonscan →
                    </a>
                  )}
                  {duplikat.tipe === 'IDENTIK' && (
                    <div style={{marginTop:8,fontSize:11,color:'#B91C1C',fontWeight:700}}>
                      ❌ Foto ini tidak dapat di-mint ulang — sudah terdaftar di blockchain
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ══ BUKAN BIJI KOPI ══ */}
          {bukanKopi && !hasilCNN && (
            <div style={{
              background:'#FFF3E0',
              border:'2px solid #FF6D00',
              borderRadius:14,padding:22,marginBottom:20,
            }}>
              {/* Header */}
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <div style={{
                  width:48,height:48,borderRadius:12,
                  background:'#FF6D00',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:24,flexShrink:0,
                }}>🚫</div>
                <div>
                  <div style={{
                    fontSize:16,fontWeight:700,color:'#BF360C',
                    fontFamily:'sans-serif',marginBottom:3,
                  }}>Gambar Tidak Dapat Diklasifikasi</div>
                  <div style={{fontSize:12,color:'#E64A19',fontFamily:'sans-serif'}}>
                    Bukan biji kopi Arabika yang valid
                  </div>
                </div>
              </div>

              {/* Penjelasan */}
              <div style={{
                background:'rgba(255,255,255,.7)',borderRadius:10,
                padding:'14px 16px',marginBottom:14,
                border:'1px solid rgba(255,109,0,.2)',
              }}>
                <div style={{fontSize:13,fontWeight:700,color:'#BF360C',marginBottom:8,fontFamily:'sans-serif'}}>
                  ❌ Mengapa ditolak?
                </div>
                <div style={{fontSize:12,color:'#5D4037',lineHeight:1.8,fontFamily:'sans-serif'}}>
                  Model CNN RepViT-M1.1 tidak mendeteksi ciri-ciri biji kopi Arabika pada gambar yang Anda upload.
                  Sistem secara otomatis menolak gambar yang tidak sesuai untuk mencegah klasifikasi yang salah.
                </div>
              </div>

              {/* Panduan */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:'#E64A19',marginBottom:8,fontFamily:'sans-serif'}}>
                  ✅ Panduan foto yang benar:
                </div>
                {[
                  ['📸','Foto biji kopi Arabika (belum digiling/diseduh)'],
                  ['☀️','Pencahayaan cukup, tidak gelap atau silau'],
                  ['⬜','Latar belakang polos (putih atau terang)'],
                  ['🔭','Fokus jelas pada biji kopi, tidak blur'],
                  ['📐','Ambil dari atas (top-view) lebih baik'],
                  ['🚫','Hindari foto minuman kopi, bubuk kopi, atau tanaman kopi'],
                ].map(([ico, txt], i) => (
                  <div key={i} style={{
                    display:'flex',gap:8,alignItems:'center',
                    fontSize:12,color:'#4E342E',fontFamily:'sans-serif',
                    padding:'4px 0',
                  }}>
                    <span style={{fontSize:14}}>{ico}</span>
                    <span>{txt}</span>
                  </div>
                ))}
              </div>

              {/* 5 Kelas */}
              <div style={{
                background:'rgba(255,255,255,.6)',borderRadius:10,
                padding:'12px 14px',marginBottom:14,
                border:'1px solid rgba(255,109,0,.15)',
              }}>
                <div style={{fontSize:11,fontWeight:700,color:'#BF360C',marginBottom:8,fontFamily:'monospace',letterSpacing:1,textTransform:'uppercase'}}>
                  5 Varietas yang dapat diidentifikasi:
                </div>
                {[
                  ['🌋','Arabika Natural Ijen','Bondowoso, Jawa Timur'],
                  ['🫘','Arabika Peaberry','Biji bulat tunggal unik'],
                  ['🧪','Arabika Anaerob Carbonic','Fermentasi anaerobik'],
                  ['🍊','Arabika Orange Bourbon','Varietas Bourbon langka'],
                  ['🏔️','Arabika Blue Mountain','Premium adaptasi Jamaica'],
                ].map(([ico, nama, desc], i) => (
                  <div key={i} style={{
                    display:'flex',gap:8,alignItems:'center',
                    padding:'5px 0',
                    borderBottom: i < 4 ? '0.5px solid rgba(255,109,0,.1)' : 'none',
                  }}>
                    <span style={{fontSize:16}}>{ico}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:'#4E342E',fontFamily:'sans-serif'}}>{nama}</div>
                      <div style={{fontSize:10,color:'#8D6E63',fontFamily:'sans-serif'}}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol coba lagi */}
              <button
                onClick={() => {
                  setBukanKopi(false); setFoto(null); setPreview(null)
                  setErrorMsg(''); setStatus(''); setDuplikat(null)
                  setFotoHash('')
                }}
                style={{
                  width:'100%',padding:'13px',
                  background:'linear-gradient(135deg,#E64A19,#FF7043)',
                  color:'#FFFFFF',border:'none',borderRadius:12,
                  fontSize:13,fontWeight:700,fontFamily:'sans-serif',
                  cursor:'pointer',letterSpacing:'.3px',
                  boxShadow:'0 4px 14px rgba(230,74,25,.4)',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                }}
              >
                📷 Upload Foto Biji Kopi yang Benar
              </button>
            </div>
          )}

          {/* Hasil CNN */}
          {hasilCNN && !txHash && (
            <div className="card">
              <div className="card-head">
                <div className="head-ico">{gs.emoji}</div>
                <div className="head-title">Hasil Klasifikasi AI</div>
              </div>
              <div style={{padding:'20px'}}>
                <div className="hasil-box" style={{background:gs.bg,borderColor:gs.border}}>
                  <div className="hasil-title" style={{color:gs.text}}>{gs.emoji} {hasilCNN.jenis_kopi.replace(/_/g,' ')}</div>
                  <div className="hasil-row">
                    <span className="hasil-lbl">Confidence CNN</span>
                    <span className="hasil-val">{hasilCNN.confidence.toFixed(2)}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fg" style={{width:`${hasilCNN.confidence}%`,background:gs.border}}/>
                  </div>
                  <div className="hasil-row">
                    <span className="hasil-lbl">Grade Kualitas</span>
                    <span className="hasil-val" style={{color:gs.text}}>{gs.emoji} {hasilCNN.grade}</span>
                  </div>
                  <div className="hasil-row">
                    <span className="hasil-lbl">Model AI</span>
                    <span className="hasil-val" style={{fontSize:11}}>RepViT-M1.1 (CVPR 2024)</span>
                  </div>
                </div>
                <div className="mg-t-4">
                  <button className="btn-mint" onClick={mintNFT} disabled={loading}>
                    {loading ? <><span>⏳</span>{status}</> : <><span>🔗</span>Mint NFT ke Blockchain Polygon</>}
                  </button>
                  {status&&!loading && <p className="sts">{status}</p>}
                  {errorMsg && <div className="err">{errorMsg}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Sukses NFT */}
          {txHash && (
            <div className="sukses">
              <div className="sukses-title">🎉 NFT Berhasil Di-mint!</div>

              {/* Token ID */}
              {tokenId !== null && (
                <div className="hash-box" style={{background:'#F0FDF4',borderColor:'#86EFAC'}}>
                  <div className="hash-lbl">🏷️ Token ID NFT Anda</div>
                  <div style={{fontSize:20,fontWeight:700,color:'#14532D',fontFamily:'monospace'}}>#{tokenId}</div>
                </div>
              )}

              <div className="hash-box"><div className="hash-lbl">Transaction Hash</div><div className="hash-val">{txHash}</div></div>
              {cidFoto && <div className="hash-box"><div className="hash-lbl">CID Foto IPFS</div><div className="hash-val">{cidFoto}</div></div>}

              {/* Tombol Tambah ke MetaMask */}
              {!nftAdded ? (
                <button onClick={addNFTtoWallet} disabled={addingNFT}
                  style={{width:'100%',padding:'13px',background:addingNFT?'#D1D5DB':'linear-gradient(135deg,#F97316,#EA580C)',
                    color:'#FFF',border:'none',borderRadius:11,fontSize:13,fontWeight:700,
                    fontFamily:'Lato,sans-serif',cursor:addingNFT?'wait':'pointer',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8
                  }}
                >
                  {addingNFT ? '⏳ Menambahkan ke wallet...' : '🦊 Tambah NFT ke MetaMask Wallet'}
                </button>
              ) : (
                <div style={{background:'#F0FDF4',border:'1.5px solid #86EFAC',borderRadius:11,
                  padding:'14px',marginBottom:8,textAlign:'center'}}>
                  <div style={{fontSize:24,marginBottom:4}}>✅</div>
                  <div style={{fontSize:13,fontWeight:700,color:'#14532D'}}>NFT berhasil masuk ke MetaMask!</div>
                  <div style={{fontSize:11,color:'#6B7280',marginTop:3}}>Buka MetaMask → tab <strong>NFTs</strong> untuk melihat</div>
                </div>
              )}

              <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="btn-a a-blue">🔍 Verifikasi di Polygonscan</a>
              {cidFoto && <a href={`https://${PINATA_GATEWAY}/ipfs/${cidFoto}`} target="_blank" rel="noreferrer" className="btn-a a-orange">🖼️ Lihat Foto di IPFS</a>}

              {/* Panduan import manual */}
              {tokenId !== null && (
                <div style={{background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:11,
                  padding:'12px 14px',marginBottom:8,fontSize:11,color:'#92400E',lineHeight:1.6}}>
                  <strong>📋 Import Manual ke MetaMask (jika tombol di atas gagal):</strong><br/>
                  1. Buka MetaMask → tab <strong>NFTs</strong><br/>
                  2. Klik <strong>Import NFT</strong><br/>
                  3. Contract Address: <code style={{fontSize:9,wordBreak:'break-all',display:'block',marginTop:2}}>{CONTRACT_ADDRESS}</code>
                  4. Token ID: <strong>#{tokenId}</strong>
                </div>
              )}

              <button className="btn-a a-ghost" onClick={()=>{
                setFoto(null);setPreview(null);setHasilCNN(null);
                setTxHash('');setCidFoto('');setNamaPetani('');setLokasi('');
                setStatus('');setErrorMsg('');setTokenId(null);setNftAdded(false);
                setBukanKopi(false);setDuplikat(null);setFotoHash('');
              }}>↩️ Klasifikasi Kopi Baru</button>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
