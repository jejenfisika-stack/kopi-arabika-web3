import { NextResponse } from 'next/server'

const PINATA_API_KEY    = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET
const PINATA_GATEWAY    = process.env.PINATA_GATEWAY || 'rose-casual-warbler-710.mypinata.cloud'

export async function POST(request) {
  try {
    const body = await request.json()
    const { imageBase64, fileName, hasilCNN, namaPetani, lokasiKebun } = body

    // ============================================================
    // Step 1: Upload foto ke Pinata
    // ============================================================
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer     = Buffer.from(base64Data, 'base64')
    const blob       = new Blob([buffer], { type: 'image/jpeg' })

    const formData = new FormData()
    formData.append('file', blob, fileName || 'kopi.jpg')
    formData.append('pinataMetadata', JSON.stringify({
      name: `kopi-${Date.now()}-${fileName}`,
      keyvalues: { project: 'kopi-arabika-research' }
    }))

    const uploadFoto = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      body: formData,
    })

    if (!uploadFoto.ok) {
      const errText = await uploadFoto.text()
      throw new Error(`Upload foto gagal: ${errText}`)
    }

    const fotoResult = await uploadFoto.json()
    const cidFoto    = fotoResult.IpfsHash

    // ============================================================
    // Step 2: Buat dan upload metadata NFT ke Pinata
    // ============================================================
    const timestamp = new Date().toISOString()
    const metadata  = {
      name: `Kopi Arabika — ${hasilCNN?.jenis_kopi?.replace(/_/g, ' ') || 'Unknown'}`,
      description: `Sertifikat digital kopi Arabika terverifikasi CNN RepViT-M1.1. Dari kebun ${namaPetani} di ${lokasiKebun}.`,
      image: `ipfs://${cidFoto}`,
      external_url: `https://${PINATA_GATEWAY}/ipfs/${cidFoto}`,
      attributes: [
        { trait_type: 'Jenis Kopi',         value: hasilCNN?.jenis_kopi?.replace(/_/g, ' ') || '' },
        { trait_type: 'Confidence CNN (%)',  value: hasilCNN?.confidence || 0 },
        { trait_type: 'Grade Kualitas',      value: hasilCNN?.grade || '' },
        { trait_type: 'Nama Petani',         value: namaPetani || '' },
        { trait_type: 'Lokasi Kebun',        value: lokasiKebun || '' },
        { trait_type: 'Model CNN',           value: 'RepViT-M1.1 (CVPR 2024)' },
        { trait_type: 'Blockchain',          value: 'Polygon Amoy Testnet' },
        { trait_type: 'Tanggal Klasifikasi', value: timestamp },
      ],
    }

    const uploadMeta = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      body: JSON.stringify({
        pinataContent:  metadata,
        pinataMetadata: { name: `metadata-kopi-${Date.now()}.json` },
      }),
    })

    if (!uploadMeta.ok) {
      const errText = await uploadMeta.text()
      throw new Error(`Upload metadata gagal: ${errText}`)
    }

    const metaResult  = await uploadMeta.json()
    const cidMetadata = metaResult.IpfsHash

    return NextResponse.json({
      success:     true,
      cidFoto,
      cidMetadata,
      urlFoto:     `https://${PINATA_GATEWAY}/ipfs/${cidFoto}`,
      urlMetadata: `https://${PINATA_GATEWAY}/ipfs/${cidMetadata}`,
    })

  } catch (error) {
    console.error('Upload IPFS error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
