const express = require('express');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'REST API Sistem Monitoring & Kendali Otomatis Pintu Irigasi (Dinas SDA) Berjalan!'
    });
});

/**
 * 1. GET /api/pintu-irigasi
 * Mengambil status dan data seluruh pintu air.
 */
app.get('/api/pintu-irigasi', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pintu_irigasi');
        res.status(200).json({
            status: 'success',
            message: 'Berhasil mengambil data pintu irigasi',
            data: rows
        });
    } catch (error) {
        console.error('Error GET /api/pintu-irigasi:', error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data pintu irigasi',
            error: error.message
        });
    }
});

/**
 * 2. POST /api/telemetri
 * Menerima data sensor hulu (curah hujan), evaluasi ambang batas (> 20 mm/jam), 
 * dan otomatis buat rekomendasi bukaan pintu jika hujan lebat.
 */
app.post('/api/telemetri', async (req, res) => {
    try {
        const { id_stasiun, intensitas_hujan, id_pintu } = req.body;

        if (!id_stasiun || intensitas_hujan === undefined) {
            return res.status(400).json({
                status: 'fail',
                message: 'Field id_stasiun dan intensitas_hujan wajib diisi'
            });
        }

        // 1. Simpan log curah hujan ke database
        const [logResult] = await db.query(
            'INSERT INTO log_curah_hujan (id_stasiun, intensitas_hujan) VALUES (?, ?)',
            [id_stasiun, intensitas_hujan]
        );
        const id_log_hujan = logResult.insertId;

        let rekomendasiCreated = null;

        // 2. Evaluasi Ambang Batas Curah Hujan (> 20 mm/jam = Hujan Lebat/Siaga)
        if (parseFloat(intensitas_hujan) > 20) {
            const targetPintu = id_pintu || 1; // Default ke pintu ID 1 jika tidak ditentukan
            
            // Hitung saran persen bukaan pintu berdasarkan intensitas hujan
            let saran_persen_buka = 50;
            if (intensitas_hujan > 50) {
                saran_persen_buka = 100; // Siaga 1 / Sangat Lebat
            } else if (intensitas_hujan > 30) {
                saran_persen_buka = 75;  // Siaga 2 / Lebat
            }

            // 3. Masukkan ke tabel rekomendasi_sistem
            const [rekomendasiResult] = await db.query(
                `INSERT INTO rekomendasi_sistem (id_log_hujan, id_pintu, saran_persen_buka, status_respon) 
                 VALUES (?, ?, ?, 'MENUNGGU')`,
                [id_log_hujan, targetPintu, saran_persen_buka]
            );

            rekomendasiCreated = {
                id_rekomendasi: rekomendasiResult.insertId,
                id_pintu: targetPintu,
                saran_persen_buka: saran_persen_buka,
                status_respon: 'MENUNGGU',
                peringatan: `Intensitas hujan terdeteksi lebat (${intensitas_hujan} mm/jam)! Rekomendasi bukaan pintu dibuat.`
            };
        }

        res.status(201).json({
            status: 'success',
            message: 'Data telemetri curah hujan berhasil direkam',
            data: {
                id_log_hujan,
                id_stasiun,
                intensitas_hujan,
                rekomendasi: rekomendasiCreated
            }
        });

    } catch (error) {
        console.error('Error POST /api/telemetri:', error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal memproses data telemetri',
            error: error.message
        });
    }
});

/**
 * 3. GET /api/rekomendasi
 * Mengambil daftar rekomendasi aktif untuk aplikasi mobile / petugas.
 */
app.get('/api/rekomendasi', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.id_rekomendasi,
                r.saran_persen_buka,
                r.status_respon,
                l.intensitas_hujan,
                l.waktu_rekam,
                s.nama_lokasi AS lokasi_stasiun,
                p.kode_pintu,
                p.ketinggian_air,
                p.persen_buka AS persen_buka_saat_ini
            FROM rekomendasi_sistem r
            JOIN log_curah_hujan l ON r.id_log_hujan = l.id_log_hujan
            JOIN stasiun_hujan s ON l.id_stasiun = s.id_stasiun
            JOIN pintu_irigasi p ON r.id_pintu = p.id_pintu
            ORDER BY r.id_rekomendasi DESC
        `;
        const [rows] = await db.query(query);

        res.status(200).json({
            status: 'success',
            message: 'Berhasil mengambil daftar rekomendasi sistem',
            data: rows
        });
    } catch (error) {
        console.error('Error GET /api/rekomendasi:', error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data rekomendasi',
            error: error.message
        });
    }
});

/**
 * 4. POST /api/kendali-pintu
 * Menerima aksi eksekusi dari petugas untuk mengubah persentase bukaan pintu air.
 */
app.post('/api/kendali-pintu', async (req, res) => {
    try {
        const { id_pintu, id_pengguna, target_buka, id_rekomendasi } = req.body;

        if (!id_pintu || !id_pengguna || target_buka === undefined) {
            return res.status(400).json({
                status: 'fail',
                message: 'Field id_pintu, id_pengguna, dan target_buka wajib diisi'
            });
        }

        // 1. Update persentase bukaan di tabel pintu_irigasi
        await db.query(
            'UPDATE pintu_irigasi SET persen_buka = ? WHERE id_pintu = ?',
            [target_buka, id_pintu]
        );

        // 2. Catat riwayat aksi eksekusi di log_kendali_pintu
        const [logKendali] = await db.query(
            `INSERT INTO log_kendali_pintu (id_pintu, id_pengguna, target_buka, status_eksekusi) 
             VALUES (?, ?, ?, 'BERHASIL')`,
            [id_pintu, id_pengguna, target_buka]
        );

        // 3. Jika aksi ini merespon rekomendasi sistem, update status rekomendasinya
        if (id_rekomendasi) {
            await db.query(
                `UPDATE rekomendasi_sistem SET status_respon = 'DILAKSANAKAN' WHERE id_rekomendasi = ?`,
                [id_rekomendasi]
            );
        }

        res.status(200).json({
            status: 'success',
            message: 'Berhasil melakukan kendali bukaan pintu irigasi',
            data: {
                id_log_kendali: logKendali.insertId,
                id_pintu,
                id_pengguna,
                target_buka_baru: target_buka,
                status_eksekusi: 'BERHASIL'
            }
        });

    } catch (error) {
        console.error('Error POST /api/kendali-pintu:', error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengeksekusi kendali pintu irigasi',
            error: error.message
        });
    }
});

// Middleware Endpoint 404 (Not Found)
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: 'Endpoint tidak ditemukan'
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Server REST API Dinas SDA Berjalan di Port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
