# Healthy Posture AI

Healthy Posture AI adalah aplikasi web cerdas yang membantu pengguna menjaga postur tubuh yang sehat dan mengurangi risiko bahaya akibat duduk terlalu lama. Aplikasi ini menggunakan model _Machine Learning_ (TensorFlow/Keras) untuk memprediksi tingkat risiko kesehatan secara _real-time_ berdasarkan durasi duduk, kebiasaan istirahat, dan data personalisasi pengguna (usia, BMI, dll).

---

## Arsitektur Teknologi

Sistem ini dibangun dengan arsitektur **Microservices Sederhana** yang memisahkan antara logika aplikasi (Node.js) dengan komputasi _Machine Learning_ (Python).

1. **Frontend (Klien)** — React.js, Vite, TailwindCSS
   - Antarmuka pengguna (Dashboard, Timer Duduk, Profil, Riwayat Sesi)
   - Menghitung skor kesehatan (Health Score) dan berinteraksi dengan API Backend

2. **Backend (Server Utama)** — Node.js, Express.js
   - Autentikasi (Register/Login JWT), penyimpanan profil & sesi ke database
   - Menjadi jembatan (API Gateway) menuju ML Server

3. **ML Server (Server AI)** — Python, Flask, TensorFlow, Keras
   - Berjalan otomatis di background (port 5001)
   - Memuat model `.keras`, menerima 15 fitur, mengembalikan prediksi risiko

4. **Database** — PostgreSQL
   - Menyimpan data pengguna, password hash, metrik personalisasi, dan riwayat sesi

---

## ⚠️ Persyaratan Sistem (WAJIB DIBACA)

Sebelum menginstal, pastikan semua persyaratan berikut sudah terpenuhi:

| **Node.js** | **v20.x (LTS)** |**JANGAN gunakan Node.js v22 atau v23!** Lihat penjelasan di bawah |
| **npm** | v10.x (bawaan Node 20) | Otomatis terinstal bersama Node.js |
| **Python** | v3.10 – v3.12 | Untuk menjalankan ML Server (Flask) |
| **PostgreSQL** | v14 atau lebih baru | Database utama |
| **Git** | Versi terbaru | Untuk clone repository |

### Mengapa Harus Node.js v20?

Proyek ini menggunakan package `@tensorflow/tfjs-node` yang memerlukan kompilasi _native binary_ C++. **Node.js v22 dan v23 belum didukung** oleh TensorFlow.js, sehingga akan menyebabkan error saat `npm install`:

```
node-pre-gyp install --fallback-to-build
gyp ERR! find VS  ...
gyp ERR! configure error
```

**Jika kamu sudah terlanjur menginstal Node.js v22/v23, ikuti langkah ini untuk downgrade:**

#### Windows:

1. Buka **Settings → Apps → Installed Apps**
2. Cari **Node.js**, klik **Uninstall**
3. Download Node.js **v20 LTS** dari: https://nodejs.org/en/download/
   - Pilih yang berlabel **"LTS"** (Long Term Support), versi **20.x.x**
4. Instal seperti biasa (Next → Next → Finish)
5. Buka terminal baru, verifikasi dengan:
   ```bash
   node -v
   # Output harus: v20.x.x
   ```

#### macOS/Linux (menggunakan nvm):

```bash
# Instal nvm jika belum ada
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Instal dan gunakan Node.js 20
nvm install 20
nvm use 20

# Verifikasi
node -v
# Output harus: v20.x.x
```

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

2. **Buat database baru** dengan nama `healthy_posture_ai`:

   Menggunakan `psql` (terminal):

   ```bash
   psql -U postgres
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
   ```

   > ⚠️ Ganti `password_postgresql_kamu` dengan password PostgreSQL yang kamu atur saat instalasi.

4. **Jalankan migrasi database** untuk membuat semua tabel yang diperlukan:

   ```bash
   # Masih di dalam folder server/
   npm install
   npm run migrate:up
   ```

   Jika berhasil, akan muncul pesan seperti:

   ```
   > Migrating files: 1778653377659_create-table-users
   > Migrating files: 1779551155519_add-personalization-fields-to-users
   > Migrating files: 1779658756026_recreate-sitting-sessions-table
   ```

---

### Langkah 3: Siapkan Python Virtual Environment (untuk ML Server)

ML Server menggunakan Python dan Flask. Kamu perlu membuat _virtual environment_ agar package Python tidak bentrok.

```bash
# Kembali ke root folder proyek
cd ..

# Buat virtual environment
python -m venv venv

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
pip install tensorflow flask flask-cors numpy
```

> ⚠️ Instalasi TensorFlow bisa memakan waktu beberapa menit dan ~500MB storage.

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
🐍 Python ML Server berjalan di port 5001
🚀 Server berjalan di http://localhost:5000
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

Jika berhasil, akan muncul:

```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

Buka browser dan akses: **http://localhost:3000**

---

## 🧠 Bagaimana "Health Score" dan AI Bekerja?

Konsep utama aplikasi ini menggabungkan **Logika Dasar (UI)** dan **Prediksi AI (Keras)**.

### 1. Denda Personalisasi Profil (Skor Awal)

Setiap pengguna memulai dengan **Health Score 100**. Skor akan disesuaikan berdasarkan profil:

- **BMI**: Obesitas (> 30) dikurangi 10 poin, _Overweight_ (> 25) dikurangi 5 poin
- **Jam Tidur**: < 5 jam dikurangi 10 poin, < 6 jam dikurangi 5 poin
- **Kebugaran**: Jarang olahraga dikurangi 10 poin, Sedang dikurangi 5 poin

_Contoh: Orang dengan obesitas dan jarang olahraga akan memulai harinya dengan skor ~80/100._

### 2. Evaluasi AI secara Real-Time

Ketika pengguna menyalakan **Timer Duduk**, Backend mengumpulkan **15 Fitur** untuk dikirim ke ML Server:

| No  | Fitur                            | Keterangan                       |
| --- | -------------------------------- | -------------------------------- |
| 1   | `total_sitting_minutes`          | Total menit duduk hari ini       |
| 2   | `number_of_breaks`               | Jumlah jeda yang diambil         |
| 3   | `avg_break_duration_minutes`     | Rata-rata durasi jeda            |
| 4   | `longest_sitting_streak_minutes` | Duduk terlama tanpa jeda         |
| 5   | `fatigue_level`                  | Level kelelahan                  |
| 6   | `age`                            | Umur pengguna                    |
| 7   | `bmi`                            | Indeks massa tubuh               |
| 8   | `sleep_hours`                    | Jam tidur per hari               |
| 9   | `gender`                         | Jenis kelamin                    |
| 10  | `work_type`                      | Tipe pekerjaan                   |
| 11  | `fitness_level`                  | Tingkat kebugaran                |
| 12  | `device_preference`              | Perangkat utama (laptop/desktop) |
| 13  | `daily_work_hours`               | Jam kerja per hari               |
| 14  | `day_of_week`                    | Hari dalam seminggu              |
| 15  | `time_of_day_dominant`           | Waktu kerja dominan              |

Hasil prediksi AI:

- **Risiko Rendah**: Skor +5 (recovery bagus)
- **Risiko Sedang**: Skor -10 poin
- **Risiko Tinggi**: Skor -25 poin (alarm berbunyi terus sampai user istirahat!)

---

## 🔧 Troubleshooting (Solusi Masalah Umum)

### ❌ Error: `node-pre-gyp install --fallback-to-build` / `gyp ERR! find VS`

**Penyebab**: Versi Node.js terlalu baru (v22/v23) atau Visual Studio Build Tools belum terinstal.

**Solusi**:

1. **Downgrade Node.js ke v20** (lihat bagian [Persyaratan Sistem](#️-persyaratan-sistem-wajib-dibaca))
2. Hapus folder `node_modules` dan file `package-lock.json` di folder `server/`:
   ```bash
   cd server
   rm -rf node_modules package-lock.json   # macOS/Linux
   Remove-Item -Recurse node_modules, package-lock.json   # Windows PowerShell
   ```
3. Instal ulang:
   ```bash
   npm install
   ```

---

### ❌ Error: `ECONNREFUSED 127.0.0.1:5432` (PostgreSQL)

**Penyebab**: PostgreSQL belum berjalan atau database belum dibuat.

**Solusi**:

1. Pastikan service PostgreSQL sudah running:
   - **Windows**: Buka _Services_ (Win+R → `services.msc`) → cari `postgresql` → pastikan statusnya _Running_
   - **macOS**: `brew services start postgresql`
   - **Linux**: `sudo systemctl start postgresql`
2. Pastikan database `healthy_posture_ai` sudah dibuat (lihat Langkah 2)
3. Pastikan username dan password di file `.env` sudah benar

---

### ❌ Error: `ModuleNotFoundError: No module named 'tensorflow'`

**Penyebab**: Virtual environment Python belum diaktifkan atau package belum diinstal.

**Solusi**:

```bash
# Aktifkan virtual environment terlebih dahulu
# Windows:
.\venv\Scripts\Activate.ps1

# Lalu instal ulang:
pip install tensorflow flask flask-cors numpy
```

---

### ❌ Error: `EACCES permission denied` (macOS/Linux)

**Penyebab**: Hak akses file tidak cukup.

**Solusi**:

```bash
sudo chown -R $(whoami) .
npm install
```

---

## 📁 Struktur Folder

```
healthy-posture-ai/
├── client/                  # Frontend React + Vite
│   ├── src/
│   │   ├── components/      # Komponen UI (Timer, HealthScore, dll)
│   │   ├── context/         # State management global (AppContext, AuthContext)
│   │   ├── hooks/           # Custom hooks (useTimer)
│   │   ├── pages/           # Halaman (Dashboard, Home, History, Profile)
│   │   └── api.js           # Helper untuk panggilan API
│   └── package.json
│
├── server/                  # Backend Node.js + Express
│   ├── src/
│   │   ├── api/             # Route handlers (users, sessions, authentications)
│   │   ├── middlewares/     # Auth middleware (JWT verification)
│   │   ├── services/        # Business logic
│   │   └── server.js        # Entry point
│   ├── ml_models/           # Model ML (.keras, .pkl, dataset .csv)
│   ├── migrations/          # Database migration files
│   ├── .env                 # ⚠️ Buat manual (tidak di-push ke GitHub)
│   └── package.json
│
├── venv/                    # Python virtual environment (tidak di-push)
├── .gitignore
└── README.md                # File ini
```

---

## 📝 Catatan Penting

- File `.env` **tidak di-push ke GitHub** (ada di `.gitignore`). Setiap orang yang clone repo harus membuat file `.env` sendiri di folder `server/`.
- File model ML (`healthy_posture_model.keras`, `scaler.pkl`, `label_encoders.pkl`, `label_encoder_target.pkl`) **harus ada** di folder `server/ml_models/`. Pastikan file-file ini sudah ter-commit di repo.
- Virtual environment Python (`venv/`) **tidak di-push ke GitHub**. Setiap orang harus membuat dan menginstal package Python sendiri.
  aler.pkl`berada di dalam folder`server/ml*models/` agar Python ML Server bisa memuat AI Engine dengan benar.*
