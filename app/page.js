'use client'

import { useState, useRef } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x53ff81292ea345d13da906e0f27794f8d5402853'
const PINATA_GATEWAY   = 'rose-casual-warbler-710.mypinata.cloud'
const AMOY_CHAIN_ID    = '0x13882'

const CONTRACT_ABI = [
  { inputs: [{ name: 'petani', type: 'address' },{ name: 'cid', type: 'string' },{ name: 'metadataURI', type: 'string' },{ name: 'jenisKopi', type: 'string' },{ name: 'grade', type: 'string' },{ name: 'namaPetani', type: 'string' },{ name: 'lokasiKebun', type: 'string' },{ name: 'confidencePersen', type: 'uint256' }], name: 'mintKopiNFT', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function' },
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
  const fileRef = useRef()

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file); setPreview(URL.createObjectURL(file))
    setHasilCNN(null); setTxHash(''); setCidFoto(''); setErrorMsg(''); setStatus('')
  }

  function parseOutput(text) {
    const jenisMatch = text.match(/JENIS KOPI\s*:\s*(.+)/i)
    const confMatch  = text.match(/CONFIDENCE\s*:\s*([\d.]+)%/i)
    const gradeMatch = text.match(/GRADE\s*:\s*([A-Za-z\s]+)/i)
    const jenis      = jenisMatch?.[1]?.trim() || 'Tidak Terdeteksi'
    const confidence = parseFloat(confMatch?.[1]) || 0
    let grade        = gradeMatch?.[1]?.trim()?.replace(/[^\w\s]/g,'').trim() || 'Grade B'
    if (!GRADE_STYLE[grade]) grade = 'Grade B'
    return { jenis_kopi: jenis, confidence, grade }
  }

  async function klasifikasiCNN() {
    if (!foto) { alert('Pilih foto kopi terlebih dahulu!'); return }
    setLoading(true); setHasilCNN(null); setErrorMsg('')
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

      const reader = resRes.body.getReader(); const dec = new TextDecoder()
      let out = ''; let buf = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        buf += dec.decode(value, { stream:true })
        const lines = buf.split('\n'); buf = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const raw = line.slice(5).trim(); if (raw==='[DONE]') continue
            try { const arr=JSON.parse(raw); if(Array.isArray(arr)&&typeof arr[0]==='string') out=arr[0] } catch {}
          }
        }
      }
      if (!out) throw new Error('Tidak ada output dari CNN')
      setHasilCNN(parseOutput(out)); setStatus('')
    } catch(err) { setErrorMsg(`Error: ${err.message}`); setStatus('') }
    finally { setLoading(false) }
  }

  async function uploadIPFS() {
    setStatus('Mengupload foto ke IPFS...')
    const b64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(foto) })
    const res = await fetch('/api/upload-ipfs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ imageBase64:b64, fileName:foto.name, hasilCNN, namaPetani, lokasiKebun:lokasi }) })
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
      const tx = await contract.mintKopiNFT(address, ipfsData.cidFoto, `ipfs://${ipfsData.cidMetadata}`, hasilCNN.jenis_kopi, hasilCNN.grade, namaPetani, lokasi, Math.round(hasilCNN.confidence))
      setStatus('Menunggu konfirmasi blockchain...')
      const receipt = await tx.wait(); setTxHash(receipt.hash); setStatus('')
    } catch(err) { setErrorMsg('Error: '+(err.reason||err.message)); setStatus('') }
    finally { setLoading(false) }
  }

  const gs = hasilCNN ? (GRADE_STYLE[hasilCNN.grade] || GRADE_STYLE['Grade B']) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Lato',sans-serif;background:#F7F7F2;min-height:100vh}

        /* HEADER */
        .hdr{background:linear-gradient(135deg,#14290F 0%,#1E3E16 50%,#2A5520 100%);padding:0}
        .hdr-in{max-width:1380px;margin:0 auto;padding:22px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        .hdr-brand{display:flex;align-items:center;gap:14px}
        .hdr-ico{width:48px;height:48px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px}
        .hdr-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:#FFF;letter-spacing:-0.5px}
        .hdr-sub{font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-top:2px}
        .hdr-badges{display:flex;gap:7px;flex-wrap:wrap}
        .bdg{padding:5px 11px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .bdg-g{background:rgba(234,179,8,.15);color:#FCD34D;border:1px solid rgba(234,179,8,.25)}
        .bdg-gr{background:rgba(74,222,128,.12);color:#86EFAC;border:1px solid rgba(74,222,128,.2)}
        .bdg-b{background:rgba(96,165,250,.12);color:#93C5FD;border:1px solid rgba(96,165,250,.2)}

        /* LAYOUT */
        .layout{max-width:1380px;margin:0 auto;padding:28px 24px;display:grid;grid-template-columns:400px 1fr;gap:24px;align-items:start}
        @media(max-width:900px){.layout{grid-template-columns:1fr}}

        /* CARDS */
        .card{background:#FFF;border-radius:18px;border:1px solid #E4E4DC;box-shadow:0 2px 12px rgba(0,0,0,.04);overflow:hidden;margin-bottom:20px}

        /* HERO CARD */
        .hero-card{background:linear-gradient(160deg,#14290F,#2A5520);border-radius:18px;padding:28px 24px 0;overflow:hidden;position:relative;margin-bottom:20px}
        .hero-card::after{content:'☕';position:absolute;right:16px;top:16px;font-size:90px;opacity:.08;pointer-events:none}
        .hero-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:900;color:#FFF;line-height:1.2;position:relative;z-index:1}
        .hero-sub{font-size:12px;color:rgba(255,255,255,.5);margin-top:6px;margin-bottom:20px;position:relative;z-index:1}

        /* TABS */
        .tabs{display:flex;border-bottom:1px solid rgba(255,255,255,.1);gap:2px;position:relative;z-index:1}
        .tab{padding:10px 16px;font-size:20px;cursor:pointer;border-bottom:2px solid transparent;opacity:.45;transition:all .2s;background:none;border-top:none;border-left:none;border-right:none}
        .tab.on{opacity:1;border-bottom-color:#FCD34D}
        .tab-body{background:#FFF;border-radius:0 0 18px 18px;padding:22px}
        .tab-emoji{font-size:32px;margin-bottom:10px}
        .tab-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#14290F;margin-bottom:8px}
        .tab-text{font-size:13px;color:#6B7280;line-height:1.7}
        .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid #F0EFE8}
        .stat{background:#F7F7F2;border-radius:10px;padding:10px;text-align:center}
        .stat-v{font-size:15px;font-weight:700;color:#14290F}
        .stat-k{font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}

        /* CARA PAKAI */
        .card-head{padding:14px 20px;border-bottom:1px solid #F0EFE8;display:flex;align-items:center;gap:10px}
        .head-ico{width:30px;height:30px;background:#F0F5F0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
        .head-title{font-size:13px;font-weight:700;color:#14290F}
        .cara-list{padding:18px 20px;display:flex;flex-direction:column;gap:14px}
        .cara-item{display:flex;gap:12px;align-items:flex-start}
        .cara-no{width:30px;height:30px;flex-shrink:0;background:#14290F;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#FFF;font-family:'Playfair Display',serif}
        .cara-title{font-size:13px;font-weight:700;color:#1F2937;margin-bottom:2px}
        .cara-text{font-size:12px;color:#9CA3AF;line-height:1.5}

        /* TECH */
        .tech-grid{padding:14px 20px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .tech-item{background:#F7F7F2;border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px}
        .tech-ico{font-size:16px}
        .tech-name{font-size:11px;font-weight:700;color:#374151}
        .tech-desc{font-size:10px;color:#9CA3AF}

        /* RIGHT COLUMN */
        .sec-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#9CA3AF;margin-bottom:10px}
        .upload-zone{border:2px dashed #C8DFC8;border-radius:14px;min-height:210px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;overflow:hidden;background:#F7FAF7}
        .upload-zone:hover{border-color:#2A5520;background:#F0F6F0}
        .up-ph{text-align:center;padding:28px}
        .up-ico{font-size:44px;opacity:.35;margin-bottom:10px}
        .up-txt{font-size:13px;font-weight:600;color:#4B5563}
        .up-sub{font-size:11px;color:#9CA3AF;margin-top:3px}

        .lbl{font-size:12px;font-weight:700;color:#374151;margin-bottom:5px;display:block}
        .inp{width:100%;border:1.5px solid #E5E7EB;border-radius:11px;padding:10px 13px;font-size:13px;font-family:'Lato',sans-serif;color:#1F2937;background:#FAFAF7;outline:none;transition:border-color .2s}
        .inp:focus{border-color:#2A5520;background:#FFF}
        .inp::placeholder{color:#D1D5DB}

        .btn-go{width:100%;padding:13px;background:linear-gradient(135deg,#14290F,#2A5520);color:#FFF;font-size:13px;font-weight:700;border:none;border-radius:13px;cursor:pointer;transition:all .2s;font-family:'Lato',sans-serif;display:flex;align-items:center;justify-content:center;gap:7px;letter-spacing:.3px}
        .btn-go:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 5px 18px rgba(20,41,15,.3)}
        .btn-go:disabled{background:#D1D5DB;cursor:not-allowed;transform:none}

        .btn-mint{width:100%;padding:13px;background:linear-gradient(135deg,#4C1D95,#6D28D9);color:#FFF;font-size:13px;font-weight:700;border:none;border-radius:13px;cursor:pointer;transition:all .2s;font-family:'Lato',sans-serif;display:flex;align-items:center;justify-content:center;gap:7px}
        .btn-mint:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 5px 18px rgba(76,29,149,.3)}
        .btn-mint:disabled{background:#D1D5DB;cursor:not-allowed}

        .err{background:#FEF2F2;border:1px solid #FECACA;border-radius:11px;padding:11px 13px;font-size:12px;color:#B91C1C;margin-top:10px}
        .sts{text-align:center;font-size:11px;color:#6B7280;margin-top:7px}

        .hasil-box{border-radius:14px;padding:18px;border:2px solid}
        .hasil-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:14px}
        .hasil-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px}
        .hasil-lbl{font-size:12px;color:#6B7280}
        .hasil-val{font-size:13px;font-weight:700}
        .bar-bg{height:6px;background:rgba(255,255,255,.5);border-radius:3px;overflow:hidden;margin-bottom:14px}
        .bar-fg{height:100%;border-radius:3px;transition:width 1s ease}

        .sukses{border-radius:18px;padding:22px;background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:2px solid #86EFAC}
        .sukses-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:#14532D;margin-bottom:14px}
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
      `}</style>

      {/* HEADER */}
      <header className="hdr">
        <div className="hdr-in">
          <div className="hdr-brand">
            <div className="hdr-ico">☕</div>
            <div>
              <div className="hdr-title">Kopi Arabika CNN Web3</div>
              <div className="hdr-sub">Universitas Jember</div>
            </div>
          </div>
          <div className="hdr-badges">
            <span className="bdg bdg-g">🏆 RepViT-M1.1 CNN</span>
            <span className="bdg bdg-gr">⛓️ Polygon Amoy</span>
            <span className="bdg bdg-b">📦 IPFS Pinata</span>
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
          <div className="tab-body" style={{background:'#FFF',borderRadius:'0 0 18px 18px',padding:'22px',marginTop:'-18px',boxShadow:'0 2px 12px rgba(0,0,0,.04)',border:'1px solid #E4E4DC',borderTop:'none',marginBottom:'20px'}}>
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
              <div className="head-title">Teknologi CNN Web3</div>
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
        </div>

        {/* ====== KOLOM KANAN ====== */}
        <div>
          {/* Card upload & form */}
          <div className="card">
            <div className="card-head">
              <div className="head-ico">📸</div>
              <div className="head-title">Klasifikasi Biji Kopi dengan CNN</div>
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
                {loading&&!hasilCNN ? <><span>⏳</span>{status||'Memproses...'}</> : <><span>🔍</span>Klasifikasi dengan CNN</>}
              </button>
              {errorMsg && <div className="err">{errorMsg}</div>}
            </div>
          </div>

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
              <div className="hash-box"><div className="hash-lbl">Transaction Hash</div><div className="hash-val">{txHash}</div></div>
              {cidFoto && <div className="hash-box"><div className="hash-lbl">CID Foto IPFS</div><div className="hash-val">{cidFoto}</div></div>}
              <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="btn-a a-blue">🔍 Verifikasi di Polygonscan</a>
              {cidFoto && <a href={`https://${PINATA_GATEWAY}/ipfs/${cidFoto}`} target="_blank" rel="noreferrer" className="btn-a a-orange">🖼️ Lihat Foto di IPFS</a>}
              <button className="btn-a a-ghost" onClick={()=>{setFoto(null);setPreview(null);setHasilCNN(null);setTxHash('');setCidFoto('');setNamaPetani('');setLokasi('');setStatus('');setErrorMsg('')}}>↩️ Klasifikasi Kopi Baru</button>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
