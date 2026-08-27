# Modul Jitsi Meet

[English](README.en.md) · [Deutsch](README.de.md) · **Bahasa Indonesia** · [日本語](README.ja.md)

Repositori ini berisi modul eksternal Jitsi Meet untuk Cognis. Modul ini menyediakan pembuatan dan akses rapat video, moderasi, pengelolaan peserta, integrasi obrolan rapat, serta berbagi akses tamu dengan cakupan terbatas.

## Instalasi

Tambahkan repositori ini melalui **Modul → Sumber Modul** di Cognis, pasang modul, tinjau kapabilitas dan dependensi yang diminta, lalu aktifkan secara terpisah. Aktivasi mendaftarkan rute aplikasi `/meetings` dan `/meeting`, entri navigasi Rapat, bagian administrasi, aset peramban statis, API, kapabilitas, dan hook flow. Penonaktifan menghapus kontribusi bercakupan tersebut. Atur URL instans Jitsi melalui popup Pengaturan modul yang terpasang. Cognis merender bidang yang dideklarasikan dalam manifest, sedangkan modul ini memvalidasi dan menyimpan perubahan melalui endpoint konfigurasi GET dan PUT.

## Kapabilitas dan dependensi

Modul menerbitkan `meeting:video`, `meeting:chat`, dan `meeting:moderation`. Integrasi runtime diselesaikan melalui kapabilitas dan flow `ctx` Cognis. Manifest mendeklarasikan dependensi berbasis UUID pada gateway Sosial, adaptor Profil, gateway Berbagi, dan adaptor Pesan, beserta kebutuhan kapabilitas runtime yang lebih sempit. Tidak diperlukan impor paket internal atau pohon sumber Cognis.

## Pengembangan

Jalankan `npm install`, lalu `npm test`. Pengujian dan kode runtime hanya memakai jalur modul relatif terhadap repositori sehingga rangkaian pengujian dapat berjalan di luar monorepo Cognis. Manifest menerbitkan `ui.stringsBaseUrl` agar Cognis dapat menyelesaikan metadata modul yang dilokalkan sebelum UI perambannya dimuat.

## Keamanan

Gunakan penerapan Jitsi HTTPS yang tepercaya. Akses API rapat diautentikasi, catatan rapat dibatasi untuk peserta, kata sandi dibuat untuk setiap rapat, dan akses tamu dibatasi oleh kapabilitas berbagi bercakupan. Tinjau repositori dan digest berkas yang dideklarasikan sebelum mengaktifkannya.
