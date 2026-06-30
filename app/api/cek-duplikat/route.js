import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x5392C2F10d8Dea3e498726BcB8c806E8DA78834b'
const CONTRACT_ABI = [
  {
    inputs: [{ name: 'hashFoto', type: 'string' }],
    name: 'cekHashFoto',
    outputs: [
      { name: 'sudahAda', type: 'bool' },
      { name: 'tokenIdLama', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

// RPC key disimpan di server (env var), tidak pernah dikirim ke browser.
// Fallback ke RPC publik Polygon Amoy jika ALCHEMY_RPC_URL belum diset.
const RPC_URL = process.env.ALCHEMY_RPC_URL || 'https://rpc-amoy.polygon.technology'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const { hashHex } = body || {}
  if (typeof hashHex !== 'string' || !/^[0-9a-fA-F]{64}$/.test(hashHex)) {
    return NextResponse.json({ error: 'hashHex harus SHA-256 hex 64 karakter' }, { status: 400 })
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
    const [sudahAda, tokenIdLama] = await contract.cekHashFoto(hashHex)
    return NextResponse.json({ sudahAda, tokenIdLama: Number(tokenIdLama) })
  } catch (err) {
    console.error('cek-duplikat error:', err.message)
    // Fallback aman: anggap belum duplikat agar alur klasifikasi tidak terblokir
    return NextResponse.json({ sudahAda: false, tokenIdLama: 0 })
  }
}
