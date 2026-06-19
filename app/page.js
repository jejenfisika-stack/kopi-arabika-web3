'use client'

import { useState, useRef, useEffect } from 'react'
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

// ============================================================
// Data 5 varietas (dwibahasa)
// ============================================================
const INFO_KOPI = [
  { emoji:'🌋', color:'#E63946',
    judul:{ id:'Arabika Natural Ijen', en:'Ijen Natural Arabica' },
    isi:{ id:'Ditanam di lereng Gunung Ijen, Bondowoso pada ketinggian 900–1.500 mdpl. Terkenal dengan cita rasa fruity dan wine-like yang khas dari proses natural.',
          en:'Grown on the slopes of Mount Ijen, Bondowoso at 900–1,500 masl. Known for its distinctive fruity, wine-like flavor from natural processing.' } },
  { emoji:'🫘', color:'#F77F00',
    judul:{ id:'Arabika Peaberry', en:'Peaberry Arabica' },
    isi:{ id:'Biji kopi bulat tunggal hasil mutasi alami. Rasa lebih terkonsentrasi, aroma floral kuat, body lebih ringan dibanding biji normal.',
          en:'A single round bean from a natural mutation. More concentrated flavor, strong floral aroma, and a lighter body than normal beans.' } },
  { emoji:'🧪', color:'#E0A100',
    judul:{ id:'Arabika Anaerob Carbonic', en:'Carbonic Anaerobic Arabica' },
    isi:{ id:'Diproses fermentasi anaerobik karbonasi. Menghasilkan rasa eksotis, kompleks — buah tropis dengan sparkling sensation yang unik.',
          en:'Processed via carbonic anaerobic fermentation. Produces an exotic, complex flavor — tropical fruit with a unique sparkling sensation.' } },
  { emoji:'🍊', color:'#7CB518',
    judul:{ id:'Arabika Orange Bourbon', en:'Orange Bourbon Arabica' },
    isi:{ id:'Varietas Bourbon langka berwarna oranye. Rasa manis, citrus, honey, body sedang-tebal. Sangat diminati di pasar specialty coffee dunia.',
          en:'A rare orange-colored Bourbon variety. Sweet, citrus, and honey notes with a medium-full body. Highly sought after in the global specialty coffee market.' } },
  { emoji:'🏔️', color:'#2E8B57',
    judul:{ id:'Arabika Blue Mountain', en:'Blue Mountain Arabica' },
    isi:{ id:'Varietas premium adaptasi Jamaica. Rasa ringan, bersih, balance sempurna, tidak pahit. Salah satu kopi paling prestigious di dunia.',
          en:'A premium variety adapted from Jamaica. Light, clean, perfectly balanced, and not bitter. One of the most prestigious coffees in the world.' } },
]

// ============================================================
// Cara pakai (dwibahasa)
// ============================================================
const CARA_PAKAI = [
  { judul:{ id:'Upload Foto', en:'Upload Photo' },
    isi:{ id:'Klik area foto, pilih gambar biji kopi dari galeri HP atau ambil langsung dengan kamera.',
          en:'Tap the photo area, pick a coffee-bean image from your gallery, or capture one with the camera.' } },
  { judul:{ id:'Isi Data Petani', en:'Enter Farmer Data' },
    isi:{ id:'Masukkan nama petani dan lokasi kebun. Data ini akan tercatat dalam sertifikat NFT di blockchain.',
          en:'Enter the farmer name and farm location. This data is recorded in the NFT certificate on the blockchain.' } },
  { judul:{ id:'Klasifikasi CNN', en:'CNN Classification' },
    isi:{ id:'Klik tombol klasifikasi. Model AI RepViT-M1.1 mengidentifikasi jenis dan grade kopi dalam hitungan detik.',
          en:'Click the classify button. The RepViT-M1.1 AI model identifies the coffee type and grade in seconds.' } },
  { judul:{ id:'Mint NFT', en:'Mint NFT' },
    isi:{ id:'Klik "Mint NFT". MetaMask terbuka untuk konfirmasi transaksi ke blockchain Polygon Amoy.',
          en:'Click "Mint NFT". MetaMask opens to confirm the transaction to the Polygon Amoy blockchain.' } },
  { judul:{ id:'Sertifikat Digital', en:'Digital Certificate' },
    isi:{ id:'NFT tersimpan permanen di blockchain sebagai bukti keaslian dan kualitas kopi Anda.',
          en:'The NFT is stored permanently on the blockchain as proof of your coffee’s authenticity and quality.' } },
]

// ============================================================
// Tech stack (nama tetap, deskripsi dwibahasa)
// ============================================================
const TECH = [
  { e:'🤖', name:'RepViT-M1.1', desc:{ id:'CNN CVPR 2024, akurasi 99.78%', en:'CNN · CVPR 2024 · 99.78% accuracy' } },
  { e:'⛓️', name:'Polygon Amoy', desc:{ id:'Blockchain testnet, standar ERC-721', en:'Testnet blockchain · ERC-721 standard' } },
  { e:'📦', name:'Pinata IPFS', desc:{ id:'Penyimpanan gambar terdesentralisasi', en:'Decentralized image storage' } },
  { e:'🦊', name:'MetaMask', desc:{ id:'Dompet Web3 & tanda tangan transaksi', en:'Web3 wallet & transaction signing' } },
  { e:'🤗', name:'Hugging Face', desc:{ id:'Inferensi AI server-side (API)', en:'Server-side AI inference (API)' } },
  { e:'▲', name:'Vercel', desc:{ id:'Deployment edge global', en:'Global edge deployment' } },
]

// ============================================================
// 7 lapis keamanan (judul & desc dwibahasa, code teknis tetap)
// ============================================================
const LAYERS = [
  { title:{ id:'Sidik Jari SHA-256', en:'SHA-256 Fingerprint' },
    desc:{ id:'Setiap foto biji kopi dikonversi menjadi fingerprint kriptografis 256-bit unik via Web Cryptography API. Hash ini tidak dapat dibalik atau dipalsukan.',
           en:'Each coffee-bean photo is converted into a unique 256-bit cryptographic fingerprint via the Web Cryptography API. The hash cannot be reversed or forged.' },
    code:"crypto.subtle.digest('SHA-256', imageBuffer) → 64-char hex" },
  { title:{ id:'Registry On-Chain', en:'On-Chain Registry' },
    desc:{ id:'Hash SHA-256 tersimpan dalam mapping registry di smart contract. Foto yang sama tidak bisa di-mint ulang — ditolak di level konsensus blockchain.',
           en:'The SHA-256 hash is stored in a registry mapping in the smart contract. The same photo cannot be re-minted — it is rejected at the blockchain consensus level.' },
    code:'if (registry[hash] != 0) revert FotoDuplikat()' },
  { title:{ id:'Perceptual Hash', en:'Perceptual Hash' },
    desc:{ id:'Average hash 16×16 piksel dibandingkan dengan Hamming distance. Jarak ≤5 bit menandai foto yang nyaris identik meski SHA-256-nya berbeda.',
           en:'A 16×16-pixel average hash is compared using Hamming distance. A distance ≤5 bits flags near-identical photos even when their SHA-256 differs.' },
    code:'pHash(img1) XOR pHash(img2) → distance ≤5 = WARNING ⚠️' },
  { title:{ id:'Sertifikat ERC-721', en:'ERC-721 Certificate' },
    desc:{ id:'Sertifikat NFT immutable menyimpan jenis kopi, grade, confidence CNN, nama petani, lokasi, timestamp, dan hash foto secara permanen di Polygon Amoy.',
           en:'An immutable NFT certificate permanently stores the coffee type, grade, CNN confidence, farmer name, location, timestamp, and photo hash on Polygon Amoy.' },
    code:'Token ID #N → ipfs://CID_metadata · immutable' },
  { title:{ id:'IPFS Content-Addressing', en:'IPFS Content-Addressing' },
    desc:{ id:'Foto & metadata disimpan via CID yang dihitung dari isi file. Jika file berubah, CID-nya berubah — manipulasi langsung terdeteksi.',
           en:'Photos & metadata are stored via a CID computed from the file contents. If the file changes, its CID changes — tampering is immediately detectable.' },
    code:'CID = hash(content) via Pinata Gateway' },
  { title:{ id:'MetaMask ECDSA', en:'MetaMask ECDSA' },
    desc:{ id:'Transaksi ditandatangani kriptografis oleh MetaMask; private key tetap di perangkat pengguna. Mendukung permissionless minting dengan audit trail.',
           en:'Transactions are cryptographically signed by MetaMask; the private key never leaves the user’s device. Supports permissionless minting with an audit trail.' },
    code:'ECDSA signature · private key never leaves device' },
  { title:{ id:'Deteksi OOD (AI)', en:'OOD Detection (AI)' },
    desc:{ id:'Validasi 3 lapis: kelas "Non-Coffee" eksplisit, ambang confidence <60%, dan entropy >1.40. Test accuracy 99.78%, OOD recall 98.7%.',
           en:'3-layer validation: an explicit "Non-Coffee" class, a confidence threshold <60%, and entropy >1.40. Test accuracy 99.78%, OOD recall 98.7%.' },
    code:'Non-Coffee / conf<60% / entropy>1.40 → REJECTED' },
]

// ============================================================
// Kamus teks UI (dwibahasa)
// ============================================================
const STR = {
  id: {
    brandSub:'Riset Unggulan · Universitas Jember',
    connect:'🦊 Connect Wallet', connecting:'⏳ Menghubungkan...', disconnect:'Disconnect',
    heroTitle:'Klasifikasi Kopi Arabika dengan AI',
    heroSub:'5 varietas arabika unggulan terverifikasi AI & tercatat di blockchain. Deteksi jenis & grade kopi secara cepat, transparan, dan terdesentralisasi untuk kopi specialty Nusantara.',
    blkCert:'SERTIFIKAT', waiting:'⏳ Menunggu', verified:'✓ Terverifikasi',
    secClassHead:'Cek Kualitas Biji Kopi dengan AI',
    secClassSub:'Unggah foto biji kopi arabika — model RepViT akan mengklasifikasikan jenis & grade, dan otomatis menolak gambar yang bukan biji kopi.',
    uploadStrong:'Klik untuk unggah foto', uploadHint:'Dari kamera HP atau galeri · JPG, PNG',
    labelFarmer:'👤 Nama Petani', phFarmer:'Contoh: Pak Ahmad Fauzi',
    labelLoc:'📍 Lokasi Kebun', phLoc:'Contoh: Desa Tugusari, Bondowoso, Jawa Timur',
    btnClassify:'🔍 Klasifikasi dengan CNN', processing:'Memproses...',
    fpTitle:'🔐 Fingerprint SHA-256 Foto', fpNote:'Hash unik ini membuktikan keaslian foto Anda di blockchain.',
    dupIdentik:'FOTO TERDETEKSI DUPLIKAT!', dupMirip:'PERINGATAN: Foto Sangat Mirip',
    dupBlocked:'❌ Foto ini tidak dapat di-mint ulang — sudah terdaftar di blockchain.',
    dupSeeNft:(n)=>`🔍 Lihat NFT Asli #${n} di Polygonscan →`,
    dupMsgIdentik:(n)=>`Foto ini IDENTIK dengan NFT #${n} yang sudah ada di blockchain!`,
    dupMsgMirip:(d)=>`Foto ini SANGAT MIRIP dengan foto yang baru-baru ini diproses (jarak: ${d}/64). Pastikan ini foto yang berbeda!`,
    rejTitle:'🚫 Gambar Tidak Dapat Diklasifikasi',
    rejBody:'Model CNN RepViT-M1.1 tidak mendeteksi ciri-ciri biji kopi Arabika pada gambar Anda. Sistem otomatis menolak gambar yang tidak sesuai untuk mencegah klasifikasi yang salah.',
    rejGuideTitle:'✅ Panduan foto yang benar:',
    rejGuide:['Foto biji kopi Arabika (belum digiling/diseduh)','Pencahayaan cukup, latar polos, fokus jelas','Ambil dari atas (top-view) lebih baik','Hindari foto minuman/bubuk kopi atau tanaman kopi'],
    rejBtn:'📷 Upload Foto Biji Kopi yang Benar',
    resConf:'Confidence CNN', resGrade:'Grade Kualitas', resModel:'Model AI',
    btnMint:'🔗 Mint NFT ke Blockchain Polygon',
    successTitle:'🎉 NFT Berhasil Di-mint!',
    tokenIdLbl:'🏷️ Token ID NFT Anda', txHashLbl:'Transaction Hash', cidLbl:'CID Foto IPFS',
    addNft:'🦊 Tambah NFT ke MetaMask Wallet', addingNft:'Menambahkan ke wallet...',
    nftAddedMsg:'✅ NFT berhasil masuk ke MetaMask! Buka tab NFTs untuk melihat.',
    verifyPoly:'🔍 Verifikasi di Polygonscan', seePhoto:'🖼️ Lihat Foto di IPFS', newClass:'↩️ Klasifikasi Kopi Baru',
    btnMeta:'🧾 Cek Metadata', btnMetaHide:'🧾 Sembunyikan Metadata',
    metaTitle:'🧾 Metadata NFT (ERC-721)', metaLoadingTxt:'Memuat metadata dari IPFS...',
    metaErr:'Gagal memuat metadata. Buka langsung di IPFS:', metaRaw:'Lihat JSON mentah di IPFS ↗',
    secVarHead:'5 Varietas yang Dikenali', secVarSub:'Model dilatih mengenali lima varietas arabika unggulan, lengkap dengan karakter rasa khasnya.',
    secStepHead:'Cara Menggunakan', secStepSub:'Lima langkah dari foto biji kopi hingga sertifikat digital di blockchain.',
    secTechHead:'Tumpukan Teknologi', secTechSub:'Komponen inti yang menyusun sistem Kopi Arabika Web3.',
    secSecHead:'Arsitektur Keamanan', secSecSub:'Tujuh lapis pertahanan untuk menjamin keaslian foto, integritas data, dan validitas sertifikat kopi.',
    scoreBig:'7/7 Lapis Aktif', scoreDesc:'Sistem pertahanan berlapis melindungi setiap sertifikat kopi.', scoreContract:'Smart Contract V3 (Polygon Amoy)',
    footer:'☕ Kopi Arabika Web3 — Klasifikasi Kopi Arabika berbasis AI & Blockchain · Model RepViT-M1.1 di Hugging Face Space (server-side) · Jaringan Polygon Amoy Testnet · Universitas Jember',
    stVerifying:'🔍 Memverifikasi keaslian foto...', stUploading:'Mengunggah foto ke model AI...', stClassifying:'Mengklasifikasi dengan CNN RepViT-M1.1...', stWaitAI:'Menunggu hasil AI...', stUploadIpfs:'Mengupload foto ke IPFS...', stConnectMM:'Menghubungkan MetaMask...', stSendTx:'Mengirim transaksi ke Polygon Amoy...', stWaitChain:'Menunggu konfirmasi blockchain...', stAddMM:'Menambahkan NFT ke MetaMask...',
    alPickPhoto:'Pilih foto kopi terlebih dahulu!', alFarmer:'Isi Nama Petani!', alLoc:'Isi Lokasi Kebun!', alClassFirst:'Klasifikasi CNN dulu!',
    alNoMM:'MetaMask tidak ditemukan!\nInstall MetaMask dari metamask.io', alInstallMM:'Install MetaMask terlebih dahulu!',
    alConnFail:'Gagal connect: ', alTokenNF:'Token ID tidak ditemukan. Coba import manual.', alNotAdded:'NFT tidak ditambahkan. Coba import manual.', alRejected:'Ditolak user.',
    alManual:(addr,id)=>`Gunakan cara manual: MetaMask → NFTs → Import NFT\nContract: ${addr}\nToken ID: ${id}`,
  },
  en: {
    brandSub:'Featured Research · University of Jember',
    connect:'🦊 Connect Wallet', connecting:'⏳ Connecting...', disconnect:'Disconnect',
    heroTitle:'Arabica Coffee Classification with AI',
    heroSub:'5 premium arabica varieties verified by AI & recorded on the blockchain. Fast, transparent, and decentralized coffee type & grade detection for Indonesian specialty coffee.',
    blkCert:'CERTIFICATE', waiting:'⏳ Pending', verified:'✓ Verified',
    secClassHead:'Check Coffee Bean Quality with AI',
    secClassSub:'Upload a photo of arabica coffee beans — the RepViT model will classify the type & grade, and automatically reject images that are not coffee beans.',
    uploadStrong:'Click to upload a photo', uploadHint:'From your phone camera or gallery · JPG, PNG',
    labelFarmer:'👤 Farmer Name', phFarmer:'e.g. Ahmad Fauzi',
    labelLoc:'📍 Farm Location', phLoc:'e.g. Tugusari Village, Bondowoso, East Java',
    btnClassify:'🔍 Classify with CNN', processing:'Processing...',
    fpTitle:'🔐 Photo SHA-256 Fingerprint', fpNote:'This unique hash proves your photo’s authenticity on the blockchain.',
    dupIdentik:'DUPLICATE PHOTO DETECTED!', dupMirip:'WARNING: Very Similar Photo',
    dupBlocked:'❌ This photo cannot be re-minted — it is already registered on the blockchain.',
    dupSeeNft:(n)=>`🔍 View original NFT #${n} on Polygonscan →`,
    dupMsgIdentik:(n)=>`This photo is IDENTICAL to NFT #${n} already on the blockchain!`,
    dupMsgMirip:(d)=>`This photo is VERY SIMILAR to one processed recently (distance: ${d}/64). Make sure it is a different photo!`,
    rejTitle:'🚫 Image Cannot Be Classified',
    rejBody:'The RepViT-M1.1 CNN model did not detect arabica coffee-bean characteristics in your image. The system automatically rejects unsuitable images to prevent misclassification.',
    rejGuideTitle:'✅ Correct photo guidelines:',
    rejGuide:['Photo of arabica coffee beans (not ground/brewed)','Good lighting, plain background, clear focus','Top-view shots work best','Avoid photos of coffee drinks/powder or coffee plants'],
    rejBtn:'📷 Upload a Proper Coffee-Bean Photo',
    resConf:'CNN Confidence', resGrade:'Quality Grade', resModel:'AI Model',
    btnMint:'🔗 Mint NFT to Polygon Blockchain',
    successTitle:'🎉 NFT Minted Successfully!',
    tokenIdLbl:'🏷️ Your NFT Token ID', txHashLbl:'Transaction Hash', cidLbl:'IPFS Photo CID',
    addNft:'🦊 Add NFT to MetaMask Wallet', addingNft:'Adding to wallet...',
    nftAddedMsg:'✅ NFT added to MetaMask! Open the NFTs tab to view it.',
    verifyPoly:'🔍 Verify on Polygonscan', seePhoto:'🖼️ View Photo on IPFS', newClass:'↩️ Classify New Coffee',
    btnMeta:'🧾 Check Metadata', btnMetaHide:'🧾 Hide Metadata',
    metaTitle:'🧾 NFT Metadata (ERC-721)', metaLoadingTxt:'Loading metadata from IPFS...',
    metaErr:'Failed to load metadata. Open directly on IPFS:', metaRaw:'View raw JSON on IPFS ↗',
    secVarHead:'5 Recognized Varieties', secVarSub:'The model is trained to recognize five premium arabica varieties, each with its distinctive flavor character.',
    secStepHead:'How to Use', secStepSub:'Five steps from a coffee-bean photo to a digital certificate on the blockchain.',
    secTechHead:'Technology Stack', secTechSub:'The core components that make up the Kopi Arabika Web3 system.',
    secSecHead:'Security Architecture', secSecSub:'Seven layers of defense to ensure photo authenticity, data integrity, and certificate validity.',
    scoreBig:'7/7 Layers Active', scoreDesc:'A layered defense system protects every coffee certificate.', scoreContract:'Smart Contract V3 (Polygon Amoy)',
    footer:'☕ Kopi Arabika Web3 — AI & Blockchain-based Arabica Coffee Classification · RepViT-M1.1 model on Hugging Face Space (server-side) · Polygon Amoy Testnet · University of Jember',
    stVerifying:'🔍 Verifying photo authenticity...', stUploading:'Uploading photo to the AI model...', stClassifying:'Classifying with RepViT-M1.1 CNN...', stWaitAI:'Waiting for AI result...', stUploadIpfs:'Uploading photo to IPFS...', stConnectMM:'Connecting MetaMask...', stSendTx:'Sending transaction to Polygon Amoy...', stWaitChain:'Waiting for blockchain confirmation...', stAddMM:'Adding NFT to MetaMask...',
    alPickPhoto:'Please select a coffee photo first!', alFarmer:'Please enter the Farmer Name!', alLoc:'Please enter the Farm Location!', alClassFirst:'Run CNN classification first!',
    alNoMM:'MetaMask not found!\nInstall MetaMask from metamask.io', alInstallMM:'Please install MetaMask first!',
    alConnFail:'Failed to connect: ', alTokenNF:'Token ID not found. Try importing manually.', alNotAdded:'NFT was not added. Try importing manually.', alRejected:'Rejected by user.',
    alManual:(addr,id)=>`Use the manual method: MetaMask → NFTs → Import NFT\nContract: ${addr}\nToken ID: ${id}`,
  },
}

export default function HomePage() {
  const [lang, setLang]             = useState('id')
  const [foto, setFoto]             = useState(null)
  const [preview, setPreview]       = useState(null)
  const [namaPetani, setNamaPetani] = useState('')
  const [lokasi, setLokasi]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [status, setStatus]         = useState('')
  const [hasilCNN, setHasilCNN]     = useState(null)
  const [txHash, setTxHash]         = useState('')
  const [cidFoto, setCidFoto]       = useState('')
  const [cidMetadata, setCidMetadata] = useState('')
  const [showMeta, setShowMeta]     = useState(false)
  const [metaJson, setMetaJson]     = useState(null)
  const [metaLoading, setMetaLoading] = useState(false)
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

  const t = STR[lang]

  // Muat pilihan bahasa tersimpan (setelah hydration, hindari mismatch)
  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved === 'id' || saved === 'en') setLang(saved)
  }, [])

  function toggleLang() {
    const next = lang === 'id' ? 'en' : 'id'
    setLang(next)
    try { localStorage.setItem('lang', next) } catch (_) {}
  }

  // ============================================================
  // Connect / Disconnect Wallet
  // ============================================================
  async function handleConnectWallet() {
    if (walletAddr) { setWalletAddr(''); return }
    if (!window.ethereum) {
      alert(t.alNoMM)
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
      alert(t.alConnFail + err.message)
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
    if (!foto) { alert(t.alPickPhoto); return }
    setLoading(true); setHasilCNN(null); setErrorMsg(''); setDuplikat(null)

    // ── Verifikasi foto sebelum klasifikasi ──
    try {
      setStatus(t.stVerifying)
      const hash = fotoHash || await hitungHashFoto(foto)
      if (!fotoHash) setFotoHash(hash)

      setVerifying(true)
      const { sudahAda, tokenIdLama } = await cekDuplikatOnChain(hash)
      setVerifying(false)

      if (sudahAda) {
        setDuplikat({ tipe: 'IDENTIK', tokenId: tokenIdLama, hash, icon: '🚫' })
        setLoading(false)
        return
      }

      const pHash = await hitungPHash(foto)
      const pHashLama = localStorage.getItem('lastPHash')
      if (pHashLama && pHash) {
        const dist = hammingDistance(pHash, pHashLama)
        console.log('Hamming distance:', dist)
        if (dist <= 5) {
          setDuplikat({ tipe: 'MIRIP', dist, hash, icon: '⚠️' })
        }
      }
      if (pHash) localStorage.setItem('lastPHash', pHash)

    } catch(err) {
      console.log('Verifikasi error:', err)
      setVerifying(false)
    }
    try {
      const BASE = 'https://jejenFis06-kopi-arabika-classifier.hf.space'
      setStatus(t.stUploading)
      const fd = new FormData(); fd.append('files', foto, foto.name)
      const upRes = await fetch(`${BASE}/gradio_api/upload`, { method:'POST', body:fd })
      if (!upRes.ok) throw new Error(`Upload gagal: ${upRes.status}`)
      const paths = await upRes.json()
      const filePath = paths?.[0]
      if (!filePath) throw new Error('Path file tidak ditemukan')

      setStatus(t.stClassifying)
      const prRes = await fetch(`${BASE}/gradio_api/call/klasifikasi_kopi`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ data:[{ path:filePath, mime_type:foto.type, orig_name:foto.name }] }),
      })
      if (!prRes.ok) throw new Error(`Predict gagal: ${prRes.status}`)
      const { event_id } = await prRes.json()
      if (!event_id) throw new Error('event_id tidak ditemukan')

      setStatus(t.stWaitAI)
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
    setStatus(t.stUploadIpfs)
    const b64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(foto) })
    const res = await fetch('/api/upload-ipfs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ imageBase64:b64, fileName:foto.name, hasilCNN, namaPetani, lokasiKebun:lokasi, hashFoto:fotoHash }) })
    const data = await res.json()
    if (!data.cidFoto) throw new Error(data.error||'Upload IPFS gagal')
    setCidFoto(data.cidFoto)
    if (data.cidMetadata) setCidMetadata(data.cidMetadata)
    return data
  }

  // ============================================================
  // Cek / tampilkan metadata NFT (di-fetch dari IPFS)
  // ============================================================
  async function cekMetadata() {
    if (showMeta) { setShowMeta(false); return }
    setShowMeta(true)
    if (metaJson || !cidMetadata) return
    setMetaLoading(true)
    try {
      const r = await fetch(`https://${PINATA_GATEWAY}/ipfs/${cidMetadata}`)
      const j = await r.json()
      setMetaJson(j)
    } catch (e) {
      console.warn('Gagal memuat metadata:', e)
      setMetaJson(null)
    } finally {
      setMetaLoading(false)
    }
  }

  async function connectWallet() {
    if (!window.ethereum) { alert(t.alInstallMM); return null }
    const accounts = await window.ethereum.request({ method:'eth_requestAccounts' })
    const chainId  = await window.ethereum.request({ method:'eth_chainId' })
    if (chainId !== AMOY_CHAIN_ID) {
      try { await window.ethereum.request({ method:'wallet_switchEthereumChain', params:[{ chainId:AMOY_CHAIN_ID }] }) }
      catch { await window.ethereum.request({ method:'wallet_addEthereumChain', params:[{ chainId:AMOY_CHAIN_ID, chainName:'Polygon Amoy Testnet', nativeCurrency:{ name:'POL', symbol:'POL', decimals:18 }, rpcUrls:['https://rpc-amoy.polygon.technology'], blockExplorerUrls:['https://amoy.polygonscan.com'] }] }) }
    }
    return accounts[0]
  }

  async function mintNFT() {
    if (!namaPetani.trim()) { alert(t.alFarmer); return }
    if (!lokasi.trim())     { alert(t.alLoc); return }
    if (!hasilCNN)          { alert(t.alClassFirst); return }
    setLoading(true); setErrorMsg('')
    try {
      setStatus(t.stConnectMM)
      const address = await connectWallet(); if (!address) return
      const ipfsData = await uploadIPFS()
      setStatus(t.stSendTx)
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
      setStatus(t.stWaitChain)
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
        setStatus(t.stAddMM)
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
      alert(t.alInstallMM)
      return
    }
    if (!tokenId && tokenId !== 0) {
      alert(t.alTokenNF)
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
        alert(t.alNotAdded)
      }
    } catch (err) {
      console.error(err)
      if (err.code === 4001) {
        alert(t.alRejected)
      } else {
        alert(t.alManual(CONTRACT_ADDRESS, tokenId))
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
    setCidMetadata(''); setShowMeta(false); setMetaJson(null)
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
          <div className="logo"><img src="/kopi-cherry.jpg" alt="Ceri kopi arabika" /></div>
          <div>
            <h1>Kopi Arabika Web3</h1>
            <p>{t.brandSub}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="pill lang" onClick={toggleLang} title="Ganti bahasa / Switch language">
            {lang === 'id' ? '🇬🇧 EN' : '🇮🇩 ID'}
          </button>
          <button
            className={`pill wallet ${walletAddr ? 'connected' : ''}`}
            onClick={handleConnectWallet}
            disabled={walletLoading}
          >
            {walletLoading
              ? t.connecting
              : walletAddr
                ? `🦊 ${shortAddr(walletAddr)} · ${t.disconnect}`
                : t.connect}
          </button>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-text">
          <h2>{t.heroTitle}</h2>
          <p className="sub">{t.heroSub}</p>
          <div className="badges">
            <span className="badge2">🏆 RepViT-M1.1 · 6-Class · 99.78%</span>
            <span className="badge2">⛓️ Polygon Amoy</span>
            <span className="badge2">📦 IPFS Pinata</span>
          </div>
          <div className="blocks">
            <div className="block"><b>HASH</b>{fotoHash ? `${fotoHash.slice(0,8)}…${fotoHash.slice(-3)}` : '0xa3f…9c2'}</div>
            <div className="block"><b>{t.blkCert}</b>{tokenId != null ? `#${tokenId}` : '#0042'}</div>
            <div className="block"><b>VERIFIED</b>{hasilCNN ? t.verified : t.waiting}</div>
          </div>
        </div>
        <div className="hero-photo">
          <img src="/kopi-cherry.jpg" alt="Ceri kopi arabika merah, oranye, kuning, dan hijau di pohon" />
        </div>
      </section>

      {/* ---------- Classifier ---------- */}
      <section className="section" id="cek">
        <div className="section-head"><span className="ic">🔬</span><h3>{t.secClassHead}</h3></div>
        <p className="section-sub">{t.secClassSub}</p>
        <div className="card">
          <div className="drop" onClick={() => fileRef.current.click()}>
            {preview
              ? <img className="preview" src={preview} alt="preview" />
              : <><div className="icon">📷</div><p><strong>{t.uploadStrong}</strong></p><p>{t.uploadHint}</p></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} capture="environment" />

          <div className="field">
            <label>{t.labelFarmer}</label>
            <input placeholder={t.phFarmer} value={namaPetani} onChange={e => setNamaPetani(e.target.value)} />
          </div>
          <div className="field">
            <label>{t.labelLoc}</label>
            <input placeholder={t.phLoc} value={lokasi} onChange={e => setLokasi(e.target.value)} />
          </div>

          <div className="row">
            <button className="btn btn-primary" onClick={klasifikasiCNN} disabled={!foto || loading}>
              {loading && !hasilCNN
                ? <><span className="spinner" /> {status || t.processing}</>
                : <>{t.btnClassify}</>}
            </button>
          </div>

          {errorMsg && <div className="alert alert-err">{errorMsg}</div>}

          {/* Info hash foto */}
          {fotoHash && !duplikat && (
            <div className="alert alert-info">
              <b>{t.fpTitle}</b>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, wordBreak: 'break-all', marginTop: 3 }}>
                {fotoHash.slice(0, 32)}…{fotoHash.slice(-8)}
              </div>
              <div className="note" style={{ marginTop: 3 }}>{t.fpNote}</div>
            </div>
          )}

          {/* Peringatan / blokir duplikat */}
          {duplikat && (
            <div className={`alert ${duplikat.tipe === 'IDENTIK' ? 'alert-err' : 'alert-warn'}`}>
              <b>{duplikat.icon} {duplikat.tipe === 'IDENTIK' ? t.dupIdentik : t.dupMirip}</b>
              <div style={{ marginTop: 4 }}>
                {duplikat.tipe === 'IDENTIK' ? t.dupMsgIdentik(duplikat.tokenId) : t.dupMsgMirip(duplikat.dist)}
              </div>
              {duplikat.tokenId && (
                <a href={`https://amoy.polygonscan.com/token/${CONTRACT_ADDRESS}?a=${duplikat.tokenId}`}
                   target="_blank" rel="noreferrer"
                   style={{ display: 'block', marginTop: 8, fontWeight: 700 }}>
                  {t.dupSeeNft(duplikat.tokenId)}
                </a>
              )}
              {duplikat.tipe === 'IDENTIK' && (
                <div style={{ marginTop: 8, fontWeight: 700 }}>{t.dupBlocked}</div>
              )}
            </div>
          )}

          {/* Bukan biji kopi */}
          {bukanKopi && !hasilCNN && (
            <div className="alert alert-warn" style={{ marginTop: 14 }}>
              <b style={{ fontSize: 15 }}>{t.rejTitle}</b>
              <p style={{ marginTop: 6 }}>{t.rejBody}</p>
              <div style={{ marginTop: 10, fontWeight: 700 }}>{t.rejGuideTitle}</div>
              <ul style={{ margin: '6px 0 0 18px', fontSize: 13 }}>
                {t.rejGuide.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={resetAll}>
                {t.rejBtn}
              </button>
            </div>
          )}

          {/* Hasil CNN */}
          {hasilCNN && !txHash && (
            <div style={{ marginTop: 16, background: gs.bg, border: `1px solid ${gs.border}`, borderTop: `3px solid ${gs.border}`, borderRadius: 14, padding: 18 }}>
              <div className="result-head">
                <span className="result-label" style={{ color: gs.text }}>{gs.emoji} {hasilCNN.jenis_kopi.replace(/_/g, ' ')}</span>
              </div>
              <div className="hasil-row"><span className="lbl">{t.resConf}</span><span className="val">{hasilCNN.confidence.toFixed(2)}%</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${hasilCNN.confidence}%`, background: gs.border }} /></div>
              <div className="hasil-row"><span className="lbl">{t.resGrade}</span><span className="val" style={{ color: gs.text }}>{gs.emoji} {hasilCNN.grade}</span></div>
              <div className="hasil-row"><span className="lbl">{t.resModel}</span><span className="val" style={{ fontSize: 12 }}>RepViT-M1.1 (CVPR 2024)</span></div>
              <button className="btn btn-mint" style={{ marginTop: 14 }} onClick={mintNFT} disabled={loading}>
                {loading ? <><span className="spinner" /> {status}</> : <>{t.btnMint}</>}
              </button>
              {status && !loading && <p className="note" style={{ textAlign: 'center' }}>{status}</p>}
              {errorMsg && <div className="alert alert-err">{errorMsg}</div>}
            </div>
          )}

          {/* Sukses NFT */}
          {txHash && (
            <div className="alert alert-ok" style={{ marginTop: 16, padding: 18 }}>
              <b style={{ fontSize: 18 }}>{t.successTitle}</b>
              {tokenId !== null && (
                <div className="hash-box" style={{ marginTop: 10 }}>
                  <div className="k">{t.tokenIdLbl}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#6EE7B7', fontFamily: 'ui-monospace, monospace' }}>#{tokenId}</div>
                </div>
              )}
              <div className="hash-box"><div className="k">{t.txHashLbl}</div><div className="v">{txHash}</div></div>
              {cidFoto && <div className="hash-box"><div className="k">{t.cidLbl}</div><div className="v">{cidFoto}</div></div>}

              {!nftAdded ? (
                <button className="btn btn-mint" onClick={addNFTtoWallet} disabled={addingNFT} style={{ marginTop: 6 }}>
                  {addingNFT ? <><span className="spinner" /> {t.addingNft}</> : <>{t.addNft}</>}
                </button>
              ) : (
                <div style={{ marginTop: 8, textAlign: 'center', fontWeight: 700, color: '#6EE7B7' }}>
                  {t.nftAddedMsg}
                </div>
              )}

              <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="link-btn link-blue">{t.verifyPoly}</a>
              {cidFoto && <a href={`https://${PINATA_GATEWAY}/ipfs/${cidFoto}`} target="_blank" rel="noreferrer" className="link-btn link-amber">{t.seePhoto}</a>}

              {cidMetadata && (
                <button className="link-btn link-meta" onClick={cekMetadata}>
                  {showMeta ? t.btnMetaHide : t.btnMeta}
                </button>
              )}
              {showMeta && (
                <div className="meta-panel">
                  <b>{t.metaTitle}</b>
                  {metaLoading ? (
                    <p className="note"><span className="spinner" style={{ borderColor: 'rgba(255,255,255,.25)', borderTopColor: 'var(--cyan)' }} /> {t.metaLoadingTxt}</p>
                  ) : metaJson ? (
                    <>
                      <div className="meta-name">{metaJson.name}</div>
                      {metaJson.description && <p className="meta-desc">{metaJson.description}</p>}
                      <div className="meta-attrs">
                        {(metaJson.attributes || []).map((a, i) => (
                          <div className="meta-row" key={i}>
                            <span>{a.trait_type}</span>
                            <span>{String(a.value)}</span>
                          </div>
                        ))}
                        {metaJson.image && (
                          <div className="meta-row"><span>Image</span><span>{metaJson.image}</span></div>
                        )}
                      </div>
                      <a href={`https://${PINATA_GATEWAY}/ipfs/${cidMetadata}`} target="_blank" rel="noreferrer">{t.metaRaw}</a>
                    </>
                  ) : (
                    <p className="note">{t.metaErr}{' '}
                      <a href={`https://${PINATA_GATEWAY}/ipfs/${cidMetadata}`} target="_blank" rel="noreferrer">{t.metaRaw}</a>
                    </p>
                  )}
                </div>
              )}

              <button className="link-btn link-ghost" onClick={resetAll}>{t.newClass}</button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- 5 Varietas ---------- */}
      <section className="section">
        <div className="section-head"><span className="ic">🍒</span><h3>{t.secVarHead}</h3></div>
        <p className="section-sub">{t.secVarSub}</p>
        <div className="grid">
          {INFO_KOPI.map((k, i) => (
            <div className="variety" key={i} style={{ '--c': k.color }}>
              <div className="dh"><span className="emoji">{k.emoji}</span><h4>{k.judul[lang]}</h4></div>
              <p>{k.isi[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Cara pakai ---------- */}
      <section className="section">
        <div className="section-head"><span className="ic">📋</span><h3>{t.secStepHead}</h3></div>
        <p className="section-sub">{t.secStepSub}</p>
        <div className="steps">
          {CARA_PAKAI.map((c, i) => (
            <div className="step" key={i}>
              <div className="n">{i + 1}</div>
              <h5>{c.judul[lang]}</h5>
              <p>{c.isi[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Teknologi ---------- */}
      <section className="section">
        <div className="section-head"><span className="ic">🛠️</span><h3>{t.secTechHead}</h3></div>
        <p className="section-sub">{t.secTechSub}</p>
        <div className="tech">
          {TECH.map((tc, i) => (
            <div className="techc" key={i}>
              <span className="te">{tc.e}</span>
              <div><h5>{tc.name}</h5><p>{tc.desc[lang]}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Keamanan ---------- */}
      <section className="section">
        <div className="section-head"><span className="ic">🛡️</span><h3>{t.secSecHead}</h3></div>
        <p className="section-sub">{t.secSecSub}</p>
        <div className="layers">
          {LAYERS.map((L, i) => (
            <div className="layer" key={i}>
              <div className="lh"><span className="chk">✓</span><h5>{L.title[lang]}</h5></div>
              <p>{L.desc[lang]}</p>
              {L.code && <div className="code">{L.code}</div>}
            </div>
          ))}
        </div>
        <div className="scorecard">
          <div>
            <div className="big">{t.scoreBig}</div>
            <div style={{ opacity: .9, fontSize: 13 }}>{t.scoreDesc}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: .85 }}>{t.scoreContract}</div>
            <a href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}#code`} target="_blank" rel="noreferrer">
              {CONTRACT_ADDRESS.slice(0, 6)}…{CONTRACT_ADDRESS.slice(-5)} ↗
            </a>
          </div>
        </div>
      </section>

      <p className="footer">{t.footer}</p>
    </main>
  )
}
