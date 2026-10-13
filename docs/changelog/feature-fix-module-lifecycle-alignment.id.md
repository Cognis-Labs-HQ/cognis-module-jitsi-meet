# Menyelaraskan Jitsi Meet dengan siklus hidup modul yang diperketat

**Cabang Fitur:** feature-fix-module-lifecycle-alignment

## Memulihkan aktivasi modul yang aman

Jitsi Meet kini memperoleh konteks browser host dari bus kapabilitas global yang sengaja disediakan, bukan dengan mengimpor modul internal Cognis. Dengan demikian, modul dapat lolos validasi batas modul eksternal yang diperketat.

## Mendukung konfigurasi sebelum aktivasi

Entrypoint API terbatas untuk modul nonaktif hanya mendaftarkan endpoint konfigurasi yang secara eksplisit diizinkan sebelum aktivasi. Administrator dapat mengonfigurasi Jitsi tanpa mengaktifkan rute fitur, kontribusi UI, alur, atau kapabilitas.

## Menggunakan pendaftaran konfigurasi bersama secara konsisten

Entrypoint API aktif dan nonaktif kini menggunakan lapisan pendaftaran konfigurasi yang sama, mengikuti pola siklus hidup Nextcloud Whiteboard. Validasi konfigurasi, autentikasi, pengujian keterjangkauan, pendaftaran asal CSP, pengujian aktivasi, dan respons saat dependensi tidak tersedia tetap konsisten dalam kedua keadaan.

## Menolak artefak API lintas modul

Pemindaian sumber mandiri kini menolak setiap JavaScript yang dipaketkan jika mengakses ruang nama API selain `jitsi-meet`. Hal ini mencegah berkas tersesat, seperti artefak pengujian batas Analytics, masuk ke rilis Jitsi dan menghalangi aktivasi.

## Commit

- [3335e1f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3335e1fe833be67ee047c2e307ef0a5780e973c6)
- [2e52a5a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2e52a5ac0a26a29a582542ac97a11f7f3139dc29)
- [ffe2d69](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ffe2d69c4cf489d3ff7c74b908113d816407084d)
- [b4de176](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b4de176d18b64ace9d0111a2de3d5fdb15b80896)
- [3d8b764](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3d8b764216e151e6723451d6d6bf4db9fb9bf9f9)
