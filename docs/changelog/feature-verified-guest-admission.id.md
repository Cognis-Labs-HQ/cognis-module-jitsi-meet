# Penerimaan tamu terverifikasi

**Cabang fitur:** `feature-verified-guest-admission`

## Penerimaan tamu terverifikasi

Rute sumber daya rapat memperoleh klaim tamu terverifikasi melalui `share:getGuestClaims` sebelum menerapkan pemeriksaan rapat dan kapabilitas yang sudah ada. Klaim lengkap diteruskan ke Share melalui `ctx`; subjek yang diawali `share:` tidak menandakan tamu. Kredensial dan izin yang hilang, dicabut, atau kedaluwarsa tidak beralih ke akses akun. Rute akun dan pengelolaan tetap memerlukan sesi, termasuk pembatasan sesi yang belum selesai.

Modul memerlukan kapabilitas Share untuk penerimaan tamu terverifikasi, identitas tamu, dan otorisasi sumber daya. Instal kontrak host Auth/Share yang sesuai sebelum modul ini. Rute campuran tamu melakukan autentikasi dalam penanganannya, bukan melalui penjaga rute host yang hanya menerima sesi; setiap rapat tujuan tetap diperiksa. Pemeriksaan delegasi Whiteboard dan izin bergabung rapat tetap berlaku.

Saat tamu mulai, sumber daya UI dan ketersediaan Whiteboard dimuat hanya untuk rapat yang diizinkan, dengan kredensial dalam konteks permintaan, bukan URL. Rapat tamu yang sudah ada tidak menjalankan pemeriksaan awal global khusus akun. Data tamu tidak mewarisi kontrol autentikasi pembuat; kata sandi rapat tetap terbatas pada respons bergabung yang telah diotorisasi.

## Komit

- [ea6b331](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ea6b331722d3b7f709431a9b30c4e6cb1e517ee5)
