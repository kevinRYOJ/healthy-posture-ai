# Healthy Posture AI - MVP

Healthy Posture AI adalah aplikasi web cerdas yang bertujuan membantu pengguna menjaga postur tubuh yang sehat dan mengurangi risiko bahaya akibat duduk terlalu lama. Aplikasi ini menggunakan model _Machine Learning_ (TensorFlow) untuk memprediksi tingkat risiko kesehatan secara _real-time_ berdasarkan durasi duduk, kebiasaan istirahat, dan data personalisasi pengguna (usia, BMI, dll).

## Arsitektur Teknologi

Sistem ini dibangun dengan arsitektur **Microservices Sederhana** yang memisahkan antara logika aplikasi (Node.js) dengan komputasi _Machine Learning_ (Python).

1. **Frontend (Klien)**
   - **Teknologi**: React.js, Vite, TailwindCSS.
   - **Fungsi**: Antarmuka pengguna (_Dashboard_, _Timer_ Duduk, Pengisian Profil, Riwayat Sesi). Menghitung skor kesehatan (_Health Score_) dasar dan berinteraksi dengan API Backend.

2. **Backend (Server Utama)**
   - **Teknologi**: Node.js, Express.js.
   - **Fungsi**: Mengelola Autentikasi (Register/Login JWT), menyimpan profil dan sesi ke _database_, melayani API untuk _Frontend_, serta menjadi jembatan (API Gateway) menuju _Server ML_.

3. **ML Server (Server Kecerdasan Buatan)**
   - **Teknologi**: Python, Flask, TensorFlow, Keras.
   - **Fungsi**: Berjalan di _background_ (port 5001), memuat model `.keras`, menerima 15 parameter fitur dari Node.js, dan mengembalikan hasil tebakan risiko (Rendah/Sedang/Tinggi).

4. **Database**
   - **Teknologi**: PostgreSQL.
   - **Fungsi**: Menyimpan data pengguna, _password hash_, metrik personalisasi (BMI, jam tidur, tingkat kebugaran), serta riwayat sesi duduk.

---

## 🧠 Bagaimana "Health Score" dan AI Bekerja?

Konsep utama MVP ini adalah menggabungkan **Logika Dasar (UI)** dan **Prediksi AI (Keras)**.

### 1. Denda Personalisasi Profil (Skor Awal)

Setiap pengguna memulai dengan **Health Score 100**. Namun, sebelum mereka mulai duduk, skor ini akan langsung disesuaikan (_dihukum_) berdasarkan kebiasaan buruk yang mereka isi saat mendaftar:

- **BMI**: Obesitas (> 30) dikurangi 10 poin, _Overweight_ (> 25) dikurangi 5 poin.
- **Jam Tidur**: < 5 jam dikurangi 10 poin, < 6 jam dikurangi 5 poin.
- **Kebugaran**: "Jarang olahraga" / "Tidak pernah" dikurangi 10 poin, "Sedang" dikurangi 5 poin.
  _Contoh: Orang dengan obesitas dan jarang olahraga akan memulai harinya dengan skor ~80/100, bukan 100._

### 2. Evaluasi AI secara Real-Time

Ketika pengguna menyalakan **Timer Duduk**, _Backend_ akan mengumpulkan **15 Fitur** untuk dikirim ke _ML Server_ (Flask). Ke-15 fitur tersebut adalah:

1. `total_sitting_minutes`
2. `number_of_breaks`
3. `avg_break_duration_minutes`
4. `longest_sitting_streak_minutes`
5. `fatigue_level`
6. `age`
7. `bmi`
8. `sleep_hours`
9. `gender`
10. `work_type`
11. `fitness_level`
12. `device_preference`
13. `daily_work_hours`
14. `day_of_week`
15. `time_of_day_dominant`

Model TensorFlow akan mencerna 15 data ini secara bersamaan dan mengeluarkan hasil:

- **0 (Risiko Rendah)**: Skor kesehatan **tidak dikurangi** (Bahkan ditambah +5 jika _recovery_ bagus).
- **1 (Risiko Sedang)**: Skor kesehatan dikurangi **-10 poin**.
- **2 (Risiko Tinggi)**: Skor kesehatan dikurangi **-25 poin**.

Oleh karena itu, meskipun 2 pengguna sama-sama duduk 200 menit, model AI dapat memberikan **Risiko Sedang** kepada pengguna yang rajin olahraga, namun memberikan **Risiko Tinggi** kepada pengguna yang obesitas dan kurang tidur.

---

## 🚀 Cara Menjalankan Aplikasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan ketiga komponen MVP secara bersamaan:

### 1. Persiapan Database (PostgreSQL)

1. Pastikan PostgreSQL berjalan di komputer.
2. Buat _database_ dengan nama `healthy_posture`.
3. Gunakan _tool_ seperti pgAdmin atau `psql` untuk menjalankan _script_ pembuatan tabel.
4. Pastikan `server/.env` sudah diisi dengan kredensial yang tepat: `PGUSER=postgres`, `PGPASSWORD=...`, dll.

### 2. Menjalankan Backend (Node.js & Python Flask)

Karena _Backend_ Node.js sudah dikonfigurasi untuk menjalankan _Python Flask Server_ secara otomatis di _background_, kamu cukup menjalankan _server_ Node.js-nya saja.

```bash
cd server
npm install

# Jika belum menginstal module python (pastikan berada di dalam virtual environment):
# d:\healthy-posture-ai\venv\Scripts\activate
# pip install tensorflow flask flask-cors numpy

# Menjalankan backend (Otomatis menyalakan Node.js di port 5000 & Flask di port 5001)
npm run dev
```

### 3. Menjalankan Frontend (React)

Buka terminal baru (_split terminal_ di VSCode):

```bash
cd client
npm install

# Menjalankan frontend Vite
npm run dev
```

Aplikasi bisa diakses melalui browser di: `http://localhost:3000` (atau port default Vite `5173`, tergantung konfigurasi).

---

_Catatan: Pastikan file `healthy_posture_model.keras` dan `scaler.pkl` berada di dalam folder `server/ml_models/` agar Python ML Server bisa memuat AI Engine dengan benar._
