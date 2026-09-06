'use client'

import { useState, useEffect, useRef } from 'react'

// ============================================================
// Konten dwibahasa Pusat Belajar IPA (Web3 style, bukan LMS)
// ============================================================
const L = {
  id: {
    title: '🎓 Pusat Belajar IPA',
    sub: 'Pelajari AI, Machine Learning, CNN, Blockchain & Traceability langsung dari sistem yang berjalan — melatih computational thinking, AI literacy, dan keterampilan abad-21.',
    navHead: 'Lompat ke bagian:',
    nav: [['ct','🧩 Cara Kerja Sistem'],['dasar','🔬 Lab Hash & Entropi'],['blockchain','⛓️ Lab Blockchain'],['konvolusi','🔍 Lab Konvolusi'],['cam','🔥 Panduan Grad-CAM'],['kuis','🤖 Kuis AI Literacy'],['gloss','📚 Glosarium']],
    ctHead: '🧩 Cara Kerja Sistem (Computational Thinking)',
    ctSub: 'Empat pilar berpikir komputasional yang dipakai sistem ini:',
    ct: [
      ['Dekomposisi', 'Masalah besar "sertifikasi kopi" dipecah jadi langkah kecil: foto → hash → klasifikasi → sertifikat.'],
      ['Pengenalan pola', 'CNN RepViT mengenali pola visual biji kopi (warna, bentuk, tekstur) untuk membedakan varietas.'],
      ['Abstraksi', 'Foto diringkas jadi "sidik jari" SHA-256 dan vektor probabilitas — menyederhanakan tanpa kehilangan inti.'],
      ['Algoritma', 'Urutan langkah pasti: verifikasi → klasifikasi → cek duplikat → mint NFT ke blockchain.'],
    ],
    hashHead: '🔐 Hash Playground (SHA-256)',
    hashSub: 'Ketik apa saja. Ubah 1 huruf saja → seluruh hash berubah total (avalanche effect). Inilah dasar keamanan & keaslian data di blockchain.',
    hashPh: 'Ketik teks di sini...',
    hashLabel: 'Sidik jari SHA-256 (256-bit):',
    hashNote: 'Fungsi satu arah: dari teks → hash mudah, dari hash → teks mustahil. Hash sama persis hanya untuk input sama persis.',
    entHead: '📊 Lab Entropy & Ketidakpastian',
    entSub: 'Geser keyakinan tiap kelas. Makin merata → entropy makin tinggi → AI makin ragu. Makin condong ke satu kelas → entropy rendah → AI yakin.',
    entropy: 'Entropy', entUnc: 'Ketidakpastian',
    entSure: 'AI sangat yakin', entMid: 'AI cukup yakin', entLow: 'AI ragu / tolak',
    camHead: '👁️ Cara Membaca Grad-CAM',
    camSub: 'Grad-CAM menunjukkan bagian foto yang paling memengaruhi keputusan AI:',
    camTips: [
      'Area merah/kuning = paling diperhatikan model.',
      'Area biru/gelap = kurang berpengaruh.',
      'Kalau model fokus ke biji kopi → keputusan tepercaya.',
      'Kalau fokus ke latar/bayangan → waspada, mungkin bias.',
    ],
    quizHead: '✅ Kuis AI Literacy',
    quizSub: 'Uji pemahamanmu. Jawab semua untuk meraih badge.',
    quizDone: 'Skor kamu', quizBadge: '🏅 Badge: AI Literacy Explorer', quizRetry: 'Ulangi Kuis',
    glossHead: '📖 Glosarium',
    teacherBtn: '🧑‍🏫 Mode Guru', teacherHide: 'Tutup Mode Guru',
    teacherHead: 'Panduan Guru',
    objHead: 'Tujuan Pembelajaran', lkpdHead: 'Aktivitas (LKPD ringkas)', asesHead: 'Asesmen',
    objs: [
      'Menjelaskan konsep AI, machine learning, dan CNN secara sederhana.',
      'Menjelaskan fungsi hash, blockchain, dan traceability.',
      'Menafsirkan confidence, entropy, dan Grad-CAM sebagai bukti keputusan AI.',
      'Menerapkan computational thinking pada masalah nyata.',
    ],
    lkpd: [
      'Prediksi dulu jenis kopi sebelum klasifikasi (Predict).',
      'Unggah foto & amati hasil + Grad-CAM (Observe).',
      'Diskusikan mengapa AI memutuskan demikian (Explain).',
      'Coba Hash Playground & Lab Entropy, catat temuan.',
    ],
    ases: 'Pre-test & post-test (hitung N-gain), kuis di atas (badge), dan laporan refleksi 4C (berpikir kritis, kreatif, kolaborasi, komunikasi).',
    correct: 'Benar', wrong: 'Kurang tepat',
  },
  en: {
    title: '🎓 Science Learning Hub',
    sub: 'Learn AI, Machine Learning, CNN, Blockchain & Traceability straight from a live system — training computational thinking, AI literacy, and 21st-century skills.',
    navHead: 'Jump to section:',
    nav: [['ct','🧩 How It Works'],['dasar','🔬 Hash & Entropy Labs'],['blockchain','⛓️ Blockchain Lab'],['konvolusi','🔍 Convolution Lab'],['cam','🔥 Grad-CAM Guide'],['kuis','🤖 AI Literacy Quiz'],['gloss','📚 Glossary']],
    ctHead: '🧩 How the System Works (Computational Thinking)',
    ctSub: 'The four computational-thinking pillars this system uses:',
    ct: [
      ['Decomposition', 'The big "coffee certification" problem is split into small steps: photo → hash → classify → certificate.'],
      ['Pattern recognition', 'The RepViT CNN recognizes visual patterns of beans (color, shape, texture) to tell varieties apart.'],
      ['Abstraction', 'A photo is reduced to a SHA-256 "fingerprint" and a probability vector — simpler, keeping the essence.'],
      ['Algorithm', 'A fixed sequence: verify → classify → check duplicates → mint NFT to the blockchain.'],
    ],
    hashHead: '🔐 Hash Playground (SHA-256)',
    hashSub: 'Type anything. Change just 1 letter → the whole hash changes completely (avalanche effect). This is the basis of data security & authenticity on the blockchain.',
    hashPh: 'Type text here...',
    hashLabel: 'SHA-256 fingerprint (256-bit):',
    hashNote: 'A one-way function: text → hash is easy, hash → text is impossible. Identical hashes only come from identical inputs.',
    entHead: '📊 Entropy & Uncertainty Lab',
    entSub: 'Slide each class confidence. More even → higher entropy → the AI is more uncertain. More skewed to one class → low entropy → confident.',
    entropy: 'Entropy', entUnc: 'Uncertainty',
    entSure: 'AI very confident', entMid: 'AI fairly confident', entLow: 'AI uncertain / reject',
    camHead: '👁️ How to Read Grad-CAM',
    camSub: 'Grad-CAM shows the parts of the photo that most influenced the AI decision:',
    camTips: [
      'Red/yellow areas = the model paid most attention.',
      'Blue/dark areas = less influential.',
      'If the model focuses on the beans → trustworthy decision.',
      'If it focuses on background/shadow → beware, possible bias.',
    ],
    quizHead: '✅ AI Literacy Quiz',
    quizSub: 'Test yourself. Answer all to earn the badge.',
    quizDone: 'Your score', quizBadge: '🏅 Badge: AI Literacy Explorer', quizRetry: 'Retry Quiz',
    glossHead: '📖 Glossary',
    teacherBtn: '🧑‍🏫 Teacher Mode', teacherHide: 'Close Teacher Mode',
    teacherHead: 'Teacher Guide',
    objHead: 'Learning Objectives', lkpdHead: 'Activities (worksheet)', asesHead: 'Assessment',
    objs: [
      'Explain the concepts of AI, machine learning, and CNN simply.',
      'Explain the role of hashing, blockchain, and traceability.',
      'Interpret confidence, entropy, and Grad-CAM as evidence of AI decisions.',
      'Apply computational thinking to a real problem.',
    ],
    lkpd: [
      'Predict the coffee type before classifying (Predict).',
      'Upload a photo & observe the result + Grad-CAM (Observe).',
      'Discuss why the AI decided that way (Explain).',
      'Try the Hash Playground & Entropy Lab, note findings.',
    ],
    ases: 'Pre-test & post-test (compute N-gain), the quiz above (badge), and a 4C reflection report (critical thinking, creativity, collaboration, communication).',
    correct: 'Correct', wrong: 'Not quite',
  },
}

const GLOSS = {
  id: [
    ['AI (Kecerdasan Buatan)', 'Sekumpulan metode komputasi yang dirancang untuk meniru kemampuan kognitif manusia, seperti mengenali pola, memahami informasi, mengambil keputusan, dan membuat prediksi secara otomatis.'],
    ['Machine Learning', 'Cabang dari Kecerdasan Buatan yang memungkinkan komputer mempelajari pola dan hubungan dari data contoh tanpa harus diprogram dengan aturan eksplisit untuk setiap kasus.'],
    ['CNN', 'Convolutional Neural Network — jaringan saraf untuk citra; mengekstrak fitur (tepi, tekstur, bentuk) berlapis.'],
    ['Confidence', 'Tingkat keyakinan model terhadap prediksinya (0–100%).'],
    ['Entropy', 'Ukuran ketidakpastian distribusi probabilitas; tinggi = model ragu.'],
    ['OOD Detection', 'Out-of-Distribution: kemampuan menolak input di luar yang dilatih (mis. bukan biji kopi).'],
    ['Grad-CAM', 'Teknik XAI yang memetakan wilayah citra paling memengaruhi keputusan CNN.'],
    ['Hash (SHA-256)', 'Sidik jari digital 256-bit; berubah total bila data berubah sedikit pun.'],
    ['Blockchain', 'Buku besar terdistribusi yang catatannya tak bisa diubah (immutable).'],
    ['NFT (ERC-721)', 'Token unik di blockchain — di sini jadi sertifikat digital kopi.'],
    ['IPFS', 'Penyimpanan terdesentralisasi beralamat-konten (CID dihitung dari isi file).'],
    ['Traceability', 'Kemampuan menelusuri asal-usul produk dari kebun hingga sertifikat.'],
  ],
  en: [
    ['AI (Artificial Intelligence)', 'A collection of computational methods designed to mimic human cognitive abilities, such as recognizing patterns, understanding information, making decisions, and generating predictions automatically.'],
    ['Machine Learning', 'A branch of Artificial Intelligence that enables computers to learn patterns and relationships from example data without being explicitly programmed with rules for every situation.'],
    ['CNN', 'Convolutional Neural Network — a neural net for images; extracts features (edges, texture, shape) in layers.'],
    ['Confidence', 'How sure the model is about its prediction (0–100%).'],
    ['Entropy', 'A measure of uncertainty in a probability distribution; high = the model is unsure.'],
    ['OOD Detection', 'Out-of-Distribution: the ability to reject inputs outside training (e.g., not coffee beans).'],
    ['Grad-CAM', 'An XAI technique mapping the image regions that most influence a CNN decision.'],
    ['Hash (SHA-256)', 'A 256-bit digital fingerprint; changes completely if the data changes at all.'],
    ['Blockchain', 'A distributed ledger whose records cannot be altered (immutable).'],
    ['NFT (ERC-721)', 'A unique token on the blockchain — here, a digital coffee certificate.'],
    ['IPFS', 'Decentralized content-addressed storage (the CID is computed from file contents).'],
    ['Traceability', 'The ability to trace a product’s origin from farm to certificate.'],
  ],
}

const DIM_AILI = {
  AIL1: { label: 'Know & Understand AI', max: 7, color: '#2563EB', bg: '#EFF6FF', bd: '#BFDBFE', desc: { id: 'Memahami konsep dasar AI, cara kerja CNN, hash & blockchain dalam sistem sertifikasi kopi.', en: 'Understanding basic AI concepts, how a CNN works, and hashing & blockchain in coffee certification.' } },
  AIL2: { label: 'Use & Apply AI',        max: 6, color: '#16A34A', bg: '#F0FDF4', bd: '#A7F3D0', desc: { id: 'Menerapkan teknik AI/CNN & alur blockchain secara praktis untuk masalah nyata.', en: 'Applying AI/CNN techniques & the blockchain flow practically to real problems.' } },
  AIL3: { label: 'Evaluate & Create AI',  max: 6, color: '#EA580C', bg: '#FFF7ED', bd: '#FED7AA', desc: { id: 'Menganalisis & mengevaluasi kualitas model dan merancang sistem AI+blockchain yang tepat.', en: 'Analyzing & evaluating model quality and designing an appropriate AI+blockchain system.' } },
  AIL4: { label: 'AI Ethics',             max: 6, color: '#7C3AED', bg: '#F5F3FF', bd: '#DDD6FE', desc: { id: 'Mengevaluasi isu etika, bias, privasi, transparansi & dampak sosial AI.', en: 'Evaluating ethics, bias, privacy, transparency & social impact of AI.' } },
}

// 25 soal AI Literacy Index (AILI) — konteks: Kopi Arabika Web3 (CNN + Blockchain)
// Framework: Ng, Leung, Chu & Qiao (2021), Computers and Education: AI, 2, 100041.
const SOAL_AILI = [
  { no:1, dim:'AIL1', bloom:'C1 – Mengingat', teks:'Apa yang dimaksud dengan Artificial Intelligence (AI)?',
    opts:['Program komputer yang hanya mengikuti perintah yang sudah diprogram secara kaku','Kemampuan mesin untuk meniru kecerdasan manusia dalam memproses data dan membuat keputusan','Kumpulan database besar berisi informasi tentang berbagai topik','Sistem operasi canggih yang mengontrol perangkat keras komputer'], jwb:1,
    fb:'AI adalah kemampuan mesin meniru kecerdasan manusia: belajar dari data, mengenali pola, membuat keputusan, dan menyelesaikan masalah.' },
  { no:2, dim:'AIL1', bloom:'C1 – Mengingat', teks:'Dalam sistem Kopi Arabika Web3, model CNN (RepViT) berfungsi untuk:',
    opts:['Menyimpan sertifikat ke blockchain','Mengklasifikasikan citra biji kopi arabika ke jenis & grade, serta menolak gambar non-kopi','Membuat dompet kripto MetaMask','Mengontrol sensor IoT di kebun'], jwb:1,
    fb:'CNN RepViT mengklasifikasikan citra biji kopi ke jenis & grade dan mendeteksi out-of-distribution (Non-Coffee). Pencatatan ke blockchain dilakukan modul terpisah.' },
  { no:3, dim:'AIL1', bloom:'C2 – Memahami', teks:'Apa perbedaan mendasar antara Machine Learning (ML) dan Deep Learning (DL)?',
    opts:['ML pakai data lebih banyak, DL lebih sedikit','ML memerlukan rekayasa fitur manual, sedangkan DL mengekstrak fitur otomatis dari data mentah','ML hanya untuk teks, DL hanya untuk gambar','ML butuh GPU, DL hanya butuh CPU biasa'], jwb:1,
    fb:'ML tradisional butuh feature engineering manual; DL otomatis mempelajari representasi fitur bertingkat dari data mentah lewat lapisan jaringan yang dalam.' },
  { no:4, dim:'AIL1', bloom:'C2 – Memahami', teks:'CNN dalam klasifikasi biji kopi bekerja dengan cara:',
    opts:['Membaca teks deskripsi gejala dari petani','Mengekstrak fitur visual hierarkis dari gambar (tepi → tekstur → bentuk → objek) lewat lapisan konvolusi','Menganalisis suhu & kelembaban untuk memprediksi mutu','Menghitung kadar air biji dengan sensor inframerah'], jwb:1,
    fb:'CNN mengekstrak fitur visual secara hierarkis: dari tepi sederhana di lapisan awal hingga pola kompleks (warna, bentuk, tekstur biji) di lapisan dalam.' },
  { no:5, dim:'AIL1', bloom:'C2 – Memahami', teks:'Mengapa citra biji kopi perlu di-preprocess (resize & normalisasi piksel) sebelum masuk CNN?',
    opts:['Agar file tersimpan lebih efisien','Agar foto tidak bisa dibaca demi keamanan','Agar ukuran & skala nilai piksel seragam sehingga model belajar stabil dan konvergen lebih cepat','Agar gambar terlihat lebih menarik'], jwb:2,
    fb:'Resize menyeragamkan dimensi input; normalisasi piksel menyamakan skala nilai sehingga pelatihan stabil dan konvergensi lebih cepat.' },
  { no:6, dim:'AIL1', bloom:'C2 – Memahami', teks:'Apa yang dimaksud transfer learning dalam klasifikasi biji kopi?',
    opts:['Memindahkan file model antar komputer via USB','Memanfaatkan model pretrained (mis. RepViT/ImageNet) sebagai fondasi, lalu fine-tune pada dataset kopi yang lebih kecil','Mentransfer data dari Colab ke komputer lokal','Belajar langsung dari petani kopi berpengalaman'], jwb:1,
    fb:'Transfer learning memakai model yang sudah dilatih pada jutaan gambar umum sebagai fondasi, lalu di-fine-tune pada dataset biji kopi yang lebih kecil — jauh lebih efektif daripada melatih dari nol.' },
  { no:7, dim:'AIL1', bloom:'C2 – Memahami', teks:'Apa itu overfitting dalam pelatihan model AI?',
    opts:['Model selesai training lebih cepat dari jadwal','Model memakai terlalu banyak RAM','Model terlalu menghafal data training sehingga akurasi tinggi di training tapi rendah di data baru','Model melatih terlalu banyak gambar sehingga lambat'], jwb:2,
    fb:'Overfitting: model menghafal noise/detail spesifik data training, bukan pola umum. Solusi: dropout, regularisasi, augmentasi data, early stopping.' },

  { no:8, dim:'AIL2', bloom:'C3 – Menerapkan', teks:'Data citra biji kopi hanya 200 sampel per kelas. Strategi terbaik melatih CNN:',
    opts:['Latih dari nol (from scratch) karena data sedikit lebih mudah','Gunakan transfer learning dari model pretrained, lalu fine-tune pada data kopi','Tidak usah pakai CNN karena data terlalu sedikit','Gandakan gambar manual dengan copy-paste'], jwb:1,
    fb:'Dengan data terbatas, transfer learning adalah pilihan terbaik: representasi visual pretrained mempercepat & menstabilkan pelatihan pada data kopi yang kecil.' },
  { no:9, dim:'AIL2', bloom:'C3 – Menerapkan', teks:'Model CNN kopi: akurasi training 98% tetapi validasi 71%. Langkah paling tepat:',
    opts:['Tambah lapisan & neuron agar kapasitas naik','Perpanjang training hingga loss training nol','Atasi overfitting: terapkan dropout, augmentasi, early stopping, atau regularisasi','Ganti framework dari TensorFlow ke PyTorch'], jwb:2,
    fb:'Selisih besar training–validasi adalah tanda overfitting. Solusi: dropout, augmentasi data, early stopping, regularisasi L2, atau perbanyak data.' },
  { no:10, dim:'AIL2', bloom:'C3 – Menerapkan', teks:'Augmentasi data (rotasi, flip, zoom, brightness) pada citra biji kopi berguna untuk:',
    opts:['Mengubah format JPG ke PNG','Memperbesar resolusi gambar','Menciptakan variasi data training agar model lebih robust dan mengurangi overfitting','Mengompres ukuran file'], jwb:2,
    fb:'Augmentasi membuat variasi artifisial sehingga model lebih tahan terhadap perbedaan sudut/pencahayaan dan generalisasinya meningkat, terutama saat data terbatas.' },
  { no:11, dim:'AIL2', bloom:'C3 – Menerapkan', teks:'Untuk mengevaluasi model KLASIFIKASI jenis kopi, metrik yang tepat adalah:',
    opts:['RMSE dan MAE karena umum dipakai di AI','Accuracy, Precision, Recall, dan F1-Score karena ini tugas klasifikasi','R² karena mengukur variasi data','MSE karena menghitung selisih kuadrat'], jwb:1,
    fb:'Klasifikasi memakai Accuracy, Precision, Recall, F1. RMSE/MAE/R² adalah metrik untuk regresi (prediksi nilai kontinu), bukan klasifikasi.' },
  { no:12, dim:'AIL2', bloom:'C3 – Menerapkan', teks:'Membuat model klasifikasi kopi dengan Teachable Machine, langkah pertama yang wajib:',
    opts:['Langsung tekan Train Model tanpa menyiapkan data','Mendefinisikan kelas yang ingin dikenali dan mengumpulkan data gambar representatif tiap kelas','Memilih arsitektur paling kompleks agar akurat','Mengunduh dataset acak dari internet tanpa memeriksanya'], jwb:1,
    fb:'Definisikan kelas dengan jelas dan kumpulkan data representatif berkualitas. Kualitas data lebih penting dari kompleksitas model — garbage in, garbage out.' },
  { no:13, dim:'AIL2', bloom:'C3 – Menerapkan', teks:'Sebelum sertifikat dicatat ke blockchain, foto biji kopi di-hash dengan SHA-256 untuk:',
    opts:['Memperkecil ukuran file foto','Menghasilkan sidik jari unik 256-bit sebagai bukti keaslian dan mencegah sertifikat ganda','Mengenkripsi foto agar tidak bisa dibuka','Mempercepat proses upload ke IPFS'], jwb:1,
    fb:'SHA-256 menghasilkan sidik jari 256-bit yang unik & satu arah. Hash ini dicatat di registry on-chain untuk mendeteksi foto identik (anti-duplikasi sertifikat).' },

  { no:14, dim:'AIL3', bloom:'C4 – Menganalisis', teks:'Confusion matrix model kopi: TP=95, FP=8, TN=87, FN=10. Hitung Precision:',
    opts:['95 / (95+10) = 90,5%','95 / (95+8) = 92,2%','87 / (87+8) = 91,6%','(95+87) / 200 = 91,0%'], jwb:1,
    fb:'Precision = TP/(TP+FP) = 95/103 ≈ 92,2% (dari semua prediksi positif, berapa yang benar). Recall = TP/(TP+FN) = 90,5%. F1 ≈ 91,3%.' },
  { no:15, dim:'AIL3', bloom:'C5 – Mengevaluasi', teks:'Model A: akurasi 90%, F1 0,88. Model B: akurasi 94%, F1 0,93. Mana lebih baik dan mengapa?',
    opts:['Model A, karena angka lebih kecil berarti lebih hati-hati','Model B, karena akurasi dan F1 lebih tinggi (lebih banyak prediksi benar & seimbang precision-recall)','Sama saja karena selisihnya kecil','Model A, karena memakai lebih sedikit lapisan'], jwb:1,
    fb:'Model B unggul: akurasi lebih tinggi dan F1 lebih tinggi (keseimbangan precision-recall lebih baik). Semakin tinggi akurasi & F1, semakin baik model klasifikasi.' },
  { no:16, dim:'AIL3', bloom:'C5 – Mengevaluasi', teks:'Model CNN 96% di data uji, tapi di kebun nyata akurasinya turun jadi 65%. Evaluasi penyebabnya:',
    opts:['Model terlalu sederhana, perlu lebih banyak lapisan','Domain shift: data latih (kondisi lab) berbeda dari lapangan (pencahayaan, sudut, latar bervariasi)','65% sudah sangat baik untuk pertanian','Masalah pada GPU yang lambat'], jwb:1,
    fb:'Domain/distributional shift: distribusi data lapangan beda dari data latih. Solusi: kumpulkan data dari kondisi lapangan nyata & augmentasi yang mensimulasikan variasi pencahayaan/sudut.' },
  { no:17, dim:'AIL3', bloom:'C6 – Mencipta', teks:'Rancangan sistem sertifikasi kopi paling komprehensif & tepercaya adalah:',
    opts:['Hanya CNN untuk klasifikasi biji kopi','Sistem terpadu: CNN klasifikasi + Grad-CAM (penjelasan) + SHA-256 anti-duplikat + simpan ke IPFS + sertifikat NFT immutable di blockchain','Hanya database foto yang dicari manual','Hanya pencatatan NFT tanpa klasifikasi'], jwb:1,
    fb:'Sistem terbaik menggabungkan klasifikasi (CNN), penjelasan yang dapat diaudit (Grad-CAM), keaslian (SHA-256 + IPFS content-addressing), dan sertifikat tak-termodifikasi (NFT/blockchain).' },
  { no:18, dim:'AIL3', bloom:'C5 – Mengevaluasi', teks:'Mengapa menyimpan penjelasan AI (Grad-CAM, distribusi probabilitas, entropi) secara immutable di blockchain/IPFS itu penting?',
    opts:['Agar sertifikat terlihat lebih panjang','Agar keputusan AI dapat diaudit dan tidak dapat diubah, sehingga akuntabel & tepercaya','Agar model berjalan lebih cepat','Agar biaya gas lebih murah'], jwb:1,
    fb:'Menyimpan bukti penjelasan secara tak-termodifikasi menjadikan keputusan AI dapat diverifikasi & diaudit kapan pun — inti dari Explainable + Verifiable AI.' },
  { no:19, dim:'AIL3', bloom:'C6 – Mencipta', teks:'Desain eksperimen membandingkan RepViT vs MobileNet untuk klasifikasi kopi yang valid harus:',
    opts:['Membandingkan akurasi akhir saja tanpa pembagian train/test','Menggunakan dataset & split data sama, preprocessing identik, metrik sama, dan beberapa kali run untuk stabilitas','Memilih model dengan grafik paling mulus secara visual','Memakai dataset berbeda untuk tiap model agar adil'], jwb:1,
    fb:'Eksperimen valid: dataset & split identik, preprocessing sama, metrik konsisten, dan multiple runs (karena DL bersifat stokastik). Dataset berbeda per model = bias eksperimental.' },

  { no:20, dim:'AIL4', bloom:'C5 – Etika', teks:'Model CNN dilatih dengan data 90% dari satu daerah penghasil kopi saja. Masalah yang muncul:',
    opts:['Tidak ada masalah, data seragam lebih konsisten','Model bias terhadap satu daerah dan bisa tidak akurat/tidak adil di daerah lain dengan kondisi berbeda','Model lebih cepat dilatih','Model tidak bisa di-deploy karena lisensi'], jwb:1,
    fb:'Bias data training adalah isu etika kritis. Data tidak representatif menghasilkan performa tidak adil bagi daerah yang tak terwakili. Fairness AI menuntut data yang inklusif.' },
  { no:21, dim:'AIL4', bloom:'C5 – Etika', teks:'AI menentukan harga beli kopi dari petani tetapi tidak bisa menjelaskan alasannya. Isu etika yang relevan:',
    opts:['Tidak masalah karena AI selalu lebih akurat','Kurang transparansi (explainability) — petani berhak atas penjelasan; keputusan AI harus dapat diaudit & dijelaskan (di sinilah Grad-CAM/XAI berperan)','Hanya masalah teknis kecepatan model','Petani tidak perlu memahami cara kerja AI'], jwb:1,
    fb:'Explainability & transparency adalah prinsip AI bertanggung jawab. Keputusan yang berdampak finansial harus dapat dijelaskan & diaudit — bukan kotak hitam.' },
  { no:22, dim:'AIL4', bloom:'C5 – Etika', teks:'Sensor IoT di kebun kopi tanpa sengaja merekam aktivitas harian petani, lalu dipakai untuk pengawasan. Masalahnya:',
    opts:['Tidak masalah karena kebun milik perusahaan','Pelanggaran privasi — data dikumpulkan tanpa informed consent untuk tujuan pengawasan; penggunaan harus sesuai tujuan awal','Berguna untuk optimasi jadwal sehingga dibenarkan','Hanya masalah bila data bocor ke pihak ketiga'], jwb:1,
    fb:'Prinsip data minimization & purpose limitation: kumpulkan seperlunya, pakai sesuai tujuan awal, dan dapatkan informed consent. Pengawasan tersembunyi = pelanggaran privasi.' },
  { no:23, dim:'AIL4', bloom:'C5 – Etika', teks:'AI merekomendasikan pestisida berlebih, lalu petani mengikutinya membabi buta. Siapa yang bertanggung jawab atas dampaknya?',
    opts:['Hanya developer AI','Hanya petani','Tanggung jawab terdistribusi: developer (validasi model), petani (berpikir kritis), regulator (standar) — AI tidak menghapus tanggung jawab manusia','Tidak ada, karena keputusan dibuat AI'], jwb:2,
    fb:'Akuntabilitas dalam AI bersifat terdistribusi. "AI yang menyuruh" bukan pembenaran untuk lepas tanggung jawab moral.' },
  { no:24, dim:'AIL4', bloom:'C5 – Etika', teks:'Foto kebun petani kecil dipakai melatih model AI komersial tanpa kompensasi/izin. Isu yang relevan:',
    opts:['Normal saja, data publik bebas dipakai','Keadilan (fairness) & kepemilikan data — sumber data berhak atas consent/kompensasi; eksploitasi komunitas rentan untuk keuntungan komersial tidak etis (sertifikat NFT bisa memberi atribusi/kepemilikan ke petani)','Hanya masalah jika ada wajah manusia','Tidak masalah asal sumber dicantumkan di publikasi'], jwb:1,
    fb:'Data justice: komunitas sumber data berhak atas manfaat proporsional. Sertifikat NFT dapat dipakai memberi atribusi & kepemilikan pada petani — menyelaraskan teknologi dengan keadilan.' },
  { no:25, dim:'AIL4', bloom:'C5 – Etika', teks:'Pemerintah berencana mengganti seluruh penyuluh manusia dengan AI untuk budidaya kopi. Evaluasi etikanya:',
    opts:['Tepat, karena AI objektif, konsisten, dan tidak perlu digaji','Perlu dikritisi: AI tak bisa menggantikan empati & konteks lokal; risiko digital divide bagi petani tua; AI bisa salah & tak bisa bertanggung jawab moral','Baik asal diuji satu bulan','Tidak masalah asal dibuat tim yang kompeten'], jwb:1,
    fb:'Penggantian total menimbulkan isu: digital divide, hilangnya hubungan manusia & kepercayaan, accountability gap, dan dampak besar bila AI salah pada ketahanan pangan.' },
]

// English parallel set (same order, dim & jwb as SOAL_AILI)
const SOAL_AILI_EN = [
  { no:1, dim:'AIL1', bloom:'C1 – Remembering', teks:'What is Artificial Intelligence (AI)?',
    opts:['A computer program that only follows rigidly pre-programmed instructions','The ability of machines to mimic human intelligence in processing data and making decisions','A large database containing information on various topics','An advanced operating system that controls computer hardware'], jwb:1,
    fb:'AI is the ability of machines to mimic human intelligence: learning from data, recognizing patterns, making decisions, and solving problems.' },
  { no:2, dim:'AIL1', bloom:'C1 – Remembering', teks:'In the Kopi Arabika Web3 system, the CNN model (RepViT) functions to:',
    opts:['Store certificates on the blockchain','Classify arabica coffee-bean images into type & grade, and reject non-coffee images','Create a MetaMask crypto wallet','Control IoT sensors in the field'], jwb:1,
    fb:'RepViT CNN classifies bean images into type & grade and detects out-of-distribution (Non-Coffee). Recording to the blockchain is a separate module.' },
  { no:3, dim:'AIL1', bloom:'C2 – Understanding', teks:'What is the fundamental difference between Machine Learning (ML) and Deep Learning (DL)?',
    opts:['ML uses more data, DL uses less','ML requires manual feature engineering, while DL extracts features automatically from raw data','ML is only for text, DL only for images','ML needs a GPU, DL only needs a regular CPU'], jwb:1,
    fb:'Traditional ML needs manual feature engineering; DL automatically learns hierarchical feature representations from raw data through deep layers.' },
  { no:4, dim:'AIL1', bloom:'C2 – Understanding', teks:'A CNN in coffee-bean classification works by:',
    opts:['Reading text descriptions of symptoms from farmers','Extracting hierarchical visual features from the image (edges → texture → shape → object) via convolution layers','Analyzing temperature & humidity to predict quality','Measuring bean moisture with an infrared sensor'], jwb:1,
    fb:'A CNN extracts visual features hierarchically: from simple edges in early layers to complex patterns (color, shape, texture of beans) in deeper layers.' },
  { no:5, dim:'AIL1', bloom:'C2 – Understanding', teks:'Why do coffee-bean images need preprocessing (resize & pixel normalization) before entering the CNN?',
    opts:['So files are stored more efficiently','So the photo cannot be read, for security','So image size & pixel value scale are uniform, making training stable and convergence faster','So the image looks more attractive'], jwb:2,
    fb:'Resizing standardizes input dimensions; pixel normalization equalizes value scales so training is stable and converges faster.' },
  { no:6, dim:'AIL1', bloom:'C2 – Understanding', teks:'What is transfer learning in coffee-bean classification?',
    opts:['Moving model files between computers via USB','Using a pretrained model (e.g., RepViT/ImageNet) as a foundation, then fine-tuning on the smaller coffee dataset','Transferring data from Colab to a local computer','Learning directly from experienced coffee farmers'], jwb:1,
    fb:'Transfer learning uses a model already trained on millions of general images as a foundation, then fine-tunes it on the smaller coffee-bean dataset — far more effective than training from scratch.' },
  { no:7, dim:'AIL1', bloom:'C2 – Understanding', teks:'What is overfitting in model training?',
    opts:['The model finishes training earlier than scheduled','The model uses too much RAM','The model memorizes the training data too well, so accuracy is high on training but low on new data','The model trains too many images so it is slow'], jwb:2,
    fb:'Overfitting: the model memorizes noise/specific details of the training data instead of general patterns. Solutions: dropout, regularization, data augmentation, early stopping.' },

  { no:8, dim:'AIL2', bloom:'C3 – Applying', teks:'Coffee-bean image data has only 200 samples per class. The best strategy to train a CNN:',
    opts:['Train from scratch because little data is easier','Use transfer learning from a pretrained model, then fine-tune on the coffee data','Do not use a CNN because data is too little','Duplicate images manually by copy-paste'], jwb:1,
    fb:'With limited data, transfer learning is best: pretrained visual representations speed up and stabilize training on the small coffee dataset.' },
  { no:9, dim:'AIL2', bloom:'C3 – Applying', teks:'A coffee CNN has 98% training accuracy but 71% validation. The most appropriate step:',
    opts:['Add layers & neurons to increase capacity','Extend training until training loss reaches zero','Address overfitting: apply dropout, augmentation, early stopping, or regularization','Switch framework from TensorFlow to PyTorch'], jwb:2,
    fb:'A large training–validation gap signals overfitting. Solutions: dropout, data augmentation, early stopping, L2 regularization, or more data.' },
  { no:10, dim:'AIL2', bloom:'C3 – Applying', teks:'Data augmentation (rotation, flip, zoom, brightness) on coffee-bean images is useful to:',
    opts:['Convert JPG to PNG format','Increase image resolution','Create variation in the training data so the model is more robust and overfits less','Compress file size'], jwb:2,
    fb:'Augmentation creates artificial variation so the model better tolerates differences in angle/lighting and generalizes better, especially with limited data.' },
  { no:11, dim:'AIL2', bloom:'C3 – Applying', teks:'To evaluate a coffee-type CLASSIFICATION model, the appropriate metrics are:',
    opts:['RMSE and MAE because they are common in AI','Accuracy, Precision, Recall, and F1-Score because this is a classification task','R² because it measures data variance','MSE because it computes squared differences'], jwb:1,
    fb:'Classification uses Accuracy, Precision, Recall, F1. RMSE/MAE/R² are for regression (predicting continuous values), not classification.' },
  { no:12, dim:'AIL2', bloom:'C3 – Applying', teks:'When building a coffee classification model with Teachable Machine, the mandatory first step is:',
    opts:['Press Train Model immediately without preparing data','Define the classes to recognize and collect representative image data for each class','Choose the most complex architecture for accuracy','Download a random dataset from the internet without checking it'], jwb:1,
    fb:'Define classes clearly and collect quality, representative data. Data quality matters more than model complexity — garbage in, garbage out.' },
  { no:13, dim:'AIL2', bloom:'C3 – Applying', teks:'Before a certificate is recorded on the blockchain, the coffee-bean photo is hashed with SHA-256 to:',
    opts:['Reduce the photo file size','Produce a unique 256-bit fingerprint as proof of authenticity and to prevent duplicate certificates','Encrypt the photo so it cannot be opened','Speed up uploading to IPFS'], jwb:1,
    fb:'SHA-256 yields a unique, one-way 256-bit fingerprint. This hash is stored in an on-chain registry to detect identical photos (certificate anti-duplication).' },

  { no:14, dim:'AIL3', bloom:'C4 – Analyzing', teks:'Coffee model confusion matrix: TP=95, FP=8, TN=87, FN=10. Compute Precision:',
    opts:['95 / (95+10) = 90.5%','95 / (95+8) = 92.2%','87 / (87+8) = 91.6%','(95+87) / 200 = 91.0%'], jwb:1,
    fb:'Precision = TP/(TP+FP) = 95/103 ≈ 92.2% (of all positive predictions, how many are correct). Recall = TP/(TP+FN) = 90.5%. F1 ≈ 91.3%.' },
  { no:15, dim:'AIL3', bloom:'C5 – Evaluating', teks:'Model A: 90% accuracy, F1 0.88. Model B: 94% accuracy, F1 0.93. Which is better and why?',
    opts:['Model A, because smaller numbers mean it is more cautious','Model B, because higher accuracy and F1 (more correct predictions & better precision-recall balance)','The same, because the difference is small','Model A, because it uses fewer layers'], jwb:1,
    fb:'Model B wins: higher accuracy and higher F1 (better precision-recall balance). Higher accuracy & F1 mean a better classification model.' },
  { no:16, dim:'AIL3', bloom:'C5 – Evaluating', teks:'A CNN scores 96% on test data but drops to 65% in the real field. Evaluate the cause:',
    opts:['The model is too simple, needs more layers','Domain shift: training data (lab conditions) differs from the field (varied lighting, angle, background)','65% is already very good for agriculture','A slow GPU is the problem'], jwb:1,
    fb:'Domain/distributional shift: field-data distribution differs from training data. Solution: collect data from real field conditions & augment to simulate lighting/angle variation.' },
  { no:17, dim:'AIL3', bloom:'C6 – Creating', teks:'The most comprehensive and trustworthy coffee certification system design is:',
    opts:['Only a CNN to classify coffee beans','An integrated system: CNN classification + Grad-CAM (explanation) + SHA-256 anti-duplication + IPFS storage + immutable NFT certificate on the blockchain','Only a photo database searched manually','Only NFT recording without classification'], jwb:1,
    fb:'The best system combines classification (CNN), auditable explanation (Grad-CAM), authenticity (SHA-256 + IPFS content-addressing), and a tamper-proof certificate (NFT/blockchain).' },
  { no:18, dim:'AIL3', bloom:'C5 – Evaluating', teks:'Why is it important to store the AI explanation (Grad-CAM, probability distribution, entropy) immutably on blockchain/IPFS?',
    opts:['So the certificate looks longer','So the AI decision can be audited and cannot be altered, making it accountable & trustworthy','So the model runs faster','So gas fees are cheaper'], jwb:1,
    fb:'Storing the explanation immutably makes the AI decision verifiable & auditable anytime — the essence of Explainable + Verifiable AI.' },
  { no:19, dim:'AIL3', bloom:'C6 – Creating', teks:'A valid experiment design comparing RepViT vs MobileNet for coffee classification must:',
    opts:['Compare only final accuracy without a train/test split','Use the same dataset & split, identical preprocessing, the same metrics, and multiple runs for stability','Pick the model with the visually smoothest graph','Use a different dataset for each model to be fair'], jwb:1,
    fb:'A valid comparison: identical dataset & split, same preprocessing, consistent metrics, and multiple runs (DL is stochastic). Different datasets per model = experimental bias.' },

  { no:20, dim:'AIL4', bloom:'C5 – Ethics', teks:'A CNN is trained with 90% of data from only one coffee-producing region. The problem that arises:',
    opts:['No problem, uniform data is more consistent','The model is biased toward one region and may be inaccurate/unfair in other regions with different conditions','The model trains faster','The model cannot be deployed due to licensing'], jwb:1,
    fb:'Training-data bias is a critical ethical issue. Non-representative data yields unfair performance for unrepresented regions. AI fairness requires inclusive data.' },
  { no:21, dim:'AIL4', bloom:'C5 – Ethics', teks:'An AI sets the coffee purchase price from farmers but cannot explain why. The relevant ethical issue:',
    opts:['No problem because AI is always more accurate','Lack of transparency (explainability) — farmers deserve an explanation; AI decisions must be auditable & explainable (this is where Grad-CAM/XAI helps)','Only a technical speed problem','Farmers do not need to understand how AI works'], jwb:1,
    fb:'Explainability & transparency are principles of responsible AI. Financially impactful decisions must be explainable & auditable — not a black box.' },
  { no:22, dim:'AIL4', bloom:'C5 – Ethics', teks:'IoT sensors in a coffee farm accidentally record farmers’ daily activities, then used for surveillance. The problem:',
    opts:['No problem because the farm belongs to the company','Privacy violation — data collected without informed consent for surveillance; use must match the original purpose','Useful for schedule optimization so it is justified','Only a problem if data leaks to third parties'], jwb:1,
    fb:'Principles of data minimization & purpose limitation: collect only what is needed, use it per the original purpose, and obtain informed consent. Hidden surveillance = privacy violation.' },
  { no:23, dim:'AIL4', bloom:'C5 – Ethics', teks:'An AI recommends excessive pesticide, and the farmer follows blindly. Who is responsible for the impact?',
    opts:['Only the AI developer','Only the farmer','Distributed responsibility: developer (model validation), farmer (critical thinking), regulator (standards) — AI does not remove human responsibility','No one, because the AI decided'], jwb:2,
    fb:'Accountability in AI is distributed. “The AI said so” is not a justification to shed moral responsibility.' },
  { no:24, dim:'AIL4', bloom:'C5 – Ethics', teks:'Small farmers’ farm photos are used to train a commercial AI model without compensation/consent. The relevant issue:',
    opts:['Normal, public data is free to use','Fairness & data ownership — data sources deserve consent/compensation; exploiting vulnerable communities for commercial gain is unethical (NFT certificates can give attribution/ownership to farmers)','Only an issue if human faces appear','No problem as long as the source is cited in publications'], jwb:1,
    fb:'Data justice: source communities deserve proportional benefit. NFT certificates can give attribution & ownership to farmers — aligning technology with fairness.' },
  { no:25, dim:'AIL4', bloom:'C5 – Ethics', teks:'The government plans to replace all human extension workers with AI for coffee cultivation. Evaluate the ethics:',
    opts:['Right, because AI is objective, consistent, and needs no salary','It must be critiqued: AI cannot replace empathy & local context; risk of a digital divide for older farmers; AI can err & cannot bear moral responsibility','Fine as long as it is tested for one month','No problem as long as it is built by a competent team'], jwb:1,
    fb:'Total replacement raises issues: digital divide, loss of human connection & trust, an accountability gap, and large impact on food security if the AI errs.' },
]

async function sha256(text) {
  const buf = new TextEncoder().encode(text)
  const h = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, '0')).join('')
}

function HashPlayground({ t }) {
  const [text, setText] = useState('Kopi Arabika Ijen')
  const [hash, setHash] = useState('')
  async function update(v) { setText(v); setHash(v ? await sha256(v) : '') }
  // hitung awal sekali
  if (!hash && text) sha256(text).then(setHash)
  return (
    <div className="card learn-card">
      <h4 className="learn-h">{t.hashHead}</h4>
      <p className="learn-p">{t.hashSub}</p>
      <div className="field"><input value={text} placeholder={t.hashPh} onChange={e => update(e.target.value)} /></div>
      <div className="learn-mono-lbl">{t.hashLabel}</div>
      <div className="learn-mono">{hash || '—'}</div>
      <p className="learn-note">{t.hashNote}</p>
    </div>
  )
}

function EntropyLab({ t }) {
  const [v, setV] = useState([70, 15, 10, 5])
  const labels = ['A', 'B', 'C', 'D']
  const colors = ['#8b5cf6', '#38bdf8', '#22d3ee', '#4ade80']
  const total = v.reduce((s, x) => s + x, 0) || 1
  let H = 0
  for (const x of v) { const p = x / total; if (p > 0) H += -p * Math.log2(p) }
  const maxH = Math.log2(v.length)
  const u = maxH > 0 ? H / maxH : 0
  const verdict = u < 0.45 ? t.entSure : u < 0.7 ? t.entMid : t.entLow
  const vClass = u < 0.45 ? 'ok' : u < 0.7 ? 'mid' : 'low'
  return (
    <div className="card learn-card">
      <h4 className="learn-h">{t.entHead}</h4>
      <p className="learn-p">{t.entSub}</p>
      {v.map((val, i) => (
        <div className="ent-row" key={i}>
          <span className="ent-k" style={{ color: colors[i] }}>Kelas {labels[i]}</span>
          <input className="learn-slider" type="range" min="0" max="100" value={val}
            onChange={e => { const nv = [...v]; nv[i] = Number(e.target.value); setV(nv) }}
            style={{ accentColor: colors[i] }} />
          <span className="ent-v">{(val / total * 100).toFixed(0)}%</span>
        </div>
      ))}
      <div className="ent-out">
        <span>{t.entropy}: <b>{H.toFixed(2)} bit</b> · {t.entUnc}: <b>{(u * 100).toFixed(0)}%</b></span>
        <span className={`xai-badge ${vClass}`}>{verdict}</span>
      </div>
    </div>
  )
}

// ============================================================
// Lab Blockchain — rantai 4 blok, proof of work, pembanding basis data
// Seluruhnya berjalan di peramban: tanpa jaringan, tanpa dompet, tanpa transaksi.
// ============================================================
const NOL64 = '0'.repeat(64)

const DATA_AWAL = [
  'GENESIS · Kopi Arabika Web3',
  'Arabika Natural Ijen · Grade B · Pak Ramli',
  'Arabika Peaberry · Grade A · Bu Sari',
  'Arabika Anaerob Carbonic · Grade A · Pak Sumantri',
]

const BC_CH = {
  id: {
    title: '⛓️ Lab Blockchain — Coba Palsukan Sertifikat',
    sub: 'Empat blok berisi sertifikat kopi. Ubah satu huruf saja pada blok mana pun, lalu amati apa yang terjadi pada blok-blok sesudahnya.',
    intro: 'Belum pernah menyentuh blockchain? Tidak apa-apa. Bayangkan buku catatan yang setiap halamannya menyalin sidik jari halaman sebelumnya. Merobek atau mengubah satu halaman langsung membuat semua halaman sesudahnya tidak cocok — itulah inti blockchain, dan hal itulah yang akan kamu buktikan sendiri di bawah ini.',
    caraHead: '📖 Cara memakai lab ini — ikuti tujuh langkah berikut',
    cara: [
      'Perhatikan empat blok di bawah. Semuanya bertanda hijau, artinya rantai masih sah.',
      'Isi dulu kotak prediksi: menurutmu, apa yang terjadi pada blok sesudahnya bila satu blok diubah?',
      'Pada Blok 2, ubah tulisan "Grade B" menjadi "Grade A", lalu klik di luar kolom.',
      'Amati blok mana saja yang berubah merah. Cocok dengan dugaanmu tadi?',
      'Tekan "Perbaiki Seluruh Rantai". Catat berapa percobaan dan berapa milidetik yang dibutuhkan.',
      'Naikkan tingkat kesulitan menjadi 3, lalu tekan perbaiki lagi. Bandingkan biayanya dengan langkah 5.',
      'Terakhir, pindah ke mode "Basis Data Biasa" dan ulangi langkah 3. Perhatikan bedanya.',
    ],
    istilahHead: '❓ Istilah penting — buka bila ada kata yang asing',
    istilah: [
      ['Hash', 'Sidik jari digital sepanjang 64 karakter yang dihitung dari isi data. Ubah satu huruf saja, seluruh sidik jarinya berubah total. Tidak bisa dibalik menjadi data aslinya.'],
      ['prevHash', 'Salinan hash milik blok sebelumnya. Inilah "rantai" yang mengikat satu blok ke blok lain. Kalau tidak cocok lagi, berarti ada yang diubah.'],
      ['Nonce', 'Angka pembantu yang diubah-ubah sampai hash memenuhi syarat. Nonce tidak punya arti lain selain sebagai bahan coba-coba.'],
      ['Proof of work (bukti kerja)', 'Syarat bahwa hash harus diawali sejumlah angka nol. Tidak ada jalan pintas — satu-satunya cara adalah mencoba nonce berulang kali sampai kebetulan cocok.'],
      ['Mining', 'Proses mencoba nonce sampai syarat bukti kerja terpenuhi. Makin tinggi tingkat kesulitannya, makin banyak percobaan yang dibutuhkan.'],
      ['Blok genesis', 'Blok pertama dalam rantai. Ia tidak punya blok sebelumnya, sehingga prevHash-nya berisi angka nol semua.'],
    ],
    modeChain: '⛓️ Blockchain', modeDb: '🗄️ Basis Data Biasa',
    noteChain: 'Mode blockchain: setiap blok mengunci blok sebelumnya lewat prevHash, dan hash-nya wajib memenuhi bukti kerja.',
    noteDb: 'Mode basis data biasa: setiap baris berdiri sendiri. Ubah apa pun — tidak ada jejak, tidak ada tanda, tidak ada yang rusak.',
    diff: 'Tingkat kesulitan — jumlah angka 0 di depan hash',
    diffNote: 'Menaikkan tingkat kesulitan membuat seluruh hash lama tidak lagi memenuhi syarat, sehingga rantai menjadi tidak sah. Tekan Perbaiki Seluruh Rantai, lalu bandingkan biayanya.',
    predictLbl: '🔮 Sebelum mengedit, tulis dugaanmu: apa yang akan terjadi pada blok sesudahnya?',
    predictPh: 'Menurut saya blok 3 dan 4 akan…',
    scenario: '🎯 Skenario: kamu ingin menaikkan mutu kopi pada Blok 2. Ubah "Grade B" menjadi "Grade A", lalu amati rantainya.',
    block: 'Blok', genesis: 'Genesis',
    dataLbl: 'Data sertifikat (boleh diedit)',
    prevLbl: 'prevHash — kunci ke blok sebelumnya',
    hashLbl: 'hash blok ini', nonceLbl: 'nonce',
    linkOk: '🔗 Tautan sah', linkBad: '⛓️‍💥 Tautan putus',
    powOk: '⛏️ Bukti kerja sah', powBad: '⚠️ Bukti kerja gagal', terdampak: '⛔ Terdampak blok rusak di hulu',
    dbOk: '💾 Tersimpan', dbNote: 'Tidak ada jejak perubahan.',
    mineOne: '⛏️ Mining blok ini', fixAll: '🔧 Perbaiki Seluruh Rantai', reset: '↩️ Atur Ulang',
    mining: 'Mining…', attempts: 'percobaan',
    costLbl: 'Biaya perbaikan terakhir',
    chainOk: '✅ Seluruh rantai sah.', chainBad: '❌ Rantai rusak — ada blok yang tidak sah.',
    lessonH: 'Apa yang baru saja kamu buktikan?',
    lesson: [
      'Mengubah satu huruf mengubah seluruh hash — inilah efek longsoran (avalanche effect).',
      'Hash yang berubah membuat prevHash blok berikutnya tidak lagi cocok, sehingga kerusakan menjalar ke semua blok sesudahnya.',
      'Memperbaikinya menuntut mining ulang setiap blok yang terdampak. Naikkan tingkat kesulitan, lalu rasakan biayanya melonjak.',
      'Bandingkan dengan mode basis data biasa: di sana pemalsuan tidak meninggalkan jejak sama sekali.',
    ],
  },
  en: {
    title: '⛓️ Blockchain Lab — Try Forging a Certificate',
    sub: 'Four blocks hold coffee certificates. Change a single character in any block, then watch what happens to the blocks after it.',
    intro: 'Never touched a blockchain before? That’s fine. Picture a notebook where every page copies the fingerprint of the page before it. Tear out or alter one page and every page after it stops matching — that is the heart of a blockchain, and it is exactly what you are about to prove for yourself below.',
    caraHead: '📖 How to use this lab — follow these seven steps',
    cara: [
      'Look at the four blocks below. All of them are green, meaning the chain is still valid.',
      'First write your prediction: if one block is changed, what will happen to the blocks after it?',
      'In Block 2, change "Grade B" to "Grade A", then click outside the field.',
      'Observe which blocks turn red. Does it match your prediction?',
      'Press "Repair Whole Chain". Note how many attempts and how many milliseconds it took.',
      'Raise the difficulty to 3, then repair again. Compare the cost with step 5.',
      'Finally, switch to "Ordinary Database" mode and repeat step 3. Notice the difference.',
    ],
    istilahHead: '❓ Key terms — open this if any word is unfamiliar',
    istilah: [
      ['Hash', 'A 64-character digital fingerprint computed from the data. Change a single character and the whole fingerprint changes completely. It cannot be reversed back into the original data.'],
      ['prevHash', 'A copy of the previous block’s hash. This is the "chain" that binds one block to another. If it no longer matches, something was altered.'],
      ['Nonce', 'A helper number that is varied until the hash meets the requirement. The nonce has no meaning beyond being trial material.'],
      ['Proof of work', 'The requirement that a hash must begin with a certain number of zeros. There is no shortcut — the only way is to try nonces repeatedly until one happens to fit.'],
      ['Mining', 'The process of trying nonces until the proof-of-work requirement is met. The higher the difficulty, the more attempts it takes.'],
      ['Genesis block', 'The first block in the chain. It has no predecessor, so its prevHash is all zeros.'],
    ],
    modeChain: '⛓️ Blockchain', modeDb: '🗄️ Ordinary Database',
    noteChain: 'Blockchain mode: each block locks the previous one through prevHash, and its hash must satisfy proof of work.',
    noteDb: 'Ordinary database mode: each row stands alone. Change anything — no trace, no warning, nothing breaks.',
    diff: 'Difficulty — number of leading zeros required',
    diffNote: 'Raising the difficulty makes every existing hash fall short, so the chain becomes invalid. Press Repair Whole Chain, then compare the cost.',
    predictLbl: '🔮 Before editing, write your prediction: what will happen to the blocks after it?',
    predictPh: 'I think blocks 3 and 4 will…',
    scenario: '🎯 Scenario: you want to upgrade the coffee grade in Block 2. Change "Grade B" to "Grade A", then watch the chain.',
    block: 'Block', genesis: 'Genesis',
    dataLbl: 'Certificate data (editable)',
    prevLbl: 'prevHash — link to the previous block',
    hashLbl: 'this block’s hash', nonceLbl: 'nonce',
    linkOk: '🔗 Link valid', linkBad: '⛓️‍💥 Link broken',
    powOk: '⛏️ Proof of work valid', powBad: '⚠️ Proof of work failed', terdampak: '⛔ Invalidated by a broken block upstream',
    dbOk: '💾 Saved', dbNote: 'No trace of the change.',
    mineOne: '⛏️ Mine this block', fixAll: '🔧 Repair Whole Chain', reset: '↩️ Reset',
    mining: 'Mining…', attempts: 'attempts',
    costLbl: 'Last repair cost',
    chainOk: '✅ The whole chain is valid.', chainBad: '❌ Chain broken — some blocks are invalid.',
    lessonH: 'What did you just prove?',
    lesson: [
      'Changing one character changes the entire hash — this is the avalanche effect.',
      'A changed hash makes the next block’s prevHash stop matching, so the damage cascades to every block after it.',
      'Repairing it demands re-mining every affected block. Raise the difficulty and feel the cost climb.',
      'Compare with ordinary database mode: there, forgery leaves no trace at all.',
    ],
  },
}

// Cari nonce sampai hash memenuhi jumlah nol di depan. Diselingi jeda agar tampilan tidak membeku.
async function tambang(idx, data, prevHash, sulit, onTick) {
  const target = '0'.repeat(sulit)
  const MAKS = 400000
  let nonce = 0, coba = 0, h = ''
  while (coba < MAKS) {
    h = await sha256(`${idx}|${data}|${nonce}|${prevHash}`)
    coba++
    if (h.startsWith(target)) return { nonce, hash: h, coba }
    nonce++
    // Jeda dibuat jarang: tiap jeda memicu render ulang React yang jauh lebih mahal
    // daripada hashing itu sendiri (24.800 hash/detik tanpa jeda vs 1.800 dengan jeda tiap 400).
    if (coba % 2500 === 0) { onTick && onTick(coba); await new Promise(r => setTimeout(r, 0)) }
  }
  return { nonce, hash: h, coba, gagal: true }
}

function LabBlockchain({ lang }) {
  const c = BC_CH[lang] || BC_CH.id
  const [mode, setMode]   = useState('chain')
  const [sulit, setSulit] = useState(2)
  const [blocks, setBlocks] = useState([])
  const [sibuk, setSibuk] = useState(false)
  const [tick, setTick]   = useState(0)
  const [biaya, setBiaya] = useState(null)
  const [duga, setDuga]   = useState('')
  const [seed, setSeed]   = useState(0)
  const batal = useRef(0)

  // Bangun ulang rantai saat mode atau tingkat kesulitan berubah
  useEffect(() => {
    const sesi = ++batal.current
    let hidup = true
    ;(async () => {
      setSibuk(true); setBiaya(null)
      const out = []
      let prev = NOL64
      for (let i = 0; i < DATA_AWAL.length; i++) {
        if (mode === 'db') {
          out.push({ data: DATA_AWAL[i], nonce: 0, hash: '', prevHash: '' })
        } else {
          const r = await tambang(i, DATA_AWAL[i], prev, sulit, setTick)
          if (!hidup || sesi !== batal.current) return
          out.push({ data: DATA_AWAL[i], nonce: r.nonce, hash: r.hash, prevHash: prev })
          prev = r.hash
        }
      }
      if (!hidup || sesi !== batal.current) return
      setBlocks(out); setSibuk(false); setTick(0)
    })()
    return () => { hidup = false }
    // Sengaja TIDAK bergantung pada `sulit`: menaikkan kesulitan justru harus membuat
    // rantai menjadi tidak sah, lalu siswa merasakan biayanya lewat tombol perbaikan.
  }, [mode, seed])

  // Edit data: hash blok itu dihitung ulang, blok sesudahnya sengaja TIDAK disentuh
  async function editData(i, nilai) {
    const nb = [...blocks]
    nb[i] = { ...nb[i], data: nilai }
    if (mode === 'chain') {
      nb[i].hash = await sha256(`${i}|${nilai}|${nb[i].nonce}|${nb[i].prevHash}`)
    }
    setBlocks(nb)
  }

  // Sebuah blok hanya sah bila pemeriksaannya sendiri lolos DAN seluruh blok di hulunya sah.
  // Inilah sebabnya kerusakan satu blok menjalar ke semua blok sesudahnya.
  function status(i) {
    const b = blocks[i]
    if (!b) return { powOk: true, linkOk: true, sendiriOk: true, ok: true, terdampak: false }
    const nol = '0'.repeat(sulit)
    const cek = (k) => {
      const p = blocks[k]
      const pow  = p.hash.startsWith(nol)
      const link = k === 0 ? p.prevHash === NOL64 : p.prevHash === blocks[k - 1].hash
      return pow && link
    }
    const powOk  = b.hash.startsWith(nol)
    const linkOk = i === 0 ? b.prevHash === NOL64 : b.prevHash === blocks[i - 1].hash
    const sendiriOk = powOk && linkOk
    let huluSah = true
    for (let k = 0; k < i; k++) { if (!cek(k)) { huluSah = false; break } }
    return { powOk, linkOk, sendiriOk, ok: sendiriOk && huluSah, terdampak: sendiriOk && !huluSah }
  }

  async function miningSatu(i) {
    setSibuk(true); setTick(0)
    const t0 = performance.now()
    const prev = i === 0 ? NOL64 : blocks[i - 1].hash
    const r = await tambang(i, blocks[i].data, prev, sulit, setTick)
    const nb = [...blocks]
    nb[i] = { ...nb[i], nonce: r.nonce, hash: r.hash, prevHash: prev }
    setBlocks(nb)
    setBiaya({ n: r.coba, ms: Math.round(performance.now() - t0) })
    setSibuk(false); setTick(0)
  }

  async function perbaikiSemua() {
    setSibuk(true); setTick(0)
    const t0 = performance.now()
    const nb = [...blocks]
    let prev = NOL64, total = 0
    for (let i = 0; i < nb.length; i++) {
      const cocok = nb[i].prevHash === prev &&
        nb[i].hash === await sha256(`${i}|${nb[i].data}|${nb[i].nonce}|${prev}`) &&
        nb[i].hash.startsWith('0'.repeat(sulit))
      if (cocok) { prev = nb[i].hash; continue }
      const r = await tambang(i, nb[i].data, prev, sulit, setTick)
      total += r.coba
      nb[i] = { ...nb[i], nonce: r.nonce, hash: r.hash, prevHash: prev }
      prev = r.hash
    }
    setBlocks(nb)
    setBiaya({ n: total, ms: Math.round(performance.now() - t0) })
    setSibuk(false); setTick(0)
  }

  function aturUlang() { setBiaya(null); setDuga(''); setSeed(s => s + 1) }

  const rantaiSah = mode === 'chain' && blocks.length > 0 && blocks.every((_, i) => status(i).ok)
  const pot = (h) => h ? `${h.slice(0, 20)}…${h.slice(-8)}` : '—'

  return (
    <div className="card learn-card">
      <h4 className="learn-h">{c.title}</h4>
      <p className="learn-p">{c.sub}</p>

      <div className="bc-intro">{c.intro}</div>

      <details className="gloss bc-guide" open>
        <summary>{c.caraHead}</summary>
        <ol className="bc-steps">{c.cara.map((x, i) => <li key={i}>{x}</li>)}</ol>
      </details>

      <details className="gloss bc-guide">
        <summary>{c.istilahHead}</summary>
        <dl className="bc-terms">
          {c.istilah.map(([k, d], i) => (
            <div key={i}><dt>{k}</dt><dd>{d}</dd></div>
          ))}
        </dl>
      </details>

      <div className="bc-toolbar">
        <div className="bc-mode">
          <button className={mode === 'chain' ? 'on' : ''} onClick={() => setMode('chain')} disabled={sibuk}>{c.modeChain}</button>
          <button className={mode === 'db' ? 'on' : ''} onClick={() => setMode('db')} disabled={sibuk}>{c.modeDb}</button>
        </div>
        {mode === 'chain' && (
          <div className="bc-diff">
            <span>{c.diff}: <b>{sulit}</b></span>
            <input className="learn-slider" type="range" min="1" max="3" value={sulit} disabled={sibuk}
              onChange={e => setSulit(Number(e.target.value))} />
          </div>
        )}
      </div>

      <p className="learn-note">{mode === 'chain' ? c.noteChain : c.noteDb}</p>
      {mode === 'chain' && <p className="learn-note">{c.diffNote}</p>}

      {mode === 'chain' && (
        <>
          <div className="bc-scenario">{c.scenario}</div>
          <div className="field">
            <label>{c.predictLbl}</label>
            <input value={duga} placeholder={c.predictPh} onChange={e => setDuga(e.target.value)} />
          </div>
        </>
      )}

      {sibuk && <div className="bc-busy">{c.mining} {tick > 0 && <b>{tick.toLocaleString()} {c.attempts}</b>}</div>}

      <div className="bc-chain">
        {blocks.map((b, i) => {
          const s = status(i)
          const rusak = mode === 'chain' && !s.ok
          return (
            <div key={i} className={`bc-block ${mode === 'db' ? 'db' : rusak ? 'bad' : 'ok'}`}>
              <div className="bc-head">
                <b>{c.block} {i + 1}{i === 0 ? ` · ${c.genesis}` : ''}</b>
                {mode === 'db'
                  ? <span className="bc-badge db">{c.dbOk}</span>
                  : <span className="bc-badges">
                      <span className={`bc-badge ${s.linkOk ? 'ok' : 'bad'}`}>{s.linkOk ? c.linkOk : c.linkBad}</span>
                      <span className={`bc-badge ${s.powOk ? 'ok' : 'bad'}`}>{s.powOk ? c.powOk : c.powBad}</span>
                      {s.terdampak && <span className="bc-badge bad">{c.terdampak}</span>}
                    </span>}
              </div>

              <div className="bc-row">
                <span className="bc-lbl">{c.dataLbl}</span>
                <input className="bc-input" value={b.data} disabled={sibuk}
                  onChange={e => editData(i, e.target.value)} />
              </div>

              {mode === 'chain' ? (
                <>
                  <div className="bc-row">
                    <span className="bc-lbl">{c.prevLbl}</span>
                    <div className={`bc-mono ${s.linkOk ? '' : 'bad'}`}>{pot(b.prevHash)}</div>
                  </div>
                  <div className="bc-row">
                    <span className="bc-lbl">{c.hashLbl} · {c.nonceLbl} {b.nonce}</span>
                    <div className={`bc-mono ${s.powOk ? '' : 'bad'}`}>{pot(b.hash)}</div>
                  </div>
                  {!s.ok && (
                    <button className="btn btn-ghost bc-mine" disabled={sibuk} onClick={() => miningSatu(i)}>{c.mineOne}</button>
                  )}
                </>
              ) : <p className="learn-note" style={{ margin: '2px 0 0' }}>{c.dbNote}</p>}
            </div>
          )
        })}
      </div>

      {mode === 'chain' && blocks.length > 0 && (
        <>
          <div className={`bc-verdict ${rantaiSah ? 'ok' : 'bad'}`}>{rantaiSah ? c.chainOk : c.chainBad}</div>
          <div className="bc-actions">
            <button className="btn btn-ghost" disabled={sibuk || rantaiSah} onClick={perbaikiSemua}>{c.fixAll}</button>
            <button className="btn btn-ghost" disabled={sibuk} onClick={aturUlang}>{c.reset}</button>
          </div>
          {biaya && <p className="bc-cost">{c.costLbl}: <b>{biaya.n.toLocaleString()}</b> {c.attempts} · <b>{biaya.ms} ms</b></p>}
          <div className="bc-lesson">
            <b className="learn-sub-h">{c.lessonH}</b>
            <ul className="learn-ul">{c.lesson.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================
// Lab Konvolusi — bagaimana CNN sebenarnya "melihat"
// Empat miskonsepsi yang sengaja dilawan di lab ini:
//  1) kernel BUKAN diambil dari citra, melainkan bobot hasil pelatihan
//  2) jendela BERTUMPANG TINDIH, bukan citra yang dicacah jadi kepingan
//  3) tujuannya MEMBUANG informasi (abstraksi), bukan mencerminkan citra
//  4) RGB hanya ada di lapisan pertama; sesudahnya kanal bukan lagi warna
// ============================================================
const POLA = {
  tepi:   { r: 8, f: (y, x) => (x < 4 ? 40 : 210) },
  biji:   { r: 8, f: (y, x) => { const dy = y - 3.5, dx = x - 3.5; const d = Math.sqrt(dy * dy / 1.15 + dx * dx); return d < 2.6 ? 215 - d * 22 : 45 } },
  garis:  { r: 8, f: (y, x) => (Math.abs(y - x) <= 1 ? 220 : 50) },
}

const KERNEL = [
  { id: 'identitas', m: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], bagi: 1 },
  { id: 'tepi',      m: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], bagi: 1 },
  { id: 'tegak',     m: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], bagi: 1 },
  { id: 'datar',     m: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], bagi: 1 },
  { id: 'halus',     m: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], bagi: 9 },
  { id: 'tajam',     m: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], bagi: 1 },
]

function buatPola(nama) {
  const p = POLA[nama] || POLA.biji
  const out = []
  for (let y = 0; y < p.r; y++) { const b = []; for (let x = 0; x < p.r; x++) b.push(Math.max(0, Math.min(255, Math.round(p.f(y, x))))); out.push(b) }
  return out
}

// Konvolusi tanpa padding: keluaran menyusut (8x8 -> 6x6). Penyusutan itu disengaja
// dan menjadi bukti kasat mata bahwa informasi memang dibuang bertahap.
function konvolusi(mat, ker, bagi) {
  const n = mat.length, k = ker.length, o = n - k + 1
  const out = []
  for (let y = 0; y < o; y++) {
    const row = []
    for (let x = 0; x < o; x++) {
      let s = 0
      for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) s += mat[y + j][x + i] * ker[j][i]
      row.push(s / (bagi || 1))
    }
    out.push(row)
  }
  return out
}

// Menjepit nilai negatif menjadi 0 — persis yang dilakukan ReLU pada CNN sungguhan.
const relu = (v) => Math.max(0, Math.min(255, Math.round(v)))
const abuStyle = (v) => { const g = relu(v); return { background: `rgb(${g},${g},${g})`, color: g > 130 ? '#111' : '#eee' } }

const KV_CH = {
  id: {
    title: '🔍 Lab Konvolusi — Cara CNN Sebenarnya Melihat',
    sub: 'Grad-CAM menunjukkan bagian mana yang dilihat model. Lab ini menunjukkan bagaimana model itu melihat — dan ternyata seluruhnya hanya perkalian dan penjumlahan.',
    intro: 'Citra digital bukan "gambar" bagi komputer, melainkan tabel angka. Lab ini membongkar satu operasi paling mendasar pada CNN, yaitu konvolusi, sampai ke aritmetikanya. Setelah ini, istilah "lapisan konvolusi" tidak lagi terdengar seperti sihir.',
    caraHead: '📖 Cara memakai lab ini — enam langkah',
    cara: [
      'Perhatikan Petak Masukan: setiap kotak adalah satu piksel, angkanya tingkat keabuan 0 (hitam) sampai 255 (putih).',
      'Pilih sebuah kernel. Perhatikan bahwa kernel adalah tabel bobot yang TERPISAH dari citra — nilainya boleh kamu ubah sendiri.',
      'Lihat Peta Fitur di sebelahnya. Ia langsung berubah setiap kali kernel diganti.',
      'Ketuk salah satu kotak pada Peta Fitur. Jendela 3×3 yang dipakai akan tersorot, dan seluruh perhitungannya muncul di bawah.',
      'Bandingkan ukuran petak masukan dengan peta fitur. Mengapa menyusut? Itu bukan kesalahan.',
      'Turun ke bagian citra kopi nyata, terapkan kernel yang sama, lalu lihat tepi biji kopi benar-benar muncul.',
    ],
    istilahHead: '❓ Istilah penting — buka bila ada kata yang asing',
    istilah: [
      ['Piksel', 'Satu kotak terkecil pada citra. Nilainya angka: 0 berarti hitam, 255 berarti putih. Citra berwarna menyimpan tiga angka per piksel (merah, hijau, biru).'],
      ['Kernel (filter)', 'Tabel bobot berukuran kecil, di sini 3×3. PENTING: kernel tidak diambil dari citra. Pada CNN sungguhan, nilai kernel adalah hasil pelatihan — itulah yang dipelajari model dari ribuan gambar.'],
      ['Konvolusi', 'Menggeser kernel ke seluruh posisi citra. Di tiap posisi, angka jendela dikalikan dengan angka kernel lalu dijumlahkan menjadi satu angka.'],
      ['Peta fitur', 'Hasil konvolusi. Ia menandai di mana pola yang dicari kernel itu muncul — misalnya di mana ada tepi tegak.'],
      ['ReLU', 'Fungsi yang mengubah semua nilai negatif menjadi nol. Tanpa fungsi semacam ini, menumpuk banyak lapisan konvolusi tidak ada gunanya karena runtuh menjadi satu lapisan.'],
      ['Stride & padding', 'Seberapa jauh kernel melompat, dan apakah tepi citra diberi bingkai tambahan. Di lab ini stride 1 dan tanpa padding, sehingga keluarannya menyusut.'],
    ],
    polaHead: 'Petak Masukan (citra sebagai tabel angka)',
    pola: { tepi: 'Tepi tegak', biji: 'Bentuk biji', garis: 'Garis diagonal' },
    kernelHead: 'Kernel — tabel bobot',
    kernelNote: 'Pada CNN sungguhan, angka-angka ini TIDAK dirancang manusia dan TIDAK diambil dari citra. Semuanya hasil pelatihan. Di lab ini kernel dipilih tangan supaya efeknya mudah dikenali.',
    kernelNama: { identitas: 'Identitas (tanpa perubahan)', tepi: 'Deteksi tepi', tegak: 'Deteksi garis tegak', datar: 'Deteksi garis datar', halus: 'Penghalus (blur)', tajam: 'Penajam' },
    bagiLbl: 'dibagi',
    bobotDiubah: '✏️ Bobot kernel sudah kamu ubah sendiri. Tekan salah satu tombol kernel di atas untuk mengembalikannya ke nilai semula.',
    petaHead: 'Peta Fitur (hasil konvolusi)',
    petaHint: '👆 Ketuk salah satu kotak untuk melihat perhitungannya',
    hitungHead: 'Perhitungan untuk kotak terpilih',
    hitungJendela: 'Jendela 3×3 yang dipakai (tersorot kuning di petak masukan)',
    hitungHasil: 'Jumlah seluruh perkalian',
    hitungRelu: 'Setelah ReLU (negatif dijadikan nol)',
    susutHead: '📉 Mengapa peta fitur lebih kecil?',
    susut: (a, b) => `Petak masukan ${a}×${a} menjadi peta fitur ${b}×${b}. Kernel 3×3 tidak bisa ditempatkan di luar tepi, sehingga baris dan kolom terluar tidak menghasilkan keluaran. Penyusutan ini bukan cacat — justru inilah cara CNN membuang informasi bertahap. Tujuannya BUKAN mencerminkan kembali gambarnya, melainkan menyaring sampai tersisa ciri yang membedakan satu kelas dari kelas lain.`,
    susutNyataHead: 'Tapi bukan itu penyebab utamanya',
    susutNyata: 'Pada CNN sungguhan, penyusutan karena tepi seperti di atas hanyalah penyebab kecil. Penyusutan utamanya berasal dari stride (kernel melompat lebih dari satu piksel sekali geser) dan pooling (beberapa piksel diringkas menjadi satu nilai). Karena keduanya, citra 224×224 menyusut menjadi 112, lalu 56, lalu 28, dan seterusnya — jauh lebih cepat daripada sekadar berkurang dua piksel tiap lapisan. Lab ini sengaja memakai stride 1 tanpa pooling agar aritmetikanya tetap terbaca.',
    banyakHead: '🎛️ Satu lapisan memakai banyak kernel sekaligus',
    banyakNote: 'Semua peta fitur di bawah dihasilkan dari petak masukan yang SAMA, hanya kernelnya berbeda. Inilah yang terjadi pada satu lapisan konvolusi: bukan satu kernel, melainkan puluhan hingga ratusan sekaligus, masing-masing mencari pola berbeda. Karena itu satu lapisan menghasilkan banyak peta fitur, bukan satu.',
    tumpukLbl: '🔁 Terapkan kernel kedua di atas hasil pertama (konvolusi bertumpuk)',
    tumpukNote: 'Inilah arti kata "dalam" pada deep learning: lapisan awal menangkap tepi, lapisan berikutnya menyusun tepi menjadi bentuk. Perhatikan ukurannya menyusut sekali lagi. Perhatikan juga bahwa sebelum masuk lapisan kedua, seluruh nilai negatif dijepit menjadi nol oleh ReLU — persis seperti pada CNN sungguhan. Tanpa fungsi non-linear semacam itu, dua lapisan konvolusi yang ditumpuk secara matematis runtuh menjadi satu lapisan saja, sehingga menambah kedalaman tidak ada gunanya.',
    tumpukHead: 'Peta Fitur Lapisan Kedua',
    fotoHead: '📷 Terapkan pada citra kopi sungguhan',
    fotoSub: 'Citra diperkecil menjadi 64×64 dan diubah ke keabuan, lalu kernel yang sama di atas diterapkan ke seluruh posisinya.',
    fotoAsli: 'Sesudah diperkecil & diabukan', fotoHasil: 'Setelah konvolusi',
    fotoPilih: '🖼️ Pakai contoh biji kopi', fotoUnggah: '📁 Pakai foto sendiri',
    kuisHead: '🎯 Latihan: tebak kernelnya',
    kuisSub: 'Peta fitur di bawah dihasilkan oleh salah satu kernel. Kernel mana?',
    kuisBenar: '✓ Tepat! Perhatikan pola terang pada peta fiturnya.',
    kuisSalah: '✗ Belum tepat. Coba perhatikan arah garis yang menyala.',
    kuisUlang: '🔄 Soal lain',
    koreksiHead: '⚠️ Empat hal yang sering disalahpahami',
    koreksi: [
      'Kernel tidak diambil dari gambar. Ia matriks bobot hasil pelatihan; gambar hanya menyediakan jendela pikselnya.',
      'Gambar tidak dicacah menjadi kepingan terpisah. Jendela bertumpang tindih — satu piksel ikut dihitung pada sampai sembilan jendela berbeda.',
      'Tujuannya bukan mencerminkan gambar, melainkan membuang informasi bertahap sampai tersisa ciri pembeda kelas.',
      'RGB hanya dikenali lapisan pertama. Kernel 3×3 pada masukan RGB sebenarnya 3×3×3 dan tetap menghasilkan satu angka. Setelah itu kanalnya bukan warna lagi, melainkan puluhan kanal fitur abstrak.',
    ],
    sederhanaHead: 'Penyederhanaan di lab ini',
    sederhana: 'Lab ini memakai satu kanal keabuan dan satu kernel pilihan tangan agar aritmetikanya terbaca. Model RepViT-M1.1 pada situs ini memakai RGB di lapisan pertama, puluhan hingga ratusan kernel per lapisan yang seluruhnya hasil pelatihan, serta fungsi non-linear di antara lapisannya.',
    jembatanHead: '🔗 Hubungannya dengan Grad-CAM',
    jembatan: 'Grad-CAM yang kamu lihat pada hasil klasifikasi adalah peta panas yang dihitung dari peta fitur lapisan konvolusi terakhir. Jadi peta fitur yang baru saja kamu buat di sini adalah bahan dasar yang sama.',
    biayaHead: '⚙️ Mengapa arsitektur ringan itu penting',
    biaya: (n) => `Satu kernel 3×3 pada citra 224×224 membutuhkan sekitar ${n} perkalian. Satu lapisan memakai puluhan kernel, dan satu model punya puluhan lapisan. Dari sinilah kebutuhan akan CNN ringan untuk perangkat bergerak bermula.`,
  },
  en: {
    title: '🔍 Convolution Lab — How a CNN Actually Sees',
    sub: 'Grad-CAM shows which part the model looked at. This lab shows how it looks — and it turns out to be nothing but multiplication and addition.',
    intro: 'To a computer a digital image is not a “picture” but a table of numbers. This lab takes apart the most fundamental operation in a CNN, convolution, right down to its arithmetic. After this, the phrase “convolutional layer” will no longer sound like magic.',
    caraHead: '📖 How to use this lab — six steps',
    cara: [
      'Look at the Input Grid: each square is one pixel, its number is the grey level from 0 (black) to 255 (white).',
      'Pick a kernel. Notice it is a table of weights SEPARATE from the image — you may edit the values yourself.',
      'Watch the Feature Map beside it. It updates the moment you change the kernel.',
      'Tap any square on the Feature Map. The 3×3 window used is highlighted and the full calculation appears below.',
      'Compare the size of the input grid with the feature map. Why did it shrink? That is not a mistake.',
      'Scroll to the real coffee image, apply the same kernel, and watch the bean edges genuinely appear.',
    ],
    istilahHead: '❓ Key terms — open this if any word is unfamiliar',
    istilah: [
      ['Pixel', 'The smallest square of an image. Its value is a number: 0 is black, 255 is white. Colour images store three numbers per pixel (red, green, blue).'],
      ['Kernel (filter)', 'A small table of weights, here 3×3. IMPORTANT: the kernel is not taken from the image. In a real CNN its values are the result of training — that is what the model learns from thousands of images.'],
      ['Convolution', 'Sliding the kernel across every position of the image. At each position the window numbers are multiplied by the kernel numbers and summed into a single number.'],
      ['Feature map', 'The result of convolution. It marks where the pattern the kernel looks for appears — for instance where the vertical edges are.'],
      ['ReLU', 'A function that turns every negative value into zero. Without something like it, stacking many convolutional layers is pointless because they collapse into a single layer.'],
      ['Stride & padding', 'How far the kernel jumps, and whether the image edge gets an extra border. This lab uses stride 1 and no padding, so the output shrinks.'],
    ],
    polaHead: 'Input Grid (an image as a table of numbers)',
    pola: { tepi: 'Vertical edge', biji: 'Bean shape', garis: 'Diagonal line' },
    kernelHead: 'Kernel — table of weights',
    kernelNote: 'In a real CNN these numbers are NOT designed by humans and are NOT taken from the image. They all come from training. This lab hand-picks kernels so their effect is easy to recognise.',
    kernelNama: { identitas: 'Identity (no change)', tepi: 'Edge detection', tegak: 'Vertical line detection', datar: 'Horizontal line detection', halus: 'Blur', tajam: 'Sharpen' },
    bagiLbl: 'divided by',
    bobotDiubah: '✏️ You have edited the kernel weights yourself. Press any kernel button above to restore the original values.',
    petaHead: 'Feature Map (result of convolution)',
    petaHint: '👆 Tap any square to see its calculation',
    hitungHead: 'Calculation for the selected square',
    hitungJendela: '3×3 window used (highlighted yellow in the input grid)',
    hitungHasil: 'Sum of all products',
    hitungRelu: 'After ReLU (negatives become zero)',
    susutHead: '📉 Why is the feature map smaller?',
    susut: (a, b) => `A ${a}×${a} input grid becomes a ${b}×${b} feature map. A 3×3 kernel cannot be placed past the border, so the outermost rows and columns produce no output. This shrinking is not a flaw — it is exactly how a CNN discards information step by step. The goal is NOT to mirror the picture back, but to filter until only the features that separate one class from another remain.`,
    susutNyataHead: 'But that is not the main cause',
    susutNyata: 'In a real CNN, border shrinking like the above is only a minor cause. The main shrinking comes from stride (the kernel jumping more than one pixel per step) and pooling (several pixels summarised into one value). Because of these, a 224×224 image shrinks to 112, then 56, then 28, and so on — far faster than merely losing two pixels per layer. This lab deliberately uses stride 1 with no pooling so the arithmetic stays readable.',
    banyakHead: '🎛️ One layer uses many kernels at once',
    banyakNote: 'Every feature map below comes from the SAME input grid — only the kernel differs. This is what happens inside a single convolutional layer: not one kernel but dozens to hundreds at once, each hunting a different pattern. That is why one layer produces many feature maps, not one.',
    tumpukLbl: '🔁 Apply a second kernel on top of the first result (stacked convolution)',
    tumpukNote: 'This is what “deep” in deep learning means: early layers catch edges, later layers assemble edges into shapes. Notice the size shrinks once again. Notice too that before entering the second layer every negative value is clamped to zero by ReLU — exactly as in a real CNN. Without such a non-linear function, two stacked convolutional layers mathematically collapse into a single layer, so adding depth would achieve nothing.',
    tumpukHead: 'Second-Layer Feature Map',
    fotoHead: '📷 Apply it to a real coffee image',
    fotoSub: 'The image is scaled down to 64×64 and converted to greyscale, then the same kernel above is applied across every position.',
    fotoAsli: 'After downscaling & greyscaling', fotoHasil: 'After convolution',
    fotoPilih: '🖼️ Use the coffee sample', fotoUnggah: '📁 Use your own photo',
    kuisHead: '🎯 Practice: guess the kernel',
    kuisSub: 'The feature map below was produced by one of the kernels. Which one?',
    kuisBenar: '✓ Correct! Look at the bright pattern in the feature map.',
    kuisSalah: '✗ Not quite. Look again at the direction of the bright lines.',
    kuisUlang: '🔄 Another question',
    koreksiHead: '⚠️ Four things that are commonly misunderstood',
    koreksi: [
      'The kernel is not taken from the image. It is a matrix of trained weights; the image only supplies the pixel window.',
      'The image is not chopped into separate pieces. The windows overlap — one pixel takes part in up to nine different windows.',
      'The goal is not to mirror the image, but to discard information step by step until only class-distinguishing features remain.',
      'RGB exists only at the first layer. A 3×3 kernel on RGB input is really 3×3×3 and still yields one number. After that the channels are no longer colours but dozens of abstract feature channels.',
    ],
    sederhanaHead: 'Simplifications in this lab',
    sederhana: 'This lab uses a single greyscale channel and one hand-picked kernel so the arithmetic stays readable. The RepViT-M1.1 model on this site uses RGB at its first layer, dozens to hundreds of fully trained kernels per layer, and non-linear functions between layers.',
    jembatanHead: '🔗 How this connects to Grad-CAM',
    jembatan: 'The Grad-CAM you see on a classification result is a heatmap computed from the feature maps of the last convolutional layer. So the feature map you just built here is made of exactly the same material.',
    biayaHead: '⚙️ Why lightweight architectures matter',
    biaya: (n) => `A single 3×3 kernel on a 224×224 image needs roughly ${n} multiplications. One layer uses dozens of kernels, and one model has dozens of layers. This is where the need for lightweight CNNs on mobile devices begins.`,
  },
}

function PetakAngka({ mat, sorot, kecil, onKlik, pilih }) {
  const n = mat.length
  return (
    <div className={`kv-grid ${kecil ? 'kecil' : ''}`} style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
      {mat.map((row, y) => row.map((v, x) => {
        const disorot = sorot && y >= sorot.y && y < sorot.y + 3 && x >= sorot.x && x < sorot.x + 3
        const dipilih = pilih && pilih.y === y && pilih.x === x
        return (
          <div key={`${y}-${x}`}
            className={`kv-sel ${disorot ? 'sorot' : ''} ${dipilih ? 'pilih' : ''} ${onKlik ? 'klik' : ''}`}
            style={abuStyle(v)}
            onClick={onKlik ? () => onKlik(y, x) : undefined}>
            <span>{Math.round(v)}</span>
          </div>
        )
      }))}
    </div>
  )
}

function LabKonvolusi({ lang }) {
  const c = KV_CH[lang] || KV_CH.id
  const [pola, setPola]   = useState('biji')
  const [kIdx, setKIdx]   = useState(1)
  const [kMat, setKMat]   = useState(KERNEL[1].m.map(r => [...r]))
  const [bagi, setBagi]   = useState(KERNEL[1].bagi)
  const [pilih, setPilih] = useState(null)
  const [tumpuk, setTumpuk]   = useState(false)
  const [k2Idx, setK2Idx]     = useState(3)
  const [kuis, setKuis]       = useState({ jawab: null, kunci: 2 })
  const cvAsli  = useRef(null)
  const cvHasil = useRef(null)
  const [imgSrc, setImgSrc] = useState('/kopi-cherry.jpg')

  const masukan = buatPola(pola)
  const peta    = konvolusi(masukan, kMat, bagi)
  const peta2   = tumpuk ? konvolusi(peta.map(r => r.map(relu)), KERNEL[k2Idx].m, KERNEL[k2Idx].bagi) : null

  function pilihKernel(i) { setKIdx(i); setKMat(KERNEL[i].m.map(r => [...r])); setBagi(KERNEL[i].bagi); setPilih(null) }
  function ubahBobot(j, i, v) { const nk = kMat.map(r => [...r]); nk[j][i] = Number(v) || 0; setKMat(nk); setKIdx(-1) }

  // Terapkan kernel ke citra nyata
  useEffect(() => {
    let batal = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (batal || !cvAsli.current || !cvHasil.current) return
      const N = 64
      const off = document.createElement('canvas'); off.width = N; off.height = N
      const ox = off.getContext('2d'); ox.drawImage(img, 0, 0, N, N)
      let d
      try { d = ox.getImageData(0, 0, N, N).data } catch { return }
      const abu = []
      for (let y = 0; y < N; y++) { const row = []; for (let x = 0; x < N; x++) { const i = (y * N + x) * 4; row.push(Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])) } abu.push(row) }
      const lukis = (m, cv) => {
        const s = m.length; cv.width = s; cv.height = s
        const ctx = cv.getContext('2d'); const im = ctx.createImageData(s, s)
        for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const g = relu(m[y][x]); const i = (y * s + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = g; im.data[i + 3] = 255 }
        ctx.putImageData(im, 0, 0)
      }
      lukis(abu, cvAsli.current)
      lukis(konvolusi(abu, kMat, bagi), cvHasil.current)
    }
    img.src = imgSrc
    return () => { batal = true }
  }, [imgSrc, kMat, bagi])

  function unggah(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const fr = new FileReader()
    fr.onload = () => setImgSrc(String(fr.result))
    fr.readAsDataURL(f)
  }

  // Data perhitungan untuk kotak terpilih
  let rinci = null
  if (pilih) {
    const suku = []
    let jml = 0
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      const p = masukan[pilih.y + j][pilih.x + i], w = kMat[j][i]
      suku.push({ p, w, hasil: p * w }); jml += p * w
    }
    rinci = { suku, jml, akhir: jml / (bagi || 1) }
  }

  const petaKuis = konvolusi(buatPola('garis'), KERNEL[kuis.kunci].m, KERNEL[kuis.kunci].bagi)
  const opsiKuis = [1, 2, 3, 4]

  return (
    <div className="card learn-card">
      <h4 className="learn-h">{c.title}</h4>
      <p className="learn-p">{c.sub}</p>
      <div className="bc-intro">{c.intro}</div>

      <details className="gloss bc-guide" open>
        <summary>{c.caraHead}</summary>
        <ol className="bc-steps">{c.cara.map((x, i) => <li key={i}>{x}</li>)}</ol>
      </details>
      <details className="gloss bc-guide">
        <summary>{c.istilahHead}</summary>
        <dl className="bc-terms">{c.istilah.map(([k, d], i) => <div key={i}><dt>{k}</dt><dd>{d}</dd></div>)}</dl>
      </details>

      {/* ---- Kernel ---- */}
      <div className="kv-blok">
        <b className="learn-sub-h">{c.kernelHead}</b>
        <div className="kv-kernel-pilih">
          {KERNEL.map((k, i) => (
            <button key={k.id} className={`kv-chip ${kIdx === i ? 'on' : ''}`} onClick={() => pilihKernel(i)}>
              {c.kernelNama[k.id]}
            </button>
          ))}
        </div>
        <div className="kv-kernel-baris">
          <div className="kv-kernel">
            {kMat.map((row, j) => row.map((v, i) => (
              <input key={`${j}-${i}`} type="number" value={v} onChange={e => ubahBobot(j, i, e.target.value)} />
            )))}
          </div>
          {bagi !== 1 && <span className="kv-bagi">{c.bagiLbl} {bagi}</span>}
        </div>
        {kIdx === -1 && <p className="kv-diubah">{c.bobotDiubah}</p>}
        <p className="learn-note kv-warn">{c.kernelNote}</p>
      </div>

      {/* ---- Petak & peta fitur ---- */}
      <div className="kv-dua">
        <div>
          <b className="learn-sub-h">{c.polaHead}</b>
          <div className="kv-kernel-pilih">
            {Object.keys(POLA).map(p => (
              <button key={p} className={`kv-chip ${pola === p ? 'on' : ''}`} onClick={() => { setPola(p); setPilih(null) }}>{c.pola[p]}</button>
            ))}
          </div>
          <PetakAngka mat={masukan} sorot={pilih} />
        </div>
        <div>
          <b className="learn-sub-h">{c.petaHead} — {peta.length}×{peta.length}</b>
          <p className="learn-note" style={{ margin: '2px 0 6px' }}>{c.petaHint}</p>
          <PetakAngka mat={peta} onKlik={(y, x) => setPilih({ y, x })} pilih={pilih} />
        </div>
      </div>

      {/* ---- Aritmetika ---- */}
      {rinci && (
        <div className="kv-hitung">
          <b className="learn-sub-h">{c.hitungHead}</b>
          <p className="learn-note" style={{ margin: '2px 0 8px' }}>{c.hitungJendela}</p>
          <div className="kv-suku">
            {rinci.suku.map((s, i) => (
              <span key={i} className="kv-term">
                <b>{s.p}</b> × <i>{s.w}</i> = {s.hasil}
              </span>
            ))}
          </div>
          <div className="kv-jumlah">
            <span>{c.hitungHasil}: <b>{bagi !== 1 ? `${rinci.jml} ÷ ${bagi} = ${rinci.akhir.toFixed(1)}` : rinci.jml}</b></span>
            <span className="kv-relu">{c.hitungRelu}: <b>{relu(rinci.akhir)}</b></span>
          </div>
        </div>
      )}

      {/* ---- Satu lapisan = banyak kernel ---- */}
      <div className="kv-blok">
        <b className="learn-sub-h">{c.banyakHead}</b>
        <p className="learn-p">{c.banyakNote}</p>
        <div className="kv-banyak">
          {[1, 2, 3, 5].map(i => (
            <figure key={i}>
              <PetakAngka mat={konvolusi(masukan, KERNEL[i].m, KERNEL[i].bagi)} kecil />
              <figcaption>{c.kernelNama[KERNEL[i].id]}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* ---- Penyusutan ---- */}
      <div className="kv-catatan">
        <b className="learn-sub-h">{c.susutHead}</b>
        <p className="learn-p">{c.susut(masukan.length, peta.length)}</p>
        <b className="learn-sub-h">{c.susutNyataHead}</b>
        <p className="learn-p" style={{ marginBottom: 0 }}>{c.susutNyata}</p>
      </div>

      {/* ---- Konvolusi bertumpuk ---- */}
      <label className="kv-toggle">
        <input type="checkbox" checked={tumpuk} onChange={e => setTumpuk(e.target.checked)} />
        <span>{c.tumpukLbl}</span>
      </label>
      {tumpuk && peta2 && (
        <div className="kv-blok">
          <div className="kv-kernel-pilih">
            {KERNEL.map((k, i) => (
              <button key={k.id} className={`kv-chip ${k2Idx === i ? 'on' : ''}`} onClick={() => setK2Idx(i)}>{c.kernelNama[k.id]}</button>
            ))}
          </div>
          <b className="learn-sub-h">{c.tumpukHead} — {peta2.length}×{peta2.length}</b>
          <PetakAngka mat={peta2} />
          <p className="learn-note">{c.tumpukNote}</p>
        </div>
      )}

      {/* ---- Citra nyata ---- */}
      <div className="kv-blok">
        <b className="learn-sub-h">{c.fotoHead}</b>
        <p className="learn-p">{c.fotoSub}</p>
        <div className="kv-foto">
          <figure><canvas ref={cvAsli} className="kv-canvas" /><figcaption>{c.fotoAsli}</figcaption></figure>
          <figure><canvas ref={cvHasil} className="kv-canvas" /><figcaption>{c.fotoHasil}</figcaption></figure>
        </div>
        <div className="kv-foto-aksi">
          <button className="btn btn-ghost" onClick={() => setImgSrc('/kopi-cherry.jpg')}>{c.fotoPilih}</button>
          <label className="btn btn-ghost kv-unggah">{c.fotoUnggah}
            <input type="file" accept="image/*" onChange={unggah} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* ---- Kuis ---- */}
      <div className="kv-blok">
        <b className="learn-sub-h">{c.kuisHead}</b>
        <p className="learn-p">{c.kuisSub}</p>
        <PetakAngka mat={petaKuis} kecil />
        <div className="kv-kernel-pilih" style={{ marginTop: 8 }}>
          {opsiKuis.map(i => (
            <button key={i} className={`kv-chip ${kuis.jawab === i ? (i === kuis.kunci ? 'benar' : 'salah') : ''}`}
              onClick={() => setKuis(k => ({ ...k, jawab: i }))}>{c.kernelNama[KERNEL[i].id]}</button>
          ))}
        </div>
        {kuis.jawab !== null && (
          <p className={`kv-umpan ${kuis.jawab === kuis.kunci ? 'ok' : 'no'}`}>
            {kuis.jawab === kuis.kunci ? c.kuisBenar : c.kuisSalah}
          </p>
        )}
        <button className="btn btn-ghost" style={{ maxWidth: 200, marginTop: 8 }}
          onClick={() => setKuis({ jawab: null, kunci: opsiKuis[Math.floor(Math.random() * opsiKuis.length)] })}>{c.kuisUlang}</button>
      </div>

      {/* ---- Koreksi miskonsepsi ---- */}
      <div className="kv-koreksi">
        <b className="learn-sub-h">{c.koreksiHead}</b>
        <ol className="bc-steps">{c.koreksi.map((x, i) => <li key={i}>{x}</li>)}</ol>
        <b className="learn-sub-h">{c.sederhanaHead}</b>
        <p className="learn-p">{c.sederhana}</p>
      </div>

      <div className="kv-catatan">
        <b className="learn-sub-h">{c.jembatanHead}</b>
        <p className="learn-p">{c.jembatan}</p>
        <b className="learn-sub-h">{c.biayaHead}</b>
        <p className="learn-p" style={{ marginBottom: 0 }}>{c.biaya((222 * 222 * 9).toLocaleString(lang === 'en' ? 'en-US' : 'id-ID'))}</p>
      </div>
    </div>
  )
}

function ailiLevelCls(p) {
  if (p >= 85) return 'a'
  if (p >= 70) return 'b'
  if (p >= 55) return 'c'
  return 'd'
}

const AILI_CH = {
  id: { title: '🤖 Kuis AI Literacy (AILI) — 25 Soal', ctx: 'Konteks: CNN + Blockchain untuk sertifikasi Kopi Arabika Web3 · Framework Ng et al. (2021), 4 dimensi AI literacy.', progress: 'Progress', prev: '← Sebelumnya', next: 'Selanjutnya →', see: '🎯 Lihat Hasil', ok: '✓ Benar! ', no: '✗ Belum tepat. ', correctAns: 'jawaban benar', dimScore: 'Skor per Dimensi AI Literacy', recap: 'Rekap Jawaban', th: ['No', 'Dim', 'Bloom', 'Anda', 'Kunci', 'Status'], interpH: 'Interpretasi (AILI)', interp: ['🌟 85–100% — Sangat Tinggi: mahir di semua dimensi.', '✅ 70–84% — Tinggi: paham baik, perkuat dimensi terlemah.', '⚠️ 55–69% — Sedang: dasar ada, perdalam konsep & etika AI.', '📚 <55% — Rendah: perlu pembelajaran lebih intensif.'], restart: '🔄 Ulangi Kuis dari Awal', levels: { a: 'Sangat Tinggi 🌟', b: 'Tinggi ✅', c: 'Sedang ⚠️', d: 'Rendah — Perlu Penguatan 📚' } },
  en: { title: '🤖 AI Literacy Quiz (AILI) — 25 Questions', ctx: 'Context: CNN + Blockchain for Kopi Arabika Web3 certification · Framework: Ng et al. (2021), 4 AI-literacy dimensions.', progress: 'Progress', prev: '← Previous', next: 'Next →', see: '🎯 See Results', ok: '✓ Correct! ', no: '✗ Not quite. ', correctAns: 'correct answers', dimScore: 'Score per AI Literacy Dimension', recap: 'Answer Recap', th: ['No', 'Dim', 'Bloom', 'You', 'Key', 'Status'], interpH: 'Interpretation (AILI)', interp: ['🌟 85–100% — Very High: mastery in all dimensions.', '✅ 70–84% — High: good understanding, strengthen the weakest dimension.', '⚠️ 55–69% — Medium: basics present, deepen concepts & AI ethics.', '📚 <55% — Low: needs more intensive learning.'], restart: '🔄 Restart Quiz', levels: { a: 'Very High 🌟', b: 'High ✅', c: 'Medium ⚠️', d: 'Low — Needs Strengthening 📚' } },
}

function QuizAILI({ lang }) {
  const [cur, setCur] = useState(0)
  const [ans, setAns] = useState(Array(SOAL_AILI.length).fill(null))
  const [showResult, setShowResult] = useState(false)
  const Q = lang === 'en' ? SOAL_AILI_EN : SOAL_AILI
  const C = AILI_CH[lang] || AILI_CH.id

  const pilih = (j) => setAns(a => { if (a[cur] != null) return a; const n = [...a]; n[cur] = j; return n })
  const go = (d) => setCur(c => Math.max(0, Math.min(SOAL_AILI.length - 1, c + d)))
  const restart = () => { setCur(0); setAns(Array(SOAL_AILI.length).fill(null)); setShowResult(false) }

  if (showResult) {
    const total = Q.reduce((s, q, i) => s + (ans[i] === q.jwb ? 1 : 0), 0)
    const pct = Math.round(total / Q.length * 100)
    const perDim = { AIL1: 0, AIL2: 0, AIL3: 0, AIL4: 0 }
    Q.forEach((q, i) => { if (ans[i] === q.jwb) perDim[q.dim]++ })
    const cls = ailiLevelCls(pct)
    return (
      <div className="card learn-card aili-result">
        <div className="aili-score">{total}/{Q.length}</div>
        <div className="aili-pct">{pct}% {C.correctAns}</div>
        <div className={`aili-level lv-${cls}`}>{C.levels[cls]}</div>
        <div className="learn-sub-h">{C.dimScore}</div>
        <div className="aili-dimgrid">
          {Object.entries(DIM_AILI).map(([k, v]) => {
            const sc = perDim[k], dp = Math.round(sc / v.max * 100)
            return (
              <div className="aili-dimcard" key={k} style={{ background: v.bg, borderColor: v.bd }}>
                <div className="aili-dimtop"><b style={{ color: v.color }}>{k}: {v.label}</b><span style={{ color: v.color, fontWeight: 800 }}>{sc}/{v.max}</span></div>
                <div className="aili-dimbar"><div style={{ width: `${dp}%`, background: v.color }} /></div>
                <div className="aili-dimdesc">{dp}% — {v.desc[lang] || v.desc.id}</div>
              </div>
            )
          })}
        </div>
        <div className="learn-sub-h">{C.recap}</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="aili-table">
            <thead><tr>{C.th.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {SOAL_AILI.map((q, i) => {
                const b = ans[i] === q.jwb
                return (
                  <tr key={i}>
                    <td>{q.no}</td><td>{q.dim}</td><td>{q.bloom}</td>
                    <td style={{ textAlign: 'center' }}>{ans[i] != null ? 'ABCD'[ans[i]] : '–'}</td>
                    <td style={{ textAlign: 'center' }}>{'ABCD'[q.jwb]}</td>
                    <td><span className={b ? 'aili-b' : 'aili-s'}>{b ? '✓' : '✗'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="learn-sub-h">{C.interpH}</div>
        <div className="aili-interp">
          {C.interp.map((line, i) => <span key={i}>{line}<br /></span>)}
        </div>
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={restart}>{C.restart}</button>
      </div>
    )
  }

  const s = Q[cur], d = DIM_AILI[s.dim], a = ans[cur]
  return (
    <>
      <div className="card learn-card">
        <h4 className="learn-h">{C.title}</h4>
        <p className="learn-p">{C.ctx}</p>
        <div className="aili-prog-top"><span className="learn-note" style={{ margin: 0 }}>{C.progress}</span><span className="aili-prog-num">{cur + 1} / {Q.length}</span></div>
        <div className="aili-bar"><div className="aili-bar-fill" style={{ width: `${(cur + 1) / Q.length * 100}%` }} /></div>
        <div className="aili-dots">
          {Object.entries(DIM_AILI).map(([k, v]) => (
            <span key={k} className="aili-dot" style={{ background: v.bg, color: v.color, borderColor: v.bd }}>{k} ({v.max})</span>
          ))}
        </div>
      </div>

      <div className="card learn-card">
        <div className="aili-qhead">
          <div className="aili-num" style={{ background: d.color }}>{s.no}</div>
          <div>
            <span className="aili-dim" style={{ background: d.bg, color: d.color, borderColor: d.bd }}>{s.dim}: {d.label}</span>
            <div className="aili-bloom">{s.bloom}</div>
          </div>
        </div>
        <div className="aili-q">{s.teks}</div>
        <div className="aili-opts">
          {s.opts.map((o, j) => {
            let cls = 'aili-opt'
            if (a != null) { if (j === s.jwb) cls += ' correct'; else if (j === a) cls += ' wrong' }
            return (
              <button key={j} className={cls} disabled={a != null} onClick={() => pilih(j)}>
                <span className="aili-letter">{'ABCD'[j]}</span><span>{o}</span>
              </button>
            )
          })}
        </div>
        {a != null && <div className={`aili-fb ${a === s.jwb ? 'ok' : 'no'}`}>{a === s.jwb ? C.ok : C.no}{s.fb}</div>}
        <div className="aili-nav">
          <button className="btn btn-ghost" style={{ width: 'auto' }} disabled={cur === 0} onClick={() => go(-1)}>{C.prev}</button>
          {cur < Q.length - 1
            ? <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => go(1)}>{C.next}</button>
            : <button className="btn btn-mint" style={{ width: 'auto' }} onClick={() => setShowResult(true)}>{C.see}</button>}
        </div>
      </div>
    </>
  )
}

export default function Belajar({ lang }) {
  const t = L[lang] || L.id
  const gloss = GLOSS[lang] || GLOSS.id
  const [teacher, setTeacher] = useState(false)

  return (
    <section className="section" id="belajar">
      <div className="section-head"><span className="ic">🎓</span><h3>{t.title}</h3></div>
      <p className="section-sub">{t.sub}</p>

      {/* Tautan lompat — halaman ini panjang, terutama di ponsel */}
      <nav className="learn-nav" aria-label={t.navHead}>
        <span className="learn-nav-lbl">{t.navHead}</span>
        <div className="learn-nav-list">
          {t.nav.map(([id, label]) => (
            <a key={id} href={`#bg-${id}`} className="learn-nav-a">{label}</a>
          ))}
        </div>
      </nav>

      {/* Computational Thinking / step-explainer */}
      <div className="card learn-card" id="bg-ct">
        <h4 className="learn-h">{t.ctHead}</h4>
        <p className="learn-p">{t.ctSub}</p>
        <div className="ct-grid">
          {t.ct.map(([k, d], i) => (
            <div className="ct-item" key={i}>
              <div className="ct-n">{i + 1}</div>
              <div><b>{k}</b><p>{d}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="learn-grid" id="bg-dasar">
        <HashPlayground t={t} />
        <EntropyLab t={t} />
      </div>

      <div id="bg-blockchain"><LabBlockchain lang={lang} /></div>

      <div id="bg-konvolusi"><LabKonvolusi lang={lang} /></div>

      {/* Grad-CAM guide */}
      <div className="card learn-card" id="bg-cam">
        <h4 className="learn-h">{t.camHead}</h4>
        <p className="learn-p">{t.camSub}</p>
        <ul className="learn-ul">{t.camTips.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>

      <div id="bg-kuis"><QuizAILI lang={lang} /></div>

      {/* Glossary */}
      <div className="card learn-card" id="bg-gloss">
        <h4 className="learn-h">{t.glossHead}</h4>
        {gloss.map(([term, def], i) => (
          <details className="gloss" key={i}>
            <summary>{term}</summary>
            <p>{def}</p>
          </details>
        ))}
      </div>

      {/* Teacher mode */}
      <button className="btn btn-ghost" onClick={() => setTeacher(v => !v)} style={{ maxWidth: 240 }}>
        {teacher ? t.teacherHide : t.teacherBtn}
      </button>
      {teacher && (
        <div className="card learn-card" style={{ marginTop: 14 }}>
          <h4 className="learn-h">{t.teacherHead}</h4>
          <b className="learn-sub-h">{t.objHead}</b>
          <ul className="learn-ul">{t.objs.map((o, i) => <li key={i}>{o}</li>)}</ul>
          <b className="learn-sub-h">{t.lkpdHead}</b>
          <ol className="learn-ul">{t.lkpd.map((o, i) => <li key={i}>{o}</li>)}</ol>
          <b className="learn-sub-h">{t.asesHead}</b>
          <p className="learn-p">{t.ases}</p>
        </div>
      )}
    </section>
  )
}
