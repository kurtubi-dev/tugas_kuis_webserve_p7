# Sistem Monitoring & Kendali Otomatis Pintu Irigasi Terintegrasi Stasiun Curah Hujan (Dinas SDA)

Project REST API Web Service untuk Sistem Monitoring Curah Hujan dan Kendali Pintu Air Irigasi Otomatis (Tugas Pertemuan 7 - Web Service).

---

## 🚀 Tech Stack
- **Node.js** & **Express.js**
- **MySQL Database**
- **dotenv** & **mysql2**

---

## 🗄️ Database Setup
1. Buat database MySQL baru dan import file `schema.sql` (atau jalankan script DDL yang ada di dalamnya):
   ```sql
   CREATE DATABASE db_irigasi_sda;
   ```
2. Atur konfigurasi kredensial database pada file `.env`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_irigasi_sda
   DB_PORT=3306
   ```

---

## 🛠️ Cara Menjalankan Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Jalankan server Express:
   ```bash
   npm start
   ```
   *Server akan berjalan di `http://localhost:3000`.*

---

## 📡 Dokumentasi & Contoh Endpoints REST API

### 1. Server Health Check
- **Endpoint**: `GET /`
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "REST API Sistem Monitoring & Kendali Otomatis Pintu Irigasi (Dinas SDA) Berjalan!"
  }
  ```

---

### 2. Mengambil Data Status Pintu Air
- **Endpoint**: `GET /api/pintu-irigasi`
- **Deskripsi**: Mengambil status ketinggian air dan persentase bukaan pintu irigasi saat ini.
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Berhasil mengambil data pintu irigasi",
    "data": [
      {
        "id_pintu": 1,
        "kode_pintu": "PINTU-UTAMA-01",
        "ketinggian_air": 1.2,
        "persen_buka": 25
      },
      {
        "id_pintu": 2,
        "kode_pintu": "PINTU-PEMBUANG-02",
        "ketinggian_air": 2.5,
        "persen_buka": 50
      }
    ]
  }
  ```

---

### 3. Menerima Data Telemetri Curah Hujan
- **Endpoint**: `POST /api/telemetri`
- **Content-Type**: `application/json`
- **Contoh Request Body**:
  ```json
  {
    "id_stasiun": 1,
    "intensitas_hujan": 35.5,
    "id_pintu": 1
  }
  ```
- **Deskripsi**: Mencatat data curah hujan. Jika `intensitas_hujan > 20 mm/jam`, sistem **otomatis** membuat rekomendasi bukaan pintu air dengan status `MENUNGGU`.
- **Contoh Respon (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Data telemetri curah hujan berhasil direkam",
    "data": {
      "id_log_hujan": 5,
      "id_stasiun": 1,
      "intensitas_hujan": 35.5,
      "rekomendasi": {
        "id_rekomendasi": 2,
        "id_pintu": 1,
        "saran_persen_buka": 75,
        "status_respon": "MENUNGGU",
        "peringatan": "Intensitas hujan terdeteksi lebat (35.5 mm/jam)! Rekomendasi bukaan pintu dibuat."
      }
    }
  }
  ```

---

### 4. Mengambil Daftar Rekomendasi Aktif
- **Endpoint**: `GET /api/rekomendasi`
- **Deskripsi**: Mengambil daftar rekomendasi sistem beserta detail stasiun hujan dan pintu irigasi terkait.
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Berhasil mengambil daftar rekomendasi sistem",
    "data": [
      {
        "id_rekomendasi": 2,
        "saran_persen_buka": 75,
        "status_respon": "MENUNGGU",
        "intensitas_hujan": 35.5,
        "waktu_rekam": "2026-09-30T22:15:00.000Z",
        "lokasi_stasiun": "Stasiun Bendung Hulu A",
        "kode_pintu": "PINTU-UTAMA-01",
        "ketinggian_air": 1.2,
        "persen_buka_saat_ini": 25
      }
    ]
  }
  ```

---

### 5. Eksekusi Kendali Pintu Air oleh Petugas
- **Endpoint**: `POST /api/kendali-pintu`
- **Content-Type**: `application/json`
- **Contoh Request Body**:
  ```json
  {
    "id_pintu": 1,
    "id_pengguna": 1,
    "target_buka": 75,
    "id_rekomendasi": 2
  }
  ```
- **Deskripsi**: Mengubah persentase bukaan pintu di `pintu_irigasi`, mencatat riwayat eksekusi di `log_kendali_pintu`, dan mengupdate status rekomendasi terkait menjadi `DILAKSANAKAN`.
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Berhasil melakukan kendali bukaan pintu irigasi",
    "data": {
      "id_log_kendali": 1,
      "id_pintu": 1,
      "id_pengguna": 1,
      "target_buka_baru": 75,
      "status_eksekusi": "BERHASIL"
    }
  }
  ```
