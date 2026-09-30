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

## 📡 Dokumentasi Endpoints REST API (GET, POST, PUT, DELETE)

### 🔵 1. Method GET

#### A. Server Health Check
- **URL**: `GET /`
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "REST API Sistem Monitoring & Kendali Otomatis Pintu Irigasi (Dinas SDA) Berjalan!"
  }
  ```

#### B. Mengambil Data Status Pintu Air
- **URL**: `GET /api/pintu-irigasi`
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
      }
    ]
  }
  ```

#### C. Mengambil Daftar Rekomendasi Aktif
- **URL**: `GET /api/rekomendasi`
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Berhasil mengambil daftar rekomendasi sistem",
    "data": [
      {
        "id_rekomendasi": 1,
        "saran_persen_buka": 75,
        "status_respon": "MENUNGGU",
        "intensitas_hujan": 35.5,
        "waktu_rekam": "2026-09-30T22:15:00.000Z",
        "lokasi_stasiun": "Stasiun Bendung Hulu A",
        "kode_pintu": "PINTU-UTAMA-01"
      }
    ]
  }
  ```

---

### 🟢 2. Method POST

#### A. Menerima Data Telemetri Curah Hujan
- **URL**: `POST /api/telemetri`
- **Request Body (JSON)**:
  ```json
  {
    "id_stasiun": 1,
    "intensitas_hujan": 35.5,
    "id_pintu": 1
  }
  ```
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

#### B. Eksekusi Kendali Pintu Air oleh Petugas
- **URL**: `POST /api/kendali-pintu`
- **Request Body (JSON)**:
  ```json
  {
    "id_pintu": 1,
    "id_pengguna": 1,
    "target_buka": 75,
    "id_rekomendasi": 2
  }
  ```
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

---

### 🟡 3. Method PUT

#### A. Memperbarui Data Pintu Irigasi
- **URL**: `PUT /api/pintu-irigasi/:id`
- **Request Body (JSON)**:
  ```json
  {
    "ketinggian_air": 2.8,
    "persen_buka": 80
  }
  ```
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Berhasil memperbarui data pintu irigasi",
    "data": {
      "id_pintu": 1,
      "kode_pintu": "PINTU-UTAMA-01",
      "ketinggian_air": 2.8,
      "persen_buka": 80
    }
  }
  ```

#### B. Memperbarui Status Rekomendasi
- **URL**: `PUT /api/rekomendasi/:id`
- **Request Body (JSON)**:
  ```json
  {
    "status_respon": "DITOLAK"
  }
  ```
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Berhasil memperbarui status rekomendasi",
    "data": {
      "id_rekomendasi": 1,
      "status_respon_baru": "DITOLAK"
    }
  }
  ```

---

### 🔴 4. Method DELETE

#### A. Menghapus Data Pintu Irigasi
- **URL**: `DELETE /api/pintu-irigasi/:id`
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Pintu irigasi dengan ID 1 berhasil dihapus"
  }
  ```

#### B. Menghapus Rekomendasi Sistem
- **URL**: `DELETE /api/rekomendasi/:id`
- **Contoh Respon (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Rekomendasi dengan ID 1 berhasil dihapus"
  }
  ```
