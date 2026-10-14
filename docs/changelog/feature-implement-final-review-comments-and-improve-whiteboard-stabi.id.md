# Papan Tulis rapat yang stabil

**Cabang Fitur:** feature-implement-final-review-comments-and-improve-whiteboard-stabi

## Batasi status Papan Tulis pada sesi rapat

Kanvas persisten tidak lagi terbuka hanya karena rapat dimulai. Mengakhiri atau memulai ulang rapat akan menghapus status bukanya, dan peserta hanya memasang kanvas yang secara eksplisit ditandai terbuka oleh sesi aktif.

## Buat pemasangan komponen dapat diprediksi

Halaman komponen diminta satu kali untuk setiap mount rapat dan percobaan ulang pemasangan tetap dibatasi. Kontrol Papan Tulis tetap dinonaktifkan dengan label normal selama akses keyring atau pemasangan berlangsung, berubah menjadi “Tutup Papan Tulis” hanya setelah pemasangan berhasil, dan membuang jendela asinkron lama tanpa toast kegagalan yang menyesatkan.

## Selaraskan asal catatan rilis dengan Cognis

Pull request memakai tepat satu set changelog terlokalisasi yang dinamai sesuai cabang fiturnya. Setiap perubahan memiliki judul ringkasan rilis dan penjelasan lengkap, lalu diikuti tautan repositori lengkap untuk commit implementasi, sesuai Cognis core dan modul eksternal di sekitarnya.

## Komit

- [7141534](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7141534703ebe3f38581e748172c38e5e990baa6)
- [12ad748](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12ad7488915d047a891307f37b16964c2c239f42)
- [b1d430d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1d430d91e19abe31a348f9749dc386df07c6a6c)
- [fe48d89](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/fe48d89a5447460c40f45dc4192962c2b6b2d554)
- [6d87f99](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6d87f998c14b17fa4f3a567d86fd64279b79379b)
