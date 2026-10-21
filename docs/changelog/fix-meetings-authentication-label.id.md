# Pulihkan Label Rapat

**Cabang Fitur:** fix-meetings-authentication-label

## Pulihkan Tombol Autentikasi

1.5.262 — Tampilan Rapat kini menyediakan label tombol autentikasi dalam keempat bahasa yang didukung. Pengujian regresi merender elemen halaman menggunakan katalog bahasa sebenarnya agar terjemahan templat yang hilang terdeteksi sebelum rilis.

## Periksa Cakupan Terjemahan

Referensi string modul, label manifes, serta filter, masalah, tindakan, dan konfirmasi administrasi yang dipilih secara dinamis diperiksa menggunakan keempat katalog bahasa sebenarnya. Audit tidak menemukan definisi saat jalan lain yang hilang; contoh notifikasi kini memakai kunci yang tersedia.

## Komit

- [feedcc1c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/feedcc1cd007336610fa8c1be6287c6589544f58)
