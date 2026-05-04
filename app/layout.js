import './globals.css'

export const metadata = {
  title: 'Klasifikasi Kopi Arabika Web3',
  description: 'Sistem klasifikasi kopi Arabika berbasis CNN RepViT dan Blockchain Polygon',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32',  type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/icon.png" type="image/png"/>
        <link rel="apple-touch-icon" href="/icon.png"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
