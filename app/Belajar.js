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

const QUIZ = {
  id: [
    ['Apa fungsi utama CNN dalam sistem ini?', ['Menyimpan data di blockchain', 'Mengenali pola visual biji kopi', 'Membuat dompet kripto'], 1],
    ['Jika 1 huruf input hash diubah, apa yang terjadi pada hash SHA-256?', ['Berubah sedikit', 'Tidak berubah', 'Berubah total'], 2],
    ['Entropy yang TINGGI menandakan model...', ['Sangat yakin', 'Ragu / tidak yakin', 'Sudah benar'], 1],
    ['Mengapa data di blockchain disebut immutable?', ['Karena gratis', 'Karena tidak bisa diubah setelah dicatat', 'Karena cepat'], 1],
    ['Grad-CAM berguna untuk...', ['Mempercantik foto', 'Menjelaskan bagian foto yang dilihat AI', 'Menghapus latar'], 1],
  ],
  en: [
    ['What is the main role of the CNN in this system?', ['Store data on the blockchain', 'Recognize visual bean patterns', 'Create a crypto wallet'], 1],
    ['If 1 input character changes, what happens to the SHA-256 hash?', ['Changes slightly', 'No change', 'Changes completely'], 2],
    ['HIGH entropy indicates the model is...', ['Very confident', 'Uncertain', 'Always correct'], 1],
    ['Why is blockchain data called immutable?', ['Because it is free', 'Because it cannot be changed once recorded', 'Because it is fast'], 1],
    ['Grad-CAM is useful for...', ['Beautifying photos', 'Explaining which photo regions the AI looked at', 'Removing the background'], 1],
  ],
}

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

function Quiz({ t, qs }) {
  const [ans, setAns] = useState({})
  const done = Object.keys(ans).length === qs.length
  const score = qs.reduce((s, q, i) => s + (ans[i] === q[2] ? 1 : 0), 0)
  return (
    <div className="card learn-card">
      <h4 className="learn-h">{t.quizHead}</h4>
      <p className="learn-p">{t.quizSub}</p>
      {qs.map((q, i) => (
        <div className="quiz-q" key={i}>
          <div className="quiz-ask">{i + 1}. {q[0]}</div>
          <div className="quiz-opts">
            {q[1].map((opt, j) => {
              const picked = ans[i] === j
              const cls = picked ? (j === q[2] ? 'correct' : 'wrong') : (ans[i] != null && j === q[2] ? 'correct' : '')
              return (
                <button key={j} className={`quiz-opt ${cls}`} disabled={ans[i] != null}
                  onClick={() => setAns(a => ({ ...a, [i]: j }))}>{opt}</button>
              )
            })}
          </div>
          {ans[i] != null && (
            <div className={`quiz-fb ${ans[i] === q[2] ? 'ok' : 'no'}`}>
              {ans[i] === q[2] ? '✓ ' + t.correct : '✗ ' + t.wrong}
            </div>
          )}
        </div>
      ))}
      {done && (
        <div className="quiz-done">
          <div className="quiz-score">{t.quizDone}: <b>{score}/{qs.length}</b></div>
          {score === qs.length && <div className="learn-badge">{t.quizBadge}</div>}
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setAns({})}>{t.quizRetry}</button>
        </div>
      )}
    </div>
  )
}

export default function Belajar({ lang }) {
  const t = L[lang] || L.id
  const gloss = GLOSS[lang] || GLOSS.id
  const qs = QUIZ[lang] || QUIZ.id
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

      <Quiz t={t} qs={qs} />

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
