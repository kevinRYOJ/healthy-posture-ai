# Healthy Posture AI

Healthy Posture AI adalah aplikasi web cerdas yang membantu pengguna menjaga postur tubuh yang sehat dan mengurangi risiko bahaya akibat duduk terlalu lama. Aplikasi ini memadukan logika sistem pakar dan **Google Gemini API** untuk memprediksi tingkat risiko kesehatan secara *real-time* berdasarkan durasi duduk, kebiasaan istirahat, dan data personalisasi pengguna (usia, BMI, dll).

---

## 🏗️ Arsitektur Teknologi

Sistem ini dibangun dengan arsitektur **Microservices Sederhana** yang memisahkan antara logika aplikasi (Node.js) dengan komputasi *Machine Learning* (Python).

1. **Frontend (Klien)** — React.js, Vite, TailwindCSS
   - Antarmuka pengguna (Dashboard, Timer Duduk, Profil, Riwayat Sesi)
   - Menghitung skor kesehatan (Health Score)
2. **Backend (Server Utama)** — Node.js, Express.js
   - Autentikasi (Register/Login JWT), penyimpanan profil & sesi ke database
   - Bertindak sebagai jembatan (API Gateway) menuju ML Server
3. **ML Server (Server AI)** — Python, Flask, Google Gemini API
   - Berjalan otomatis di background oleh Node.js (port 5001)
   - Menerima konteks aktivitas duduk dan mengembalikan prediksi risiko serta insight personalisasi
4. **Database** — PostgreSQL
   - Menyimpan data pengguna, riwayat sesi, dan metrik

---

## 🚀 Cara Menjalankan (Pilih Salah Satu Metode)

Kamu bisa menjalankan aplikasi ini menggunakan **Docker** (paling mudah) atau secara **Manual** (jika ingin mengubah kode).

Pastikan kamu sudah clone repository ini:
```bash
git clone https://github.com/kevinRYOJ/healthy-posture-ai.git
cd healthy-posture-ai
```

---

### METODE A: Menggunakan Docker (Sangat Direkomendasikan) 🐳

Ini adalah cara tercepat tanpa perlu menginstal Node.js, Python, atau PostgreSQL di komputermu.

**Persyaratan:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstal dan berjalan.

1. Buka file `.env.example` di folder `server/`, lalu _copy_ isinya menjadi file baru bernama `.env`.
2. Buka file `docker-compose.yml` di _root folder_ proyek.
3. Jalankan perintah berikut di terminal:
   ```bash
   docker-compose up -d --build
   ```
4. Selesai! Aplikasi akan langsung berjalan:
   - Frontend: **http://localhost:3000**
   - Backend API: **http://localhost:5000**
   - ML Server: **http://localhost:5001** (Internal)

---

### METODE B: Instalasi Manual (Untuk Development) 🛠️

**Persyaratan Sistem (Semua OS):**
- **Node.js** v20+
- **Python** v3.10 – v3.13 (Pastikan di-Add to PATH)
- **PostgreSQL** v14+

#### Langkah 1: Siapkan Database PostgreSQL
1. Buka PostgreSQL (via `psql` atau pgAdmin) lalu jalankan query:
   ```sql
   CREATE DATABASE healthy_posture_ai;
   ```
2. Buat file `.env` di dalam folder `server/` dan isi dengan:
   ```env
   PORT=5000
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=password_postgresql_kamu
   PGDATABASE=healthy_posture_ai
   JWT_SECRET=healthposture_secret
   GEMINI_API_KEY=api_key_gemini_kamu
   CORS_ORIGIN=http://localhost:3000
   ```
   *(Ganti password PG dan API Key Gemini milikmu)*

#### Langkah 2: Migrasi Database
Buka terminal dan jalankan:
```bash
cd server
npm install
npm run migrate:up
```

#### Langkah 3: Siapkan Python Virtual Environment (ML Server)
Buka terminal baru di _root folder_ proyek (`healthy-posture-ai/`):

**Untuk Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install flask flask-cors requests
```

**Untuk macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors requests
```

#### Langkah 4: Jalankan Backend & ML Server
Backend sudah dikonfigurasi untuk menjalankan server Python secara otomatis.
```bash
cd server
npm run dev
```
*(Jangan tutup terminal ini. Akan ada log port 5000 dan log Python port 5001)*

#### Langkah 5: Jalankan Frontend
Buka terminal baru lagi:
```bash
cd client
npm install
npm run dev
```
Buka browser dan akses **http://localhost:3000**! 🎉

---

## 🧠 Bagaimana "Health Score" AI Bekerja?

1. **Skor Awal (Denda Personalisasi):**
   Dimulai dari skor 100. Jika pengguna punya masalah BMI (>25), kurang tidur (<6 jam), atau jarang olahraga, sistem akan mengurangi skor dasar sebagai mitigasi dini.
2. **Evaluasi AI Real-Time:**
   Selama Timer Duduk aktif, Backend akan terus mengirim konteks ke Gemini AI.
   - **Risiko Rendah:** +5 Poin (pemulihan)
   - **Risiko Sedang:** -10 Poin (peringatan ringan)
   - **Risiko Tinggi:** -25 Poin (alarm akan berbunyi mendesak user untuk bangkit)
3. **Insight Pintar:**
   Gemini memberikan teks motivasi yang disesuaikan secara personal (misal: nasihat untuk _programmer_ vs _pekerja lapangan_).

---

## 📁 Struktur Folder Utama
```
healthy-posture-ai/
├── client/                  # Frontend (React + Vite + Tailwind)
├── server/                  # Backend API Gateway (Node.js)
│   ├── src/                 # Business logic, routes, auth
│   ├── migrations/          # Schema database
│   ├── model_server.py      # AI Server (Python Flask)
│   └── .env                 # Konfigurasi rahasia
├── venv/                    # Local python environment
├── docker-compose.yml       # Konfigurasi containerized deployment
└── README.md                # File panduan ini
```
