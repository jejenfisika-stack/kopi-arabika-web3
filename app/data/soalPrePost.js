// ============================================================
// Bank soal Pre-test (Form A) & Post-test (Form B) — PARALLEL FORMS
// Blueprint identik: AIL1(7) AIL2(6) AIL3(6) AIL4(6) = 25 soal, skor maks 25.
// Butir BERBEDA dari kuis latihan (Belajar.js) agar tidak ada kebocoran.
// TANPA feedback (pre/post tidak menampilkan pembahasan).
// Framework: Ng, Leung, Chu & Qiao (2021).
// CATATAN: draf awal — mohon divalidasi (expert judgment) sebelum ambil data.
// ============================================================

export const DIM_PP = {
  AIL1: { label: 'Know & Understand AI', max: 7, color: '#2563EB', bg: '#EFF6FF', bd: '#BFDBFE' },
  AIL2: { label: 'Use & Apply AI',        max: 6, color: '#16A34A', bg: '#F0FDF4', bd: '#A7F3D0' },
  AIL3: { label: 'Evaluate & Create AI',  max: 6, color: '#EA580C', bg: '#FFF7ED', bd: '#FED7AA' },
  AIL4: { label: 'AI Ethics',             max: 6, color: '#7C3AED', bg: '#F5F3FF', bd: '#DDD6FE' },
}

// ---------------- FORM A (PRE-TEST) ----------------
const FORM_A = [
  { dim:'AIL1', bloom:'C1', teks:'Manakah pernyataan yang paling tepat tentang Artificial Intelligence (AI)?',
    opts:['Program yang hanya menjalankan rumus matematika tetap','Sistem yang meniru kemampuan kognitif manusia seperti mengenali pola dan membuat keputusan','Perangkat keras khusus untuk menyimpan data besar','Aplikasi yang wajib terhubung internet agar berfungsi'], jwb:1 },
  { dim:'AIL1', bloom:'C1', teks:'Pada sistem Kopi Arabika Web3, tugas model CNN adalah…',
    opts:['Menandatangani transaksi blockchain','Mengenali jenis dan mutu biji kopi dari citra','Menyimpan file ke IPFS','Menghasilkan private key wallet'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Deep Learning berbeda dari Machine Learning tradisional terutama karena…',
    opts:['Deep Learning tidak butuh data sama sekali','Deep Learning mengekstrak fitur secara otomatis dari data mentah','Deep Learning hanya berjalan di ponsel','Deep Learning tidak memakai matematika'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Operasi konvolusi pada CNN berfungsi untuk…',
    opts:['Mengurutkan data dari kecil ke besar','Mendeteksi fitur lokal citra seperti tepi dan tekstur','Mengenkripsi gambar','Mengompres ukuran file'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Mengapa citra dinormalisasi sebelum masuk CNN?',
    opts:['Agar warna tampak lebih cerah','Agar skala nilai piksel seragam sehingga pelatihan lebih stabil','Agar file lebih kecil','Agar gambar tidak bisa dibuka orang lain'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Transfer learning bermanfaat ketika…',
    opts:['Data pelatihan sangat terbatas sehingga memanfaatkan model pretrained','Kita ingin menghapus semua bobot model','Komputer tidak punya penyimpanan','Kita tidak punya label sama sekali'], jwb:0 },
  { dim:'AIL1', bloom:'C2', teks:'Tanda utama model mengalami overfitting adalah…',
    opts:['Akurasi rendah baik di data latih maupun uji','Akurasi tinggi di data latih tetapi rendah di data baru','Model berjalan sangat lambat','Model memakai sedikit memori'], jwb:1 },

  { dim:'AIL2', bloom:'C3', teks:'Anda hanya punya sedikit citra biji kopi berlabel. Strategi paling tepat:',
    opts:['Melatih model dari nol tanpa bantuan','Menggunakan transfer learning lalu fine-tuning','Tidak menggunakan CNN','Menyalin gambar berkali-kali secara manual'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Model menunjukkan akurasi latih 97% tetapi validasi 70%. Tindakan yang tepat:',
    opts:['Menambah epoch hingga loss latih nol','Menerapkan dropout/augmentasi/early stopping','Mengganti bahasa pemrograman','Menghapus data validasi'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Augmentasi data (rotasi, flip, zoom) bertujuan…',
    opts:['Menaikkan resolusi gambar','Memperkaya variasi data latih agar model lebih tahan','Mengubah format file','Mengurangi jumlah kelas'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Metrik yang tepat untuk menilai model KLASIFIKASI jenis kopi:',
    opts:['RMSE dan MAE','Accuracy, Precision, Recall, F1','R-squared','Jumlah epoch'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Langkah pertama yang benar saat menyiapkan dataset klasifikasi:',
    opts:['Langsung melatih tanpa memeriksa data','Mendefinisikan kelas dan mengumpulkan data representatif berkualitas','Memilih model paling kompleks','Mengunduh data acak tanpa diperiksa'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Sebelum sertifikat dicatat ke blockchain, foto di-hash SHA-256 untuk…',
    opts:['Memperkecil ukuran foto','Membuat sidik jari unik sebagai bukti keaslian & anti-duplikat','Menyembunyikan foto','Mempercepat internet'], jwb:1 },

  { dim:'AIL3', bloom:'C4', teks:'Confusion matrix: TP=80, FP=20, FN=10, TN=90. Nilai Precision adalah…',
    opts:['80/(80+10)=88,9%','80/(80+20)=80%','90/(90+20)=81,8%','80/200=40%'], jwb:1 },
  { dim:'AIL3', bloom:'C5', teks:'Model P (akurasi 88%, F1 0,86) vs Model Q (akurasi 92%, F1 0,91). Mana lebih baik?',
    opts:['Model P, karena angka lebih rendah','Model Q, karena akurasi & F1 lebih tinggi','Sama saja','Tidak dapat ditentukan'], jwb:1 },
  { dim:'AIL3', bloom:'C5', teks:'Model 95% saat uji tetapi 60% di kebun nyata. Penyebab paling mungkin:',
    opts:['Model terlalu sederhana','Perbedaan kondisi data latih vs lapangan (domain shift)','Kesalahan pada monitor','GPU terlalu cepat'], jwb:1 },
  { dim:'AIL3', bloom:'C6', teks:'Rancangan sistem sertifikasi kopi yang paling tepercaya:',
    opts:['Hanya klasifikasi CNN','CNN + penjelasan (Grad-CAM) + anti-duplikat + IPFS + NFT immutable','Hanya menyimpan foto di komputer','Hanya mencatat nama petani'], jwb:1 },
  { dim:'AIL3', bloom:'C5', teks:'Menyimpan penjelasan AI secara immutable di blockchain penting karena…',
    opts:['Membuat file lebih besar','Keputusan AI dapat diaudit dan tidak bisa diubah','Mempercepat model','Menghemat listrik'], jwb:1 },
  { dim:'AIL3', bloom:'C6', teks:'Eksperimen membandingkan dua arsitektur CNN dikatakan valid bila…',
    opts:['Memakai dataset berbeda tiap model','Dataset & pembagian sama, metrik sama, beberapa kali run','Memilih grafik termulus','Hanya melihat akurasi akhir'], jwb:1 },

  { dim:'AIL4', bloom:'C5', teks:'Data latih 90% berasal dari satu daerah. Konsekuensi etisnya:',
    opts:['Tidak ada masalah','Model bisa bias & tidak adil untuk daerah lain','Model lebih cepat','Model tidak bisa disimpan'], jwb:1 },
  { dim:'AIL4', bloom:'C5', teks:'AI menentukan harga kopi tanpa bisa menjelaskan alasannya. Isu etikanya:',
    opts:['Tidak masalah karena AI akurat','Kurangnya transparansi; keputusan harus dapat dijelaskan & diaudit','Hanya soal kecepatan','Petani tak perlu tahu'], jwb:1 },
  { dim:'AIL4', bloom:'C5', teks:'Sensor IoT diam-diam merekam aktivitas petani lalu dipakai mengawasi. Masalahnya:',
    opts:['Boleh karena lahan milik perusahaan','Pelanggaran privasi tanpa persetujuan (informed consent)','Bagus untuk efisiensi','Hanya masalah jika bocor'], jwb:1 },
  { dim:'AIL4', bloom:'C5', teks:'AI menyarankan pestisida berlebih & petani ikut membuta. Tanggung jawab…',
    opts:['Hanya developer','Hanya petani','Terdistribusi: developer, petani, regulator','Tidak ada'], jwb:2 },
  { dim:'AIL4', bloom:'C5', teks:'Foto petani kecil dipakai melatih model komersial tanpa izin/kompensasi. Isu:',
    opts:['Wajar, data publik','Keadilan data (data justice): perlu consent/kompensasi','Hanya jika ada wajah','Cukup dicantumkan di publikasi'], jwb:1 },
  { dim:'AIL4', bloom:'C5', teks:'Mengganti seluruh penyuluh manusia dengan AI perlu dikritisi karena…',
    opts:['AI selalu benar','AI tak punya empati/konteks lokal & bisa keliru; ada risiko kesenjangan digital','Menghemat gaji','Tidak ada risiko'], jwb:1 },
]

// ---------------- FORM B (POST-TEST) — parallel, konsep sama, butir berbeda ----------------
const FORM_B = [
  { dim:'AIL1', bloom:'C1', teks:'Kecerdasan Buatan (AI) paling tepat digambarkan sebagai…',
    opts:['Basis data raksasa tanpa kemampuan menalar','Kemampuan mesin belajar dari data untuk mengenali pola & memutuskan','Sekumpulan kabel dan sensor','Program yang tidak pernah salah'], jwb:1 },
  { dim:'AIL1', bloom:'C1', teks:'Dalam sistem ini, keluaran utama model CNN berupa…',
    opts:['Alamat dompet kripto','Prediksi jenis & grade biji kopi beserta probabilitas','Nilai gas transaksi','CID file di IPFS'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Salah satu ciri khas Deep Learning dibanding ML klasik adalah…',
    opts:['Selalu memakai lebih sedikit data','Belajar representasi fitur bertingkat dari data mentah','Tidak membutuhkan pelatihan','Hanya untuk data berupa angka'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Lapisan konvolusi awal pada CNN umumnya menangkap…',
    opts:['Makna keseluruhan objek','Fitur sederhana seperti tepi dan garis','Nama file gambar','Metadata kamera'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Praproses citra (resize & normalisasi) diperlukan agar…',
    opts:['Gambar terlihat artistik','Masukan seragam sehingga model belajar konsisten & cepat konvergen','Ukuran file membesar','Warna menjadi acak'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Ide dasar transfer learning adalah…',
    opts:['Memindahkan file antar-komputer','Memakai pengetahuan model yang sudah dilatih lalu menyesuaikannya','Menghapus lapisan model','Melatih tanpa data'], jwb:1 },
  { dim:'AIL1', bloom:'C2', teks:'Jika akurasi latih jauh lebih tinggi daripada akurasi uji, model kemungkinan…',
    opts:['Underfitting','Overfitting (menghafal data latih)','Kekurangan memori','Terlalu cepat konvergen tanpa masalah'], jwb:1 },

  { dim:'AIL2', bloom:'C3', teks:'Dataset kopi kecil dan sulit ditambah. Pendekatan yang paling efektif:',
    opts:['Melatih arsitektur besar dari nol','Transfer learning dari model pretrained lalu fine-tune','Menghentikan penggunaan CNN','Menggandakan citra secara manual'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Selisih besar antara akurasi latih dan validasi paling tepat diatasi dengan…',
    opts:['Menambah neuron sebanyak mungkin','Regularisasi/dropout/augmentasi/early stopping','Mengganti kartu grafis','Menghapus data uji'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Manfaat utama augmentasi data pada citra biji kopi adalah…',
    opts:['Menghemat penyimpanan','Membuat model lebih robust terhadap variasi & mengurangi overfitting','Mengubah label kelas','Menaikkan resolusi asli'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Untuk tugas klasifikasi mutu kopi, ukuran evaluasi yang sesuai:',
    opts:['MSE dan RMSE','Precision, Recall, F1, dan Accuracy','R-squared','Learning rate'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Prinsip "garbage in, garbage out" menekankan pentingnya…',
    opts:['Model yang paling rumit','Kualitas & keterwakilan data yang dikumpulkan','Kecepatan internet','Ukuran layar'], jwb:1 },
  { dim:'AIL2', bloom:'C3', teks:'Peran hash SHA-256 dalam pencatatan sertifikat ke blockchain adalah…',
    opts:['Mengecilkan berkas','Menghasilkan pengenal unik untuk mencegah sertifikat ganda','Mengunci foto agar rahasia','Mempercepat unggahan'], jwb:1 },

  { dim:'AIL3', bloom:'C4', teks:'Confusion matrix: TP=90, FP=10, FN=15, TN=85. Nilai Recall adalah…',
    opts:['90/(90+10)=90%','90/(90+15)=85,7%','85/(85+10)=89,5%','90/200=45%'], jwb:1 },
  { dim:'AIL3', bloom:'C5', teks:'Model R (F1 0,80) vs Model S (F1 0,90) pada uji yang sama. Kesimpulan tepat:',
    opts:['Model R lebih baik','Model S lebih baik karena F1 lebih tinggi','Keduanya identik','Tidak bisa dinilai'], jwb:1 },
  { dim:'AIL3', bloom:'C5', teks:'Akurasi uji tinggi namun anjlok saat dipakai di lapangan. Hal ini menunjukkan…',
    opts:['Model kurang lapisan','Pergeseran distribusi data (domain shift)','Layar rusak','Model terlalu ringan'], jwb:1 },
  { dim:'AIL3', bloom:'C6', teks:'Komponen yang membuat sistem sertifikasi kopi paling dapat dipercaya:',
    opts:['Hanya database foto','Gabungan klasifikasi + Grad-CAM + anti-duplikat + IPFS + NFT immutable','Hanya pencatatan manual','Hanya QR code tanpa data'], jwb:1 },
  { dim:'AIL3', bloom:'C5', teks:'Alasan bukti penjelasan AI disimpan tak-termodifikasi (immutable):',
    opts:['Agar sertifikat panjang','Agar dapat diverifikasi & diaudit kapan pun','Agar model lebih cepat','Agar biaya murah'], jwb:1 },
  { dim:'AIL3', bloom:'C6', teks:'Agar perbandingan dua model adil, peneliti harus…',
    opts:['Memberi masing-masing model data berbeda','Menyamakan dataset, split, preprocessing, metrik, dan mengulang beberapa kali','Memilih hasil terbaik satu kali jalan','Mengandalkan tampilan grafik'], jwb:1 },

  { dim:'AIL4', bloom:'C5', teks:'Model dilatih dominan dari satu wilayah. Dari sisi keadilan, ini berpotensi…',
    opts:['Menguntungkan semua wilayah','Menghasilkan performa bias & tidak adil bagi wilayah tak terwakili','Mempercepat pelatihan','Tidak berdampak apa pun'], jwb:1 },
  { dim:'AIL4', bloom:'C5', teks:'Sistem AI memberi keputusan penting tanpa penjelasan kepada penggunanya. Ini melanggar prinsip…',
    opts:['Efisiensi','Transparansi/keterjelasan (explainability)','Kecepatan','Kompresi'], jwb:1 },
  { dim:'AIL4', bloom:'C5', teks:'Data yang dikumpulkan untuk tujuan A dipakai diam-diam untuk pengawasan. Prinsip yang dilanggar:',
    opts:['Data minimization & purpose limitation (privasi)','Kebebasan berekspresi','Hak cipta','Netralitas jaringan'], jwb:0 },
  { dim:'AIL4', bloom:'C5', teks:'Ketika rekomendasi AI menimbulkan kerugian, "AI yang menyuruh" …',
    opts:['Menghapus tanggung jawab manusia','Bukan pembenaran; tanggung jawab tetap terdistribusi ke manusia','Menyalahkan pengguna saja','Menyalahkan developer saja'], jwb:1 },
  { dim:'AIL4', bloom:'C5', teks:'Komunitas kecil menjadi sumber data model komersial tanpa manfaat balik. Isu utamanya:',
    opts:['Tidak ada, data itu gratis','Keadilan data: sumber data berhak atas manfaat/consent','Hanya soal ukuran file','Cukup diberi ucapan terima kasih'], jwb:1 },
  { dim:'AIL4', bloom:'C5', teks:'Otomatisasi penuh penyuluhan pertanian oleh AI berisiko karena…',
    opts:['AI objektif sempurna','Hilangnya empati/konteks lokal, kesenjangan digital, & celah akuntabilitas','Menghemat waktu saja','Tidak ada kelemahan'], jwb:1 },
]

export const SOAL_PP = { A: FORM_A, B: FORM_B }
