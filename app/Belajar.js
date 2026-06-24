'use client'

import { useState } from 'react'

// ============================================================
// Konten dwibahasa Pusat Belajar IPA (Web3 style, bukan LMS)
// ============================================================
const L = {
  id: {
    title: '🎓 Pusat Belajar IPA',
    sub: 'Pelajari AI, Machine Learning, CNN, Blockchain & Traceability langsung dari sistem yang berjalan — melatih computational thinking, AI literacy, dan keterampilan abad-21.',
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
    ['AI (Kecerdasan Buatan)', 'Sistem yang meniru kemampuan berpikir manusia untuk mengenali, memutuskan, atau memprediksi.'],
    ['Machine Learning', 'Cabang AI: mesin belajar pola dari data contoh, bukan diprogram aturan satu per satu.'],
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
    ['AI (Artificial Intelligence)', 'Systems that mimic human thinking to recognize, decide, or predict.'],
    ['Machine Learning', 'A branch of AI: machines learn patterns from example data instead of hand-coded rules.'],
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
  AIL1: { label: 'Know & Understand AI', max: 7, color: '#2563EB', bg: '#EFF6FF', bd: '#BFDBFE', desc: 'Memahami konsep dasar AI, cara kerja CNN, hash & blockchain dalam sistem sertifikasi kopi.' },
  AIL2: { label: 'Use & Apply AI',        max: 6, color: '#16A34A', bg: '#F0FDF4', bd: '#A7F3D0', desc: 'Menerapkan teknik AI/CNN & alur blockchain secara praktis untuk masalah nyata.' },
  AIL3: { label: 'Evaluate & Create AI',  max: 6, color: '#EA580C', bg: '#FFF7ED', bd: '#FED7AA', desc: 'Menganalisis & mengevaluasi kualitas model dan merancang sistem AI+blockchain yang tepat.' },
  AIL4: { label: 'AI Ethics',             max: 6, color: '#7C3AED', bg: '#F5F3FF', bd: '#DDD6FE', desc: 'Mengevaluasi isu etika, bias, privasi, transparansi & dampak sosial AI.' },
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

function ailiLevel(p) {
  if (p >= 85) return { t: 'Sangat Tinggi 🌟', cls: 'a' }
  if (p >= 70) return { t: 'Tinggi ✅', cls: 'b' }
  if (p >= 55) return { t: 'Sedang ⚠️', cls: 'c' }
  return { t: 'Rendah — Perlu Penguatan 📚', cls: 'd' }
}

function QuizAILI({ lang }) {
  const [cur, setCur] = useState(0)
  const [ans, setAns] = useState(Array(SOAL_AILI.length).fill(null))
  const [showResult, setShowResult] = useState(false)

  const pilih = (j) => setAns(a => { if (a[cur] != null) return a; const n = [...a]; n[cur] = j; return n })
  const go = (d) => setCur(c => Math.max(0, Math.min(SOAL_AILI.length - 1, c + d)))
  const restart = () => { setCur(0); setAns(Array(SOAL_AILI.length).fill(null)); setShowResult(false) }

  if (showResult) {
    const total = SOAL_AILI.reduce((s, q, i) => s + (ans[i] === q.jwb ? 1 : 0), 0)
    const pct = Math.round(total / SOAL_AILI.length * 100)
    const perDim = { AIL1: 0, AIL2: 0, AIL3: 0, AIL4: 0 }
    SOAL_AILI.forEach((q, i) => { if (ans[i] === q.jwb) perDim[q.dim]++ })
    const lv = ailiLevel(pct)
    return (
      <div className="card learn-card aili-result">
        <div className="aili-score">{total}/{SOAL_AILI.length}</div>
        <div className="aili-pct">{pct}% jawaban benar</div>
        <div className={`aili-level lv-${lv.cls}`}>{lv.t}</div>
        <div className="learn-sub-h">Skor per Dimensi AI Literacy</div>
        <div className="aili-dimgrid">
          {Object.entries(DIM_AILI).map(([k, v]) => {
            const sc = perDim[k], dp = Math.round(sc / v.max * 100)
            return (
              <div className="aili-dimcard" key={k} style={{ background: v.bg, borderColor: v.bd }}>
                <div className="aili-dimtop"><b style={{ color: v.color }}>{k}: {v.label}</b><span style={{ color: v.color, fontWeight: 800 }}>{sc}/{v.max}</span></div>
                <div className="aili-dimbar"><div style={{ width: `${dp}%`, background: v.color }} /></div>
                <div className="aili-dimdesc">{dp}% — {v.desc}</div>
              </div>
            )
          })}
        </div>
        <div className="learn-sub-h">Rekap Jawaban</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="aili-table">
            <thead><tr><th>No</th><th>Dim</th><th>Bloom</th><th>Anda</th><th>Kunci</th><th>Status</th></tr></thead>
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
        <div className="learn-sub-h">Interpretasi (AILI)</div>
        <div className="aili-interp">
          🌟 85–100% — Sangat Tinggi: mahir di semua dimensi.<br />
          ✅ 70–84% — Tinggi: paham baik, perkuat dimensi terlemah.<br />
          ⚠️ 55–69% — Sedang: dasar ada, perdalam konsep & etika AI.<br />
          📚 &lt;55% — Rendah: perlu pembelajaran lebih intensif.
        </div>
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={restart}>🔄 Ulangi Kuis dari Awal</button>
      </div>
    )
  }

  const s = SOAL_AILI[cur], d = DIM_AILI[s.dim], a = ans[cur]
  return (
    <>
      <div className="card learn-card">
        <h4 className="learn-h">🤖 Kuis AI Literacy (AILI) — 25 Soal</h4>
        <p className="learn-p">
          Konteks: CNN + Blockchain untuk sertifikasi Kopi Arabika Web3 · Framework Ng et al. (2021), 4 dimensi AI literacy.
          {lang === 'en' && ' (Soal disajikan dalam Bahasa Indonesia.)'}
        </p>
        <div className="aili-prog-top"><span className="learn-note" style={{ margin: 0 }}>Progress</span><span className="aili-prog-num">{cur + 1} / {SOAL_AILI.length}</span></div>
        <div className="aili-bar"><div className="aili-bar-fill" style={{ width: `${(cur + 1) / SOAL_AILI.length * 100}%` }} /></div>
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
        {a != null && <div className={`aili-fb ${a === s.jwb ? 'ok' : 'no'}`}>{a === s.jwb ? '✓ Benar! ' : '✗ Belum tepat. '}{s.fb}</div>}
        <div className="aili-nav">
          <button className="btn btn-ghost" style={{ width: 'auto' }} disabled={cur === 0} onClick={() => go(-1)}>← Sebelumnya</button>
          {cur < SOAL_AILI.length - 1
            ? <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => go(1)}>Selanjutnya →</button>
            : <button className="btn btn-mint" style={{ width: 'auto' }} onClick={() => setShowResult(true)}>🎯 Lihat Hasil</button>}
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

      {/* Computational Thinking / step-explainer */}
      <div className="card learn-card">
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

      <div className="learn-grid">
        <HashPlayground t={t} />
        <EntropyLab t={t} />
      </div>

      {/* Grad-CAM guide */}
      <div className="card learn-card">
        <h4 className="learn-h">{t.camHead}</h4>
        <p className="learn-p">{t.camSub}</p>
        <ul className="learn-ul">{t.camTips.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </div>

      <QuizAILI lang={lang} />

      {/* Glossary */}
      <div className="card learn-card">
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
