# ClawTrade — Project Documentation

## 1. Project Overview
ClawTrade adalah command center trading berbasis AI yang dirancang untuk membantu monitoring market, analisis, dan eksekusi dalam satu workflow terpadu.

Sistem ini menampilkan data market secara live, lalu menggunakan AI untuk menganalisis struktur market dan menghasilkan rekomendasi trading yang lebih terarah. Hasil analisis mencakup bias trading, entry plan, take profit, dan reasoning yang dapat dipahami dengan cepat.

Pengguna juga dapat menentukan mode kerja, mulai dari advisory hingga auto execute, dengan kontrol risiko yang tetap terjaga. Setelah tervalidasi, trade dapat diteruskan ke pipeline eksekusi berbasis OpenClaw.

Dengan begitu, ClawTrade menunjukkan bagaimana AI dapat bergerak dari sekadar insight menuju workflow operasional yang nyata.

---

## 2. Problem Statement
Dalam proses trading modern, pengguna sering kali harus berpindah antara banyak tools untuk:
- memantau market secara live,
- melakukan analisis,
- mengevaluasi risiko,
- dan mengeksekusi keputusan.

Workflow seperti ini memakan waktu, rawan human error, dan membuat proses pengambilan keputusan menjadi kurang efisien.

ClawTrade hadir untuk menyatukan proses tersebut ke dalam satu command center yang terintegrasi.

---

## 3. Project Objectives
Tujuan utama dari ClawTrade adalah:
- menyediakan monitoring market secara real-time,
- menghasilkan analisis trading berbasis AI yang explainable,
- menjaga proses eksekusi tetap terstruktur dan risk-aware,
- dan menunjukkan bagaimana OpenClaw dapat berfungsi sebagai orchestration layer untuk aksi operasional.

---

## 4. Main Features
Fitur utama pada ClawTrade meliputi:
- live market monitoring,
- candlestick chart real-time,
- AI trade analysis,
- confidence score dan reasoning,
- entry plan, stop loss, dan take profit,
- mode advisory, semi-auto, dan auto execute,
- execution pipeline berbasis OpenClaw,
- order lifecycle tracking,
- fallback data source dan cached snapshot untuk menjaga stabilitas demo.

---

## 5. AI Technology Used
ClawTrade menggunakan teknologi AI untuk membantu proses analisis market dan pengambilan keputusan.

### Teknologi AI yang digunakan:
- **OpenAI Responses API** sebagai engine analisis utama
- **GPT model** untuk membaca struktur market dan menghasilkan rekomendasi trading
- AI digunakan untuk menghasilkan:
  - market summary,
  - action recommendation,
  - confidence score,
  - entry plan,
  - stop loss,
  - take profit,
  - reasoning yang mudah dipahami

AI dalam project ini dirancang untuk mendukung **human-in-the-loop decision making**, bukan untuk blind execution tanpa kontrol.

---

## 6. Skills / Technical Components Used
Dalam konteks implementasi project, “skill” dapat dijelaskan sebagai komponen teknis utama yang dipakai dalam sistem.

### Frontend
- **React** untuk membangun antarmuka pengguna
- **Vite** untuk development environment yang cepat
- **lightweight-charts** untuk visualisasi candlestick chart
- **Lucide React** untuk ikon antarmuka

### Backend
- **Express.js** untuk API backend
- **WebSocket** untuk stream data market real-time
- **CORS** dan JSON API handling

### Data Source
- **Binance REST API** untuk market snapshot
- **Binance WebSocket** untuk live stream market data
- **CoinGecko API** sebagai fallback live data source

### AI Layer
- **OpenAI GPT analysis** untuk reasoning dan rekomendasi trading

### Agent / Execution Layer
- **OpenClaw Gateway WebSocket** untuk handoff eksekusi
- **OpenClaw session flow** sebagai orchestration layer
- **order lifecycle tracking** untuk memantau status trade

---

## 7. How the Project Works
Secara umum, alur kerja ClawTrade adalah sebagai berikut:

### Step 1 — Collect Live Market Data
Sistem mengambil data market dari Binance, termasuk:
- harga terakhir,
- perubahan harga,
- volume,
- dan data candlestick.

Jika koneksi utama tidak tersedia, sistem dapat menggunakan CoinGecko atau cached snapshot sebagai fallback.

### Step 2 — Analyze Market with AI
Data market yang sudah dikumpulkan dikirim ke AI engine untuk dianalisis.

AI membaca:
- trend,
- volatilitas,
- market structure,
- dan konteks harga.

Setelah itu, AI menghasilkan:
- bias trading,
- summary,
- confidence,
- entry plan,
- stop loss,
- take profit,
- dan reasoning.

### Step 3 — Display Decision in Dashboard
Hasil analisis ditampilkan langsung pada dashboard agar operator dapat:
- memahami kondisi market,
- memeriksa rekomendasi,
- dan mengevaluasi apakah trade layak dijalankan.

### Step 4 — Validate Execution Mode
Pengguna dapat memilih mode eksekusi:
- **Advisory** untuk saran saja,
- **Semi Auto** untuk interaksi sebagian,
- **Auto Execute** untuk workflow yang lebih otomatis.

Pada tahap ini, kontrol risiko tetap dijaga melalui batasan posisi dan risk guard.

### Step 5 — Route to OpenClaw Execution Pipeline
Jika trade tervalidasi, order dapat diteruskan ke OpenClaw execution pipeline.

Di sini OpenClaw berperan sebagai orchestration layer yang membawa keputusan dari dashboard menuju workflow aksi yang lebih nyata.

### Step 6 — Track Lifecycle
Status order kemudian dilacak di dashboard, misalnya:
- submitted,
- approved,
- executed,
- atau failed.

Dengan demikian, pengguna tidak hanya melihat insight, tetapi juga status eksekusinya.

---

## 8. System Architecture Summary
Arsitektur sistem dapat diringkas sebagai berikut:

1. Frontend React menampilkan dashboard dan menerima input pengguna.
2. Backend Express mengelola API, market data, dan integrasi AI.
3. Binance dan CoinGecko menjadi sumber data market.
4. OpenAI GPT digunakan untuk analisis trading.
5. OpenClaw digunakan untuk orchestration dan execution handoff.
6. Semua hasil ditampilkan kembali ke dashboard sebagai satu workflow terpadu.

---

## 9. Innovation and Value
Nilai utama dari ClawTrade terletak pada integrasi tiga hal penting dalam satu sistem:
- observasi market,
- analisis AI yang explainable,
- dan orchestration menuju eksekusi.

Project ini bukan hanya dashboard market, dan bukan hanya chatbot AI. ClawTrade menggabungkan keduanya menjadi workflow yang lebih dekat ke penggunaan nyata.

Bagi juri hackathon, kekuatan project ini ada pada:
- inovasi penggunaan AI dalam trading workflow,
- technical execution yang modular,
- real-world value,
- dan demonstrasi integrasi OpenClaw ke dalam sistem operasional.

---

## 10. Conclusion
ClawTrade adalah command center trading berbasis AI yang menggabungkan monitoring market, analisis, dan eksekusi dalam satu workflow terpadu.

Melalui ClawTrade, kami menunjukkan bagaimana AI dapat bergerak dari sekadar memberikan insight menjadi bagian dari workflow operasional yang nyata, lebih terstruktur, dan lebih siap digunakan dalam skenario modern.
