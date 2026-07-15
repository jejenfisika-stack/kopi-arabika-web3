import { ethers } from 'ethers'

// Daftar RPC yang dicoba berurutan: RPC pribadi (env) dulu, lalu RPC publik
// Polygon Amoy sebagai cadangan. Membuat pembacaan blockchain tahan-banting
// terhadap RPC yang salah-konfigurasi / rate-limit / down.
export function rpcUrls() {
  const list = [
    process.env.ALCHEMY_RPC_URL,
    'https://rpc-amoy.polygon.technology',
    'https://polygon-amoy-bor-rpc.publicnode.com',
  ].filter(Boolean)
  return [...new Set(list)]
}

// Jalankan fn(contract) menggunakan RPC pertama yang berhasil.
// Melempar error terakhir bila SEMUA RPC gagal.
export async function withContract(abi, address, fn) {
  let lastErr
  for (const url of rpcUrls()) {
    try {
      const provider = new ethers.JsonRpcProvider(url)
      const contract = new ethers.Contract(address, abi, provider)
      return await fn(contract)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('Tidak ada RPC yang tersedia')
}
