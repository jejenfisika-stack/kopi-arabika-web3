import './globals.css'

export const metadata = {
  title: 'Klasifikasi Kopi Arabika Web3',
  description: 'Sistem klasifikasi kopi Arabika berbasis CNN RepViT dan Blockchain Polygon',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
