# Sistem Monitoring & Kendali Otomatis Pintu Irigasi Terintegrasi Stasiun Curah Hujan (Dinas SDA)

Project REST API Web Service untuk Sistem Monitoring Curah Hujan dan Kendali Pintu Air Irigasi Otomatis (Pertemuan 7 - Web Service).

## 🚀 Tech Stack
- **Node.js** & **Express.js**
- **MySQL Database**
- **dotenv** & **mysql2**

## 🗄️ Database Setup
1. Import file `schema.sql` ke database MySQL Anda (`db_irigasi_sda`).
2. Salin file `.env.example` atau atur kredensial database di `.env`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_irigasi_sda
   DB_PORT=3306
   ```

## 🛠️ Cara Menjalankan Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Jalankan server:
   ```bash
   npm start
   ```

## 📡 Endpoints REST API
- `GET /` — Server Health Check
- `GET /api/pintu-irigasi` — Mengambil data & status pintu air
- `POST /api/telemetri` — Menerima data curah hujan & auto-generate rekomendasi (>20 mm/jam)
- `GET /api/rekomendasi` — Mengambil daftar rekomendasi aktif
- `POST /api/kendali-pintu` — Eksekusi bukaan pintu air oleh petugas
