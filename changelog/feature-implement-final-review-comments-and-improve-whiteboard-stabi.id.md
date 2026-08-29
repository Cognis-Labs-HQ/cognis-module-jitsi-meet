# Terapkan komentar tinjauan akhir dan tingkatkan stabilitas Papan Tulis

Status Papan Tulis kini hanya berlaku untuk sesi rapat aktif, kanvas persisten tidak lagi terbuka hanya karena rapat dimulai, dan mengakhiri atau memulai ulang rapat akan menghapus status bukanya. Halaman komponen diminta satu kali untuk setiap mount rapat, percobaan ulang pemasangan tetap dibatasi, dan jendela asinkron lama dibuang ketika navigasi atau status rapat membuat permintaannya tidak berlaku.

Kontrol Papan Tulis kini tetap dinonaktifkan dengan label normal selama akses keyring atau pemasangan komponen berlangsung. Label berubah menjadi “Tutup Papan Tulis” hanya setelah jendela komponen berhasil dipasang, dan pemasangan lama yang dibatalkan tidak lagi menampilkan toast kegagalan yang menyesatkan.

Catatan rilis untuk pull request ini kini memakai tepat satu set changelog terlokalisasi yang dinamai sesuai cabang fitur. Petunjuk kontribusi menetapkan nama file sebagai catatan cabang dan mewajibkan satu paragraf prosa terjemahan untuk setiap commit dalam urutan kronologis, bukan blok metadata terpisah yang berbeda dari format changelog yang sudah digunakan.
