import { NextResponse } from 'next/server'
import { withContract } from '../../lib/rpc'

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
    const [sudahAda, tokenIdLama] = await withContract(
      CONTRACT_ABI, CONTRACT_ADDRESS,
      (contract) => contract.cekHashFoto(hashHex),
    )
    return NextResponse.json({ sudahAda, tokenIdLama: Number(tokenIdLama) })
  } catch (err) {
    console.error('cek-duplikat error:', err.message)
    // Fallback aman: anggap belum duplikat agar alur klasifikasi tidak terblokir
    return NextResponse.json({ sudahAda: false, tokenIdLama: 0 })
  }
}
