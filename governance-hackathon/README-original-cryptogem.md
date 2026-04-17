# WEBSITE-CRYPTOGEM
# Crypto Gem — Portfolio Community Website

Website portfolio komunitas crypto premium. Dibangun dengan HTML, CSS, dan JavaScript murni — tanpa framework, siap deploy ke Vercel dalam hitungan menit.

## Struktur File

```
cryptogem/
├── index.html        # Halaman utama
├── style.css         # Semua styling
├── main.js           # Interaktivitas (slider, chart, counter)
├── vercel.json       # Konfigurasi Vercel
├── README.md         # Dokumentasi ini
└── public/
    └── events/       # Taruh foto event di sini
        ├── event1.jpg
        ├── event2.jpg
        ├── event3.jpg
        ├── event4.jpg
        └── event5.jpg
```

---

## Deploy ke Vercel (3 Cara)

### Cara 1 — Via GitHub (Rekomendasi)

1. Buat repo baru di [github.com](https://github.com/new)
2. Upload semua file ke repo
3. Buka [vercel.com](https://vercel.com) → **Add New Project**
4. Import repo GitHub kamu
5. Klik **Deploy** — selesai! Vercel auto-detect static site

### Cara 2 — Drag & Drop di Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Drag & drop folder `cryptogem/` ke halaman tersebut
3. Deploy otomatis dalam ~30 detik

### Cara 3 — Vercel CLI

```bash
npm install -g vercel
cd cryptogem
vercel
# Ikuti instruksi, pilih defaults
```

---

## Cara Menambahkan Foto Event

### Langkah 1 — Buat folder
Buat folder `public/events/` di dalam project, lalu masukkan foto:
```
public/events/event1.jpg   ← Gathering Vol.1
public/events/event2.jpg   ← Web3 Summit
public/events/event3.jpg   ← Exclusive Dinner
public/events/event4.jpg   ← Masterclass
public/events/event5.jpg   ← Anniversary
```

### Langkah 2 — Edit index.html
Cari class `slide-img-1` sampai `slide-img-5` di `index.html`, lalu di `style.css` tambahkan:

```css
.slide-img-1 {
  background-image: url('public/events/event1.jpg');
  background-size: cover;
  background-position: center;
}
/* Ulangi untuk slide-img-2 s/d slide-img-5 */
```

---

## Cara Mengubah Konten

### Ganti Nama & Info Member
Cari section `<!-- MEMBERS -->` di `index.html` dan edit nama, role, dan bio.

### Update Data Trading (PnL Journal)
Buka `main.js`, cari array `trades` dan edit sesuai data real komunitas:
```js
const trades = [
  { coin: '$BTC', dot: '#f7931a', action: 'BUY', entry: '$58,000', exit: '$72,000', pnl: '+$14,000', roi: '+24%', pos: true },
  // tambah baris di sini...
];
```

### Update Data Ekuitas (Chart)
Cari objek `datasets` di `main.js`:
```js
const datasets = {
  '1M': [100, 105, ...], // data 1 bulan
  '3M': [100, 108, ...], // data 3 bulan
  '1Y': [100, 112, ...], // data 1 tahun
};
```

### Ganti Link Telegram/Discord
Cari `href="https://t.me/cryptogem"` di `index.html` dan ganti dengan link asli.

### Ganti Statistik Hero
Edit langsung di `index.html` pada section `.hero-stats`.

---

## Custom Domain di Vercel

1. Buka dashboard Vercel → project kamu
2. Tab **Settings** → **Domains**
3. Masukkan domain (misal: `cryptogem.id`)
4. Ikuti instruksi DNS

---

## Lisensi
Dibuat untuk komunitas Crypto Gem. Wajib Konfirmasi ke ADMIN apabila mau merubah data atau mengedit file file yang ada di GITHUB !
