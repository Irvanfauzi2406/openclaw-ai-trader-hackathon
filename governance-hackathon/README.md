# OPS GUARD

**AI-assisted maintenance operations platform** untuk standarisasi input data maintenance, validasi otomatis, review approval, dan audit trail yang mudah dipahami.

## Overview

OPS GUARD adalah prototype web app untuk menjawab masalah umum dalam operasional maintenance:
- input data manual yang tidak seragam
- typo dan duplikasi data
- approval flow yang lambat
- kurangnya audit trail dan akuntabilitas

Platform ini membantu organisasi mengubah log maintenance menjadi data operations yang lebih rapi, tervalidasi, dan siap dipakai untuk pengambilan keputusan.

## Problem Statement

Banyak tim operasional masih mencatat maintenance secara manual dengan format yang berbeda-beda. Akibatnya:
- kualitas data rendah
- validasi memakan waktu
- supervisor harus review manual terlalu banyak
- risiko kesalahan keputusan meningkat
- audit dan pelacakan perubahan menjadi sulit

## Solution

OPS GUARD menyediakan:
- **Smart Form** untuk input data terstruktur
- **AI-assisted Validation** untuk mendeteksi format salah, duplikasi, dan inkonsistensi
- **Approval Workflow** untuk review yang lebih fokus
- **Audit Trail** untuk pelacakan perubahan secara transparan
- **Governance Dashboard** untuk melihat KPI, issue prioritas, dan kualitas data

## Key Features

### 1. Structured Maintenance Submission
Form input dengan field standar, tulisan jelas, layout sederhana, dan validasi yang mudah dipahami.

### 2. Real-time Validation
Sistem menandai:
- asset yang tidak sesuai master data
- format yang salah
- potensi duplikasi
- pola issue berulang

### 3. Priority Review Queue
Supervisor hanya fokus pada entri yang benar-benar perlu ditinjau.

### 4. Audit Trail
Semua perubahan tercatat dengan:
- waktu
- aset
- aksi
- pengguna
- status
- alasan perubahan

### 5. Business Impact Dashboard
Menampilkan:
- validation success rate
- review queue
- high-risk assets
- simulasi kualitas input mingguan

## Why This Matters for Governance

OPS GUARD bukan sekadar dashboard operasional. Platform ini mendukung governance karena:
- menstandardisasi proses pencatatan
- meningkatkan integritas data
- memperjelas akuntabilitas review
- mempermudah audit dan pelacakan
- membantu keputusan berbasis data yang lebih baik

## Target Users

- admin operasional
- supervisor maintenance
- operations manager
- warehouse team
- fleet / logistics team

## Design Principles

Prototype ini dirancang dengan pendekatan:
- **simple** → tidak membingungkan user non-teknis
- **clear** → angka dan status mudah dibaca
- **modern** → tetap terasa fresh dan credible
- **boomer-friendly** → spacing lega, contrast bagus, tombol jelas

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript

## Demo Structure

Prototype terdiri dari beberapa section utama:
- Hero / Product Positioning
- Problem Statement
- Solution Overview
- Product Dashboard
- Business Impact
- Audit Trail
- Closing Pitch

## Future Improvements

Versi lanjutan bisa dikembangkan dengan:
- integrasi Google Sheets / database
- login role-based access
- approval action real-time
- analytics chart interaktif
- export audit report
- AI recommendation yang benar-benar terhubung ke backend

## Project Value

OPS GUARD menunjukkan bagaimana pendekatan governance bisa dibuat lebih praktis, mudah dipakai, dan relevan untuk operasional nyata — bukan hanya sebagai laporan, tapi sebagai sistem kerja harian.

---

## Folder Structure

```bash
governance-hackathon/
├── index.html
├── style.css
├── main.js
└── README.md
```

## How to Run

Cukup buka `index.html` di browser.

Untuk deploy cepat:
- Vercel
- Netlify
- GitHub Pages

---

## Submission One-liner

**OPS GUARD is an AI-assisted maintenance operations web app that standardizes maintenance reporting, improves data integrity, and enables accountable review through validation, approval routing, and audit visibility.**
