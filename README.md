# Healthy Posture AI

Healthy Posture AI adalah aplikasi web cerdas yang membantu pengguna menjaga postur tubuh yang sehat dan mengurangi risiko bahaya akibat duduk terlalu lama. Aplikasi ini memadukan logika sistem pakar dan **Google Gemini API** untuk memprediksi tingkat risiko kesehatan secara _real-time_ berdasarkan durasi duduk, kebiasaan istirahat, dan data personalisasi pengguna (usia, BMI, dll).

---

## Arsitektur Teknologi

Sistem ini dibangun dengan arsitektur **Microservices Sederhana** yang memisahkan antara logika aplikasi (Node.js) dengan komputasi _Machine Learning_ (Python).

1. **Frontend (Klien)** — React.js, Vite, TailwindCSS
   - Antarmuka pengguna (Dashboard, Timer Duduk, Profil, Riwayat Sesi)
   - Menghitung skor kesehatan (Health Score) dan berinteraksi dengan API Backend

2. **Backend (Server Utama)** — Node.js, Express.js
   - Autentikasi (Register/Login JWT), penyimpanan profil & sesi ke database
   - Menjadi jembatan (API Gateway) menuju ML Server

3. **ML Server (Server AI)** — Python, Flask, Google Gemini API
   - Berjalan otomatis di background (port 5001)
   - Menerima konteks aktivitas duduk pengguna dan mengembalikan prediksi risiko serta _insight_ pintar yang dipersonalisasi.

4. **Database** — PostgreSQL
   - Menyimpan data pengguna, password hash, metrik personalisasi, dan riwayat sesi

---

## ⚠️ Persyaratan Sistem

Sebelum menginstal, pastikan persyaratan berikut sudah terpenuhi:

| **Node.js** | **v18+ / v20+ / v22+** | Bisa menggunakan Node versi terbaru yang stabil. |
| **npm** | Bawaan Node.js | Otomatis terinstal bersama Node.js |
| **Python** | v3.10 – v3.13 | Untuk menjalankan ML Server (Flask) |
| **PostgreSQL** | v14 atau lebih baru | Database utama |
| **Git** | Versi terbaru | Untuk clone repository |

---

## 🚀 Cara Menjalankan Aplikasi (Step-by-Step)

### Langkah 1: Clone Repository

```bash
git clone https://github.com/USERNAME/healthy-posture-ai.git
cd healthy-posture-ai
```

> Ganti `USERNAME` dengan username GitHub pemilik repo.

---

### Langkah 2: Siapkan Database PostgreSQL

1. **Pastikan PostgreSQL sudah berjalan** di komputermu.
   - **Bagi pengguna macOS**, jika belum menginstal PostgreSQL, jalankan:
     ```bash
     brew install postgresql@14
     brew services start postgresql@14
     ```

2. **Buat database baru** dengan nama `healthy_posture_ai`:

   Menggunakan `psql` (terminal):

   ```bash
   psql -U postgres
   # Untuk macOS (brew), terkadang tidak perlu -U postgres:
   # psql postgres
   ```

   ```sql
   CREATE DATABASE healthy_posture_ai;
   \q
   ```

   Atau gunakan **pgAdmin**: klik kanan pada _Databases_ → _Create_ → _Database_ → isi nama `healthy_posture_ai` → Save.

3. **Buat file konfigurasi** `.env` di dalam folder `server/`:

   ```bash
   cd server
   ```

   Buat file bernama `.env` (tanpa nama depan, hanya titik dan "env") dengan isi:

   ```env
   PORT=5000

   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=password_postgresql_kamu
   PGDATABASE=healthy_posture_ai

   JWT_SECRET=healthposture_secret
   GEMINI_API_KEY=api_key_gemini_kamu
   ```

   > ⚠️ Ganti `password_postgresql_kamu` dengan password PostgreSQL kamu. (Catatan untuk macOS: pengguna Homebrew biasanya memiliki password kosong atau menggunakan nama user Mac mereka sebagai `PGUSER`).
   > ⚠️ Ganti `api_key_gemini_kamu` dengan Google Gemini API Key yang valid (dapat diperoleh dari Google AI Studio).

4. **Jalankan migrasi database** untuk membuat semua tabel yang diperlukan:

   ```bash
   # Masih di dalam folder server/
   npm install
   npm run migrate:up
   ```

---

### Langkah 3: Siapkan Python Virtual Environment (untuk ML Server)

ML Server menggunakan Python dan Flask. Kamu perlu membuat _virtual environment_ agar package Python tidak bentrok.

```bash
# Kembali ke root folder proyek
cd ..

# Buat virtual environment
python3 -m venv venv  # (Di macOS/Linux gunakan python3)

# Aktivasi virtual environment:
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Windows (CMD):
.\venv\Scripts\activate.bat

# macOS/Linux:
source venv/bin/activate
```

Setelah aktif, terminal akan menampilkan `(venv)` di depan prompt. Lalu instal dependensi Python:

```bash
pip install flask flask-cors requests
# (Jika error pip not found di Mac, gunakan pip3 install ...)
```

---

### Langkah 4: Jalankan Backend (Node.js + Flask otomatis)

Backend Node.js sudah dikonfigurasi untuk **menjalankan Python Flask Server secara otomatis** di background. Jadi kamu cukup jalankan satu perintah saja.

```bash
# Pastikan virtual environment Python masih aktif (ada tulisan (venv))
# Masuk ke folder server
cd server

# Jalankan backend (otomatis menyalakan Node.js di port 5000 & Flask di port 5001)
npm run dev
```

Jika berhasil, akan muncul log seperti:

```
[Python] Starting Python Flask Model Server (Powered by Gemini)...
Python Flask Model Server running on http://127.0.0.1:5001
🚀 Server running on port 5000
```

> ⚠️ **Jangan tutup terminal ini!** Biarkan berjalan selama kamu menggunakan aplikasi.

---

### Langkah 5: Jalankan Frontend (React + Vite)

Buka **terminal baru** (split terminal di VSCode atau buka tab baru):

```bash
# Masuk ke folder client
cd client

# Instal dependensi frontend
npm install

# Jalankan frontend
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

---

## 🧠 Bagaimana "Health Score" dan AI Bekerja?

Konsep utama aplikasi ini menggabungkan **Logika Dasar (UI)** dan **Prediksi Cerdas (Google Gemini API)**.

### 1. Denda Personalisasi Profil (Skor Awal)

Setiap pengguna memulai dengan **Health Score 100**. Skor akan disesuaikan berdasarkan profil:

- **BMI**: Obesitas (> 30) dikurangi 10 poin, _Overweight_ (> 25) dikurangi 5 poin
- **Jam Tidur**: < 5 jam dikurangi 10 poin, < 6 jam dikurangi 5 poin
- **Kebugaran**: Jarang olahraga dikurangi 10 poin, Sedang dikurangi 5 poin

### 2. Evaluasi AI secara Real-Time

Ketika pengguna menyalakan **Timer Duduk**, Backend secara berkala mengirimkan konteks aktivitas pengguna (durasi duduk, frekuensi istirahat, profil pekerjaan, usia, dll) kepada model Gemini.

Hasil prediksi AI akan dievaluasi dan diklasifikasikan sebagai:
- **Risiko Rendah**: Skor +5 (recovery bagus)
- **Risiko Sedang**: Skor -10 poin
- **Risiko Tinggi**: Skor -25 poin (alarm berbunyi terus sampai user istirahat!)

Selain itu, Gemini juga akan mengembalikan **Insight** berupa motivasi satu paragraf yang personal sesuai profesi atau kondisi duduk harian pengguna.

---

## 🔧 Troubleshooting (Solusi Masalah Umum)

### ❌ Error: `ECONNREFUSED 127.0.0.1:5432` (PostgreSQL)

**Penyebab**: PostgreSQL belum berjalan atau database belum dibuat.

**Solusi**:
1. Pastikan service PostgreSQL sudah running:
   - **Windows**: Buka _Services_ (Win+R → `services.msc`) → cari `postgresql` → pastikan statusnya _Running_
   - **macOS**: Buka terminal dan ketik `brew services start postgresql` atau `brew services start postgresql@14`
   - **Linux**: Buka terminal dan ketik `sudo systemctl start postgresql`
2. Pastikan database `healthy_posture_ai` sudah dibuat (lihat Langkah 2)

### ❌ Error: API Key Gemini tidak ditemukan atau Invalid Response

**Penyebab**: Variabel `GEMINI_API_KEY` tidak disetel di `.env` atau *key* yang diberikan tidak valid.

**Solusi**:
Pastikan kamu telah membuat file `.env` di folder `server/` dan mengisi `GEMINI_API_KEY` dengan kunci API yang valid. Kunci API bisa didapatkan secara gratis dari Google AI Studio.

---

## 📁 Struktur Folder

```
healthy-posture-ai/
├── client/                  # Frontend React + Vite
│   ├── src/                 # Komponen, Context, Halaman UI
│   └── package.json
│
├── server/                  # Backend Node.js + Express
│   ├── src/                 # Route handlers & Business logic
│   ├── migrations/          # Database migration files
│   ├── model_server.py      # ML Server (Python Flask + Gemini)
│   ├── .env                 # ⚠️ Buat manual (tidak di-push ke GitHub)
│   └── package.json
│
├── venv/                    # Python virtual environment (tidak di-push)
├── .gitignore
└── README.md                # File ini
```
