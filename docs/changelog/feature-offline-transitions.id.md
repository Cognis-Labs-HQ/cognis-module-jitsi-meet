# Tangani koneksi terputus saat pencarian ruang

**Cabang Fitur:** feature-offline-transitions

## Tangani koneksi terputus saat pencarian ruang

Pencarian ruang menghentikan polling setelah kegagalan jaringan dan menangani penolakan promise pewaktu. Permintaan luring dan yang dibatalkan tidak memunculkan toast kesalahan pencarian atau menghapus daftar ruang terakhir. Modul menggunakan kapabilitas status luring host yang opsional dan mengikat pembersihan pada sinyal halaman. Polling kehadiran dan status ruang aktif mengikuti siklus hidup yang sama dan berhenti bersama setelah permintaan latar belakang gagal.

## Komit
- [aa0931e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/aa0931ebfe17662ccef1c95a507bc065d24f0fdd)
