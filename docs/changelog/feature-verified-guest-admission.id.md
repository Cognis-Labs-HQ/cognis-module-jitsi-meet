# Penerimaan tamu terverifikasi

**Cabang fitur:** `feature-verified-guest-admission`

## Penerimaan tamu terverifikasi

Rute sumber daya rapat memperoleh klaim tamu terverifikasi melalui `share:getGuestClaims` sebelum menerapkan pemeriksaan rapat dan kapabilitas yang sudah ada. Klaim lengkap diteruskan ke Share melalui `ctx`; subjek yang diawali `share:` tidak menandakan tamu. Kredensial dan izin yang hilang, dicabut, atau kedaluwarsa tidak beralih ke akses akun. Rute akun dan pengelolaan tetap memerlukan sesi, termasuk pembatasan sesi yang belum selesai.

Modul memerlukan kapabilitas Share untuk penerimaan tamu terverifikasi, identitas tamu, dan otorisasi sumber daya. Instal kontrak host Auth/Share yang sesuai sebelum modul ini. Rute campuran tamu melakukan autentikasi dalam penanganannya, bukan melalui penjaga rute host yang hanya menerima sesi; setiap rapat tujuan tetap diperiksa. Pemeriksaan delegasi Whiteboard dan izin bergabung rapat tetap berlaku.

Saat tamu mulai, sumber daya UI dan ketersediaan Whiteboard dimuat hanya untuk rapat yang diizinkan, dengan kredensial dalam konteks permintaan, bukan URL. Rapat tamu yang sudah ada tidak menjalankan pemeriksaan awal global khusus akun. Data tamu tidak mewarisi kontrol autentikasi pembuat; kata sandi rapat tetap terbatas pada respons bergabung yang telah diotorisasi.

## Komit

- [fd67a8b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/fd67a8bfe2cff29e397ebeefdf9d07d14ba8d295)
- [aeb80de](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/aeb80dea9e72a3c5b56217a1583b64cc440622a5)
