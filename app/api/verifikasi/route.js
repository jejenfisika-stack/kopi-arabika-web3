import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { rateLimit, getClientIp } from '../../lib/rateLimit'

const CONTRACT_ADDRESS = '0x5392C2F10d8Dea3e498726BcB8c806E8DA78834b'
const CONTRACT_ABI = [
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
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
]

// RPC key di server (env var); fallback ke RPC publik Polygon Amoy.
const RPC_URL = process.env.ALCHEMY_RPC_URL || 'https://rpc-amoy.polygon.technology'

export async function GET(request) {
  // ── Rate limit per-IP: lindungi kuota RPC dari spam ──
  const ip = getClientIp(request)
  const rl = rateLimit(`verifikasi:${ip}`, { limit: 20, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar.' }, { status: 429 })
  }

  // ── Validasi input: hanya angka token ID yang wajar ──
  const idParam = request.nextUrl.searchParams.get('id')
  if (!idParam || !/^\d{1,10}$/.test(idParam)) {
    return NextResponse.json({ error: 'Token ID harus berupa angka.' }, { status: 400 })
  }
  const tokenId = Number(idParam)

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

    const [data, uri] = await Promise.all([
      contract.getDataKopi(tokenId),
      contract.tokenURI(tokenId).catch(() => ''),
    ])

    // Kontrak tidak revert untuk token yang belum ada — ia mengembalikan
    // nilai default (string kosong / 0). Deteksi itu sebagai "tidak ditemukan".
    if (!data[0] && Number(data[5]) === 0) {
      return NextResponse.json({ error: 'Sertifikat dengan Token ID ini tidak ditemukan di blockchain.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      tokenId,
      contract: CONTRACT_ADDRESS,
      ipfsCID:     data[0],
      jenisKopi:   data[1],
      grade:       data[2],
      namaPetani:  data[3],
      lokasiKebun: data[4],
      timestamp:   Number(data[5]),
      confidence:  Number(data[6]),
      hashFoto:    data[7],
      metadataURI: uri, // ipfs://CID metadata (berisi XAI: probabilitas, entropy, gradcam)
    })
  } catch (err) {
    // Revert = token belum pernah di-mint
    const msg = String(err?.message || '')
    if (/revert|invalid token|nonexistent|CALL_EXCEPTION/i.test(msg)) {
      return NextResponse.json({ error: 'Sertifikat dengan Token ID ini tidak ditemukan di blockchain.' }, { status: 404 })
    }
    console.error('verifikasi error:', msg)
    return NextResponse.json({ error: 'Gagal membaca blockchain, coba lagi.' }, { status: 502 })
  }
}
