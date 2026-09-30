-- Database: db_irigasi_sda

CREATE DATABASE IF NOT EXISTS `db_irigasi_sda`;
USE `db_irigasi_sda`;

-- 1. Tabel stasiun_hujan
CREATE TABLE IF NOT EXISTS `stasiun_hujan` (
  `id_stasiun` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_stasiun` VARCHAR(50) NOT NULL UNIQUE,
  `nama_lokasi` VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel log_curah_hujan
CREATE TABLE IF NOT EXISTS `log_curah_hujan` (
  `id_log_hujan` INT AUTO_INCREMENT PRIMARY KEY,
  `id_stasiun` INT NOT NULL,
  `intensitas_hujan` FLOAT NOT NULL,
  `waktu_rekam` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_stasiun`) REFERENCES `stasiun_hujan`(`id_stasiun`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel pintu_irigasi
CREATE TABLE IF NOT EXISTS `pintu_irigasi` (
  `id_pintu` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_pintu` VARCHAR(50) NOT NULL UNIQUE,
  `ketinggian_air` FLOAT NOT NULL DEFAULT 0.0,
  `persen_buka` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel rekomendasi_sistem
CREATE TABLE IF NOT EXISTS `rekomendasi_sistem` (
  `id_rekomendasi` INT AUTO_INCREMENT PRIMARY KEY,
  `id_log_hujan` INT NOT NULL,
  `id_pintu` INT NOT NULL,
  `saran_persen_buka` INT NOT NULL,
  `status_respon` ENUM('MENUNGGU', 'DILAKSANAKAN', 'DITOLAK') DEFAULT 'MENUNGGU',
  FOREIGN KEY (`id_log_hujan`) REFERENCES `log_curah_hujan`(`id_log_hujan`) ON DELETE CASCADE,
  FOREIGN KEY (`id_pintu`) REFERENCES `pintu_irigasi`(`id_pintu`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel pengguna
CREATE TABLE IF NOT EXISTS `pengguna` (
  `id_pengguna` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `peran` VARCHAR(50) NOT NULL DEFAULT 'petugas',
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel log_kendali_pintu
CREATE TABLE IF NOT EXISTS `log_kendali_pintu` (
  `id_log_kendali` INT AUTO_INCREMENT PRIMARY KEY,
  `id_pintu` INT NOT NULL,
  `id_pengguna` INT NOT NULL,
  `target_buka` INT NOT NULL,
  `status_eksekusi` ENUM('BERHASIL', 'GAGAL', 'PROSES') DEFAULT 'BERHASIL',
  `waktu_eksekusi` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_pintu`) REFERENCES `pintu_irigasi`(`id_pintu`) ON DELETE CASCADE,
  FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna`(`id_pengguna`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data Awal untuk Testing
INSERT INTO `stasiun_hujan` (`id_stasiun`, `kode_stasiun`, `nama_lokasi`) VALUES
(1, 'ST-HULU-01', 'Stasiun Bendung Hulu A'),
(2, 'ST-HULU-02', 'Stasiun Hulu Ciliwung B')
ON DUPLICATE KEY UPDATE `nama_lokasi`=VALUES(`nama_lokasi`);

INSERT INTO `pintu_irigasi` (`id_pintu`, `kode_pintu`, `ketinggian_air`, `persen_buka`) VALUES
(1, 'PINTU-UTAMA-01', 1.2, 25),
(2, 'PINTU-PEMBUANG-02', 2.5, 50)
ON DUPLICATE KEY UPDATE `ketinggian_air`=VALUES(`ketinggian_air`);

INSERT INTO `pengguna` (`id_pengguna`, `nama`, `peran`, `username`, `password`) VALUES
(1, 'Budi Santoso', 'Petugas Lapangan', 'budi_petugas', 'password123'),
(2, 'Siti Rahma', 'Operator SDA', 'siti_operator', 'password123')
ON DUPLICATE KEY UPDATE `nama`=VALUES(`nama`);
