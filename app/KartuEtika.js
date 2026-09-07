'use client'

// ============================================================
// Kartu Dilema Etika — dimensi AIL4 (AI Ethics)
// Selama ini AIL4 hanya DIUKUR lewat kuis; di sini mahasiswa MENGALAMINYA.
// Prinsip: TIDAK ADA skor benar/salah. Setiap posisi punya alasan sah.
// Mahasiswa wajib memilih sikap DAN menuliskan alasannya sebelum sudut
// pandang pemangku kepentingan lain dibuka — supaya tidak bias belakangan.
// ============================================================
import { useState } from 'react'

const KARTU = {
  id: [
    {
      kode: 'AIL4-1', tajuk: 'Model yang hanya mengenal satu daerah',
      skenario: 'Model kalian dilatih dari citra kopi lereng Ijen. Sebuah koperasi di Toraja ingin memakainya sekarang juga karena tidak punya alat lain, padahal karakter biji kopi di sana berbeda dan akurasinya kemungkinan besar turun.',
      tanya: 'Bolehkah sistem itu dipakai di Toraja?',
      opsi: [
        'Boleh, asalkan keterbatasannya dinyatakan terbuka',
        'Belum boleh sampai ada data dari Toraja',
        'Boleh, tetapi hasilnya tidak boleh dipakai menentukan harga',
      ],
      sudut: [
        ['Petani Toraja', 'Kami butuh alat sekarang. Menunggu data baru berarti bertahun-tahun tanpa apa-apa.'],
        ['Pengembang', 'Kalau salah, nama sistem kami yang rusak — padahal kami sudah memperingatkan.'],
        ['Pembeli', 'Saya membayar berdasarkan sertifikat. Kalau akurasinya berbeda antar-daerah, sertifikatnya jadi tidak setara.'],
        ['Regulator', 'Standar mutu harus berlaku sama. Alat yang akurasinya bergantung daerah menyulitkan penegakan standar.'],
      ],
      renung: 'Menahan teknologi juga punya biaya. Pertanyaannya bukan "aman atau tidak", melainkan siapa yang menanggung risiko dan apakah mereka tahu sedang menanggungnya.',
    },
    {
      kode: 'AIL4-2', tajuk: 'Harga ditentukan, alasannya tidak dipahami',
      skenario: 'Seorang eksportir memakai grade dari sistem untuk menetapkan harga beli. Pak Ramli protes karena kopinya dinilai Grade B, sementara ia merasa mutunya sama dengan panen sebelumnya yang Grade A. Sistem menampilkan Grad-CAM, tetapi ia tidak memahaminya.',
      tanya: 'Seberapa jauh sistem wajib menjelaskan keputusannya?',
      opsi: [
        'Cukup tampilkan Grad-CAM dan probabilitas — itu sudah transparan',
        'Harus ada penjelasan bahasa awam dan hak mengajukan banding ke penilai manusia',
        'Grade dari AI hanya boleh jadi masukan; keputusan akhir tetap di tangan manusia',
      ],
      sudut: [
        ['Pak Ramli', 'Saya tidak menuntut rahasia teknis. Saya hanya ingin tahu bagian mana dari kopi saya yang dianggap kurang.'],
        ['Eksportir', 'Kalau setiap penilaian bisa dibanding, gunanya otomatisasi hilang dan biayanya kembali membengkak.'],
        ['Pengembang', 'Kami sudah menyediakan peta panas dan probabilitas. Menerjemahkannya ke bahasa awam bukan pekerjaan sepele.'],
        ['Konsumen', 'Saya ingin yakin label di kemasan berarti sesuatu, bukan sekadar keluaran mesin yang tak terperiksa.'],
      ],
      renung: 'Transparansi teknis dan transparansi yang dapat dipahami adalah dua hal berbeda. Menampilkan angka tidak sama dengan memberi penjelasan.',
    },
    {
      kode: 'AIL4-3', tajuk: 'Foto yang diam-diam menjadi data latih',
      skenario: 'Agar model membaik, tim ingin menyimpan seluruh foto yang diunggah petani beserta lokasi kebunnya. Tidak ada yang dirugikan secara langsung, dan modelnya akan lebih akurat untuk semua orang.',
      tanya: 'Bolehkah dilakukan, dan dengan syarat apa?',
      opsi: [
        'Boleh, asalkan petani menyetujuinya saat mengunggah',
        'Boleh, tetapi lokasi kebun harus dihapus atau dikaburkan',
        'Tidak boleh; foto milik petani dan cukup dipakai sekali',
      ],
      sudut: [
        ['Petani', 'Lokasi kebun itu informasi usaha saya. Pesaing bisa tahu di mana kopi terbaik tumbuh.'],
        ['Peneliti', 'Tanpa data baru, model berhenti membaik dan justru merugikan pengguna berikutnya.'],
        ['Pesaing', 'Kalau data lokasi bocor, saya bisa memetakan sentra produksi tanpa usaha apa pun.'],
        ['Regulator', 'Persetujuan yang tersembunyi di dalam syarat dan ketentuan panjang bukanlah persetujuan yang bermakna.'],
      ],
      renung: 'Persetujuan yang sah menuntut pengguna benar-benar paham apa yang mereka setujui — bukan sekadar mencentang kotak.',
    },
    {
      kode: 'AIL4-4', tajuk: 'Sertifikat keliru yang tidak bisa dihapus',
      skenario: 'Sistem memberi Grade A pada satu lot kopi yang ternyata cacat. Pembeli merugi. Sertifikatnya sudah tercatat permanen di blockchain dan menurut rancangannya memang tidak dapat diubah maupun dihapus.',
      tanya: 'Siapa yang bertanggung jawab, dan apa yang harus dilakukan terhadap sertifikat itu?',
      opsi: [
        'Pengembang, karena modelnya yang keliru menilai',
        'Petani, karena dialah yang menandatangani dan menerbitkan sertifikat',
        'Tanggung jawab bersama, dan sistem wajib punya mekanisme pembatalan',
      ],
      sudut: [
        ['Petani', 'Saya hanya memotret dan menekan tombol. Saya tidak membuat modelnya dan tidak paham cara kerjanya.'],
        ['Pembeli', 'Saya percaya pada sertifikat itu. Kalau tidak ada yang bertanggung jawab, sertifikatnya tidak berarti apa-apa.'],
        ['Pengembang', 'Kami sudah mencantumkan tingkat keyakinan dan entropi. Keputusan menerbitkan tetap di tangan pengguna.'],
        ['Ahli hukum', 'Sifat tidak-dapat-diubah melindungi dari pemalsuan, tetapi juga mengunci kekeliruan. Keduanya perlu dipikirkan bersama.'],
      ],
      renung: 'Sifat immutable yang menjadi kekuatan sistem ini sekaligus menjadi bebannya. Merancang mekanisme pembatalan tanpa merusak jaminan keaslian adalah persoalan yang belum selesai.',
    },
    {
      kode: 'AIL4-5', tajuk: 'Data dari yang kecil, untung bagi yang besar',
      skenario: 'Ribuan foto dari petani kecil dipakai melatih model. Model itu kemudian dilisensikan ke perusahaan besar dan menghasilkan pendapatan. Para petani tidak menerima apa pun selain layanan klasifikasi gratis.',
      tanya: 'Apakah pengaturan ini adil?',
      opsi: [
        'Adil, karena petani menerima manfaat berupa layanan gratis',
        'Tidak adil; petani berhak atas bagian dari pendapatan',
        'Model yang lahir dari data komunitas seharusnya tetap terbuka bagi komunitas itu',
      ],
      sudut: [
        ['Petani', 'Layanan gratis itu bernilai kecil dibanding pendapatan yang dihasilkan dari data kami.'],
        ['Pengembang', 'Data mentah tidak bernilai tanpa kerja pelatihan, penyetelan, dan pemeliharaan yang kami lakukan.'],
        ['Investor', 'Tanpa prospek pendapatan, tidak ada yang mau membiayai pengembangan sejak awal.'],
        ['Komunitas', 'Nilai itu lahir dari kerja bersama. Pembagian manfaatnya juga harus dibicarakan bersama.'],
      ],
      renung: 'Keadilan data tidak selalu berarti pembagian uang. Bisa juga berupa persetujuan, kepemilikan bersama, atau jaminan akses selamanya.',
    },
    {
      kode: 'AIL4-6', tajuk: 'Tiga penilai mutu dan sebuah sistem',
      skenario: 'Sebuah koperasi mempertimbangkan mengganti tiga penilai mutu manusia dengan sistem ini. Penghematannya besar dan bisa dibagikan kepada seluruh anggota. Ketiga penilai itu sudah bekerja puluhan tahun dan pengetahuan mereka tidak tertulis di mana pun.',
      tanya: 'Haruskah koperasi menggantinya?',
      opsi: [
        'Ganti — efisiensi menguntungkan seluruh anggota koperasi',
        'Jangan ganti; jadikan sistem sebagai alat bantu penilai, bukan pengganti',
        'Ganti bertahap, disertai pelatihan ulang bagi ketiga penilai',
      ],
      sudut: [
        ['Penilai mutu', 'Saya mengenali cacat yang tidak terlihat di foto — dari aroma, dari suara biji saat digenggam.'],
        ['Pengurus koperasi', 'Penghematannya nyata dan bisa langsung menaikkan harga beli dari petani anggota.'],
        ['Petani anggota', 'Saya ingin harga lebih baik, tetapi ketiga orang itu tetangga saya sendiri.'],
        ['Pembeli', 'Saya butuh penilaian yang konsisten dan bisa diaudit, apa pun sumbernya.'],
      ],
      renung: 'Pengetahuan yang tidak tertulis akan hilang bersama orangnya. Pertanyaannya bukan sekadar untung atau rugi, melainkan apa yang lenyap tanpa kita sadari.',
    },
  ],
  en: [
    {
      kode: 'AIL4-1', tajuk: 'A model that only knows one region',
      skenario: 'Your model was trained on coffee images from the slopes of Mount Ijen. A cooperative in Toraja wants to use it right away because they have no other tool, even though beans there differ and accuracy will most likely drop.',
      tanya: 'Should the system be used in Toraja?',
      opsi: ['Yes, as long as its limitations are stated openly', 'Not until data from Toraja exists', 'Yes, but its output must not be used to set prices'],
      sudut: [
        ['Toraja farmer', 'We need a tool now. Waiting for new data means years with nothing at all.'],
        ['Developer', 'If it fails, our system takes the blame — even though we warned them.'],
        ['Buyer', 'I pay based on the certificate. If accuracy varies by region, certificates are no longer equivalent.'],
        ['Regulator', 'Quality standards must apply equally. A tool whose accuracy depends on region makes enforcement difficult.'],
      ],
      renung: 'Withholding technology also has a cost. The question is not "safe or unsafe" but who carries the risk, and whether they know they are carrying it.',
    },
    {
      kode: 'AIL4-2', tajuk: 'A price decided, a reason not understood',
      skenario: 'An exporter uses the system grade to set purchase prices. Pak Ramli objects because his coffee was graded B, while he believes its quality matches his previous Grade A harvest. The system shows Grad-CAM, but he cannot read it.',
      tanya: 'How far must the system explain its decision?',
      opsi: ['Grad-CAM and probabilities are enough — that is already transparent', 'There must be a plain-language explanation and a right to appeal to a human grader', 'The AI grade may only be an input; the final decision stays with a human'],
      sudut: [
        ['Pak Ramli', 'I am not asking for technical secrets. I only want to know which part of my coffee was found lacking.'],
        ['Exporter', 'If every grade can be appealed, the point of automation disappears and costs climb back.'],
        ['Developer', 'We already provide a heatmap and probabilities. Translating that into plain language is no small task.'],
        ['Consumer', 'I want the label to mean something, not just an unchecked machine output.'],
      ],
      renung: 'Technical transparency and understandable transparency are two different things. Showing numbers is not the same as giving an explanation.',
    },
    {
      kode: 'AIL4-3', tajuk: 'Photos that quietly became training data',
      skenario: 'To improve the model, the team wants to keep every photo farmers upload along with their farm locations. Nobody is directly harmed, and the model will become more accurate for everyone.',
      tanya: 'Is this acceptable, and under what conditions?',
      opsi: ['Yes, provided farmers agree at upload time', 'Yes, but farm locations must be removed or blurred', 'No; the photos belong to the farmers and should be used once'],
      sudut: [
        ['Farmer', 'My farm location is business information. Competitors could learn where the best coffee grows.'],
        ['Researcher', 'Without new data the model stops improving, which harms future users.'],
        ['Competitor', 'If location data leaks, I can map production centres with no effort at all.'],
        ['Regulator', 'Consent buried in long terms and conditions is not meaningful consent.'],
      ],
      renung: 'Valid consent requires that users genuinely understand what they are agreeing to — not merely that they ticked a box.',
    },
    {
      kode: 'AIL4-4', tajuk: 'A wrong certificate that cannot be deleted',
      skenario: 'The system awarded Grade A to a lot that turned out to be defective. The buyer lost money. The certificate is permanently recorded on the blockchain and by design cannot be altered or removed.',
      tanya: 'Who is responsible, and what should be done about that certificate?',
      opsi: ['The developer, because the model judged wrongly', 'The farmer, because they signed and issued the certificate', 'Shared responsibility, and the system needs a revocation mechanism'],
      sudut: [
        ['Farmer', 'I only took a photo and pressed a button. I did not build the model and do not understand how it works.'],
        ['Buyer', 'I trusted that certificate. If nobody is accountable, the certificate means nothing.'],
        ['Developer', 'We display confidence and entropy. The decision to issue remains with the user.'],
        ['Legal expert', 'Immutability protects against forgery, but it also locks in mistakes. Both must be designed for.'],
      ],
      renung: 'The immutability that gives this system its strength is also its burden. Designing revocation without destroying the authenticity guarantee is an unsolved problem.',
    },
    {
      kode: 'AIL4-5', tajuk: 'Data from the small, profit for the large',
      skenario: 'Thousands of photos from smallholder farmers trained the model. That model is then licensed to a large company and generates revenue. The farmers receive nothing beyond free classification.',
      tanya: 'Is this arrangement fair?',
      opsi: ['Fair, because farmers receive a free service in return', 'Unfair; farmers deserve a share of the revenue', 'A model born of community data should remain open to that community'],
      sudut: [
        ['Farmer', 'A free service is small compared with the revenue our data generates.'],
        ['Developer', 'Raw data is worthless without the training, tuning and maintenance we perform.'],
        ['Investor', 'Without the prospect of revenue, nobody would fund the development in the first place.'],
        ['Community', 'The value came from joint effort. How it is shared should also be decided jointly.'],
      ],
      renung: 'Data justice does not always mean sharing money. It can also mean consent, joint ownership, or a guarantee of permanent access.',
    },
    {
      kode: 'AIL4-6', tajuk: 'Three graders and a system',
      skenario: 'A cooperative is considering replacing three human quality graders with this system. The savings are large and could be shared among all members. The three graders have worked for decades and their knowledge is written down nowhere.',
      tanya: 'Should the cooperative replace them?',
      opsi: ['Replace them — efficiency benefits every member', 'Do not replace; make the system an aid to the graders, not a substitute', 'Replace gradually, with retraining for the three graders'],
      sudut: [
        ['Quality grader', 'I catch defects a photo cannot show — from the aroma, from the sound of beans in my hand.'],
        ['Cooperative board', 'The savings are real and could immediately raise the price we pay members.'],
        ['Member farmer', 'I want a better price, but those three are my own neighbours.'],
        ['Buyer', 'I need grading that is consistent and auditable, whatever its source.'],
      ],
      renung: 'Knowledge that is never written down disappears with the person. The question is not only profit or loss, but what vanishes without our noticing.',
    },
  ],
}

const CH = {
  id: {
    title: '⚖️ Kartu Dilema Etika AI — Dimensi AIL4',
    sub: 'Enam situasi nyata dari sistem ini sendiri. Tidak ada jawaban benar atau salah, dan tidak ada skor — yang dinilai adalah kualitas alasanmu.',
    intro: 'Etika AI biasanya diajarkan sebagai daftar prinsip yang harus dihafal. Di sini tidak. Kamu akan diminta mengambil sikap pada situasi yang setiap pilihannya punya alasan sah, menuliskan alasanmu, baru kemudian mendengar suara pihak-pihak yang terdampak. Sering kali alasan yang tadinya terasa jelas menjadi lebih rumit setelah itu.',
    tanpaSkor: '📌 Lab ini sengaja TIDAK memberi skor. Kuis AI Literacy sudah mengukur pemahamanmu; bagian ini melatih pertimbanganmu.',
    kartuKe: (n, t) => `Kartu ${n} dari ${t}`,
    skenarioHead: 'Situasi', tanyaHead: 'Pertanyaan',
    opsiHead: 'Ambil sikap — pilih satu',
    alasanHead: 'Mengapa kamu memilih itu?',
    phAlasan: 'Saya memilih itu karena…',
    kunci: '🔒 Kunci Sikap & Lihat Sudut Pandang Lain',
    kunciNote: 'Sudut pandang pihak lain sengaja disembunyikan sampai kamu mengambil sikap — supaya kamu berpikir sendiri lebih dulu.',
    belum: 'Pilih salah satu sikap dan tuliskan alasanmu terlebih dahulu.',
    sudutHead: '👥 Bagaimana pihak lain memandangnya',
    renungHead: '💭 Bahan renungan',
    tinjau: 'Setelah membaca sudut pandang di atas, apakah sikapmu berubah? Mengapa?',
    phTinjau: 'Sikap saya tetap/berubah karena…',
    sebelum: '← Kartu sebelumnya', sesudah: 'Kartu berikutnya →',
    majuHead: 'Kemajuan',
    selesaiHead: '✅ Kamu telah menyelesaikan seluruh kartu',
    selesaiTxt: 'Unduh atau salin ringkasan sikapmu untuk dikumpulkan dan didiskusikan di kelas.',
    diskusiHead: '🗣️ Untuk diskusi kelompok',
    diskusi: 'Bandingkan sikapmu dengan teman sekelompok. Bila berbeda pada kartu yang sama, cari tahu asumsi mana yang membuat kalian berbeda — biasanya bukan faktanya yang berbeda, melainkan siapa yang kalian dahulukan.',
    nama: 'Nama', nim: 'NIM',
    phNama: 'Nama sesuai daftar hadir', phNim: 'Contoh: 210210102001',
    unduh: '⬇️ Unduh Sikapku (HTML)', salin: '📋 Salin Sikapku', reset: '↩️ Kosongkan',
    tersalin: '✓ Tersalin! Tempel di Google Classroom atau WhatsApp.',
    gagalSalin: 'Gagal menyalin. Pakai tombol unduh saja.',
    belumCukup: 'Kunci sikapmu pada minimal satu kartu terlebih dahulu.',
    docJudul: 'Kartu Dilema Etika AI — Ringkasan Sikap',
    docSub: 'Dimensi AIL4 · Klasifikasi Kopi Arabika berbasis CNN & Blockchain · Universitas Jember',
    docWaktu: 'Waktu pengerjaan', sikap: 'Sikap', alasan: 'Alasan', peninjauan: 'Setelah membaca sudut pandang lain',
  },
  en: {
    title: '⚖️ AI Ethics Dilemma Cards — AIL4 Dimension',
    sub: 'Six real situations drawn from this very system. There are no right or wrong answers and no score — what matters is the quality of your reasoning.',
    intro: 'AI ethics is usually taught as a list of principles to memorise. Not here. You will take a position on situations where every option has a legitimate case, write down your reasoning, and only then hear from the people affected. Reasoning that felt obvious often becomes more complicated afterwards.',
    tanpaSkor: '📌 This lab deliberately gives NO score. The AI Literacy quiz already measures your understanding; this part trains your judgement.',
    kartuKe: (n, t) => `Card ${n} of ${t}`,
    skenarioHead: 'Situation', tanyaHead: 'Question',
    opsiHead: 'Take a position — pick one',
    alasanHead: 'Why did you choose that?',
    phAlasan: 'I chose it because…',
    kunci: '🔒 Lock Position & Reveal Other Perspectives',
    kunciNote: 'Other perspectives stay hidden until you take a position — so that you think for yourself first.',
    belum: 'Please pick a position and write your reasoning first.',
    sudutHead: '👥 How others see it',
    renungHead: '💭 Something to sit with',
    tinjau: 'After reading those perspectives, did your position change? Why?',
    phTinjau: 'My position stayed/changed because…',
    sebelum: '← Previous card', sesudah: 'Next card →',
    majuHead: 'Progress',
    selesaiHead: '✅ You have completed every card',
    selesaiTxt: 'Download or copy a summary of your positions to submit and discuss in class.',
    diskusiHead: '🗣️ For group discussion',
    diskusi: 'Compare your positions with your group. Where you differ on the same card, find which assumption separates you — usually it is not the facts that differ, but whose interests you put first.',
    nama: 'Name', nim: 'Student ID',
    phNama: 'Name as on the attendance list', phNim: 'e.g. 210210102001',
    unduh: '⬇️ Download My Positions (HTML)', salin: '📋 Copy My Positions', reset: '↩️ Clear',
    tersalin: '✓ Copied! Paste it into Google Classroom or WhatsApp.',
    gagalSalin: 'Copy failed. Please use the download button instead.',
    belumCukup: 'Lock your position on at least one card first.',
    docJudul: 'AI Ethics Dilemma Cards — Summary of Positions',
    docSub: 'AIL4 dimension · CNN & Blockchain-based Arabica Coffee Classification · University of Jember',
    docWaktu: 'Completed at', sikap: 'Position', alasan: 'Reasoning', peninjauan: 'After reading other perspectives',
  },
}

export default function KartuEtika({ lang }) {
  const c = CH[lang] || CH.id
  const kartu = KARTU[lang] || KARTU.id
  const [i, setI] = useState(0)
  const [j, setJ] = useState(() => kartu.map(() => ({ pilih: -1, alasan: '', kunci: false, tinjau: '' })))
  const [nama, setNama] = useState(''); const [nim, setNim] = useState('')
  const [pesan, setPesan] = useState(''); const [salinOk, setSalinOk] = useState(null)

  const k = kartu[i]
  const d = j[i]
  const set = (patch) => setJ(p => p.map((x, n) => n === i ? { ...x, ...patch } : x))
  const jmlKunci = j.filter(x => x.kunci).length

  function kunci() {
    if (d.pilih < 0 || !d.alasan.trim()) { setPesan(c.belum); return }
    setPesan(''); set({ kunci: true })
  }

  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  function teks() {
    const L = [c.docJudul, c.docSub, '', `${c.nama}: ${nama || '-'}`, `${c.nim}: ${nim || '-'}`,
      `${c.docWaktu}: ${new Date().toLocaleString(lang === 'en' ? 'en-GB' : 'id-ID')}`, '']
    kartu.forEach((kk, n) => {
      const x = j[n]
      if (!x.kunci) return
      L.push(`[${kk.kode}] ${kk.tajuk}`)
      L.push(`${c.sikap}: ${kk.opsi[x.pilih]}`)
      L.push(`${c.alasan}: ${x.alasan}`)
      if (x.tinjau.trim()) L.push(`${c.peninjauan}: ${x.tinjau}`)
      L.push('')
    })
    return L.join('\n')
  }

  function html() {
    const blok = kartu.map((kk, n) => {
      const x = j[n]
      if (!x.kunci) return ''
      return `<h2>${esc(kk.kode)} — ${esc(kk.tajuk)}</h2>
<p class="sit">${esc(kk.skenario)}</p>
<table><tr><th>${esc(c.sikap)}</th><td>${esc(kk.opsi[x.pilih])}</td></tr>
<tr><th>${esc(c.alasan)}</th><td>${esc(x.alasan).replace(/\n/g, '<br>')}</td></tr>
${x.tinjau.trim() ? `<tr><th>${esc(c.peninjauan)}</th><td>${esc(x.tinjau).replace(/\n/g, '<br>')}</td></tr>` : ''}</table>`
    }).join('')
    return `<!doctype html><html lang="${lang === 'en' ? 'en' : 'id'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.docJudul)} — ${esc(nama)}</title>
<style>body{font-family:Georgia,serif;max-width:820px;margin:32px auto;padding:0 22px;color:#1a1a1a;line-height:1.65}
h1{font-size:21px;color:#1F3864;margin:0 0 4px}h2{font-size:15px;color:#1F3864;margin:26px 0 8px;border-bottom:2px solid #DEEAF6;padding-bottom:5px}
.sub{color:#666;font-size:13px;margin:0 0 18px}.sit{font-size:13px;color:#444;background:#f8fafc;padding:10px 12px;border-radius:6px}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:13.5px}th,td{border:1px solid #cbd5e1;padding:8px 10px;text-align:left;vertical-align:top}
th{background:#f2f6fb;width:32%;font-weight:700}@media print{body{margin:0}}</style></head><body>
<h1>${esc(c.docJudul)}</h1><p class="sub">${esc(c.docSub)}</p>
<table><tr><th>${esc(c.nama)}</th><td>${esc(nama || '-')}</td></tr><tr><th>${esc(c.nim)}</th><td>${esc(nim || '-')}</td></tr>
<tr><th>${esc(c.docWaktu)}</th><td>${esc(new Date().toLocaleString(lang === 'en' ? 'en-GB' : 'id-ID'))}</td></tr></table>
${blok}</body></html>`
  }

  function unduh() {
    if (jmlKunci === 0) { setPesan(c.belumCukup); return }
    setPesan('')
    const blob = new Blob([html()], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Etika-AIL4-${(nim || 'sikap').replace(/[^\w-]/g, '')}-${new Date().toISOString().slice(0, 10)}.html`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  async function salin() {
    if (jmlKunci === 0) { setPesan(c.belumCukup); return }
    setPesan('')
    try { await navigator.clipboard.writeText(teks()); setSalinOk(true) }
    catch (_) { setSalinOk(false) }
    setTimeout(() => setSalinOk(null), 5000)
  }

  return (
    <div className="card learn-card">
      <h4 className="learn-h">{c.title}</h4>
      <p className="learn-p">{c.sub}</p>
      <div className="bc-intro">{c.intro}</div>
      <p className="et-noskor">{c.tanpaSkor}</p>

      <div className="lkpd-id" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: 12 }}>
        <label>{c.nama}<input value={nama} placeholder={c.phNama} onChange={e => setNama(e.target.value)} /></label>
        <label>{c.nim}<input value={nim} placeholder={c.phNim} onChange={e => setNim(e.target.value)} /></label>
      </div>

      {/* Kemajuan */}
      <div className="et-maju">
        <span>{c.majuHead}: <b>{jmlKunci}/{kartu.length}</b></span>
        <div className="et-titik">
          {kartu.map((_, n) => (
            <button key={n} className={`et-dot ${n === i ? 'kini' : ''} ${j[n].kunci ? 'isi' : ''}`}
              onClick={() => { setI(n); setPesan('') }} aria-label={`Kartu ${n + 1}`}>{n + 1}</button>
          ))}
        </div>
      </div>

      {/* Kartu */}
      <div className="et-kartu">
        <div className="et-head">
          <span className="et-kode">{k.kode}</span>
          <span className="et-nomor">{c.kartuKe(i + 1, kartu.length)}</span>
        </div>
        <h5 className="et-tajuk">{k.tajuk}</h5>

        <b className="learn-sub-h">{c.skenarioHead}</b>
        <p className="et-skenario">{k.skenario}</p>

        <b className="learn-sub-h">{c.tanyaHead}</b>
        <p className="et-tanya">{k.tanya}</p>

        <b className="learn-sub-h">{c.opsiHead}</b>
        <div className="et-opsi">
          {k.opsi.map((o, n) => (
            <button key={n} className={`et-pilih ${d.pilih === n ? 'on' : ''}`} disabled={d.kunci}
              onClick={() => set({ pilih: n })}>
              <span className="et-abjad">{String.fromCharCode(65 + n)}</span>{o}
            </button>
          ))}
        </div>

        <label className="lkpd-lbl">{c.alasanHead}</label>
        <textarea className="lkpd-input" rows={3} value={d.alasan} disabled={d.kunci}
          placeholder={c.phAlasan} onChange={e => set({ alasan: e.target.value })} />

        {!d.kunci ? (
          <>
            <button className="btn btn-primary" style={{ maxWidth: 340, marginTop: 10 }} onClick={kunci}>{c.kunci}</button>
            <p className="learn-note">{c.kunciNote}</p>
            {pesan && <p className="lkpd-warn">{pesan}</p>}
          </>
        ) : (
          <>
            <div className="et-sudut">
              <b className="learn-sub-h">{c.sudutHead}</b>
              {k.sudut.map(([siapa, kata], n) => (
                <div className="et-suara" key={n}>
                  <b>{siapa}</b>
                  <p>“{kata}”</p>
                </div>
              ))}
            </div>
            <div className="et-renung">
              <b>{c.renungHead}</b>
              <p>{k.renung}</p>
            </div>
            <label className="lkpd-lbl">{c.tinjau}</label>
            <textarea className="lkpd-input" rows={3} value={d.tinjau} placeholder={c.phTinjau}
              onChange={e => set({ tinjau: e.target.value })} />
          </>
        )}

        <div className="et-nav">
          <button className="btn btn-ghost" disabled={i === 0} onClick={() => { setI(i - 1); setPesan('') }}>{c.sebelum}</button>
          <button className="btn btn-ghost" disabled={i === kartu.length - 1} onClick={() => { setI(i + 1); setPesan('') }}>{c.sesudah}</button>
        </div>
      </div>

      {jmlKunci === kartu.length && (
        <div className="et-selesai">
          <b>{c.selesaiHead}</b>
          <p>{c.selesaiTxt}</p>
        </div>
      )}

      <div className="kv-catatan">
        <b className="learn-sub-h">{c.diskusiHead}</b>
        <p className="learn-p" style={{ marginBottom: 0 }}>{c.diskusi}</p>
      </div>

      {salinOk === true && <p className="lkpd-ok">{c.tersalin}</p>}
      {salinOk === false && <p className="lkpd-warn">{c.gagalSalin}</p>}
      <div className="lkpd-aksi">
        <button className="btn btn-primary" onClick={unduh}>{c.unduh}</button>
        <button className="btn btn-ghost" onClick={salin}>{c.salin}</button>
        <button className="btn btn-ghost" onClick={() => { setJ(kartu.map(() => ({ pilih: -1, alasan: '', kunci: false, tinjau: '' }))); setI(0); setPesan('') }}>{c.reset}</button>
      </div>
    </div>
  )
}
