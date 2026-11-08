# Tutorial terpandu

**Feature Branch:** feature-guided-tutorials

## Spesifikasi Teknis

Alur memperkenalkan rapat dan peserta yang disiapkan tanpa bergabung atau membuat rapat. Sesi online terautentikasi diperlukan.

Modul mendaftarkan alur dan teks terjemahannya melalui ctx. Host mengelola katalog, petunjuk, panah, sorotan, kendali papan ketik dan penunjuk, navigasi SPA dengan pemeriksaan akses, serta aksesibilitas. Menutup tutorial, berpindah halaman di luar alur, kehilangan akses atau menonaktifkan modul mengakhiri sesi. Kegagalan pemasangan penyedia membatalkan pendaftarannya.

Pengujian penyedia memeriksa kontrak publik, keempat terjemahan, aturan ketersediaan, pembersihan saat gagal, dan penolakan versi host yang tidak didukung.

## Kunjungan Awal Terikat Halaman

Host mengelola petunjuk, panah, sorotan, aksesibilitas, dan menu aksi mengambang bersama. Sesi pertama selalu menyediakan Berikutnya, tanpa Batal atau Lewati. Pemutaran ulang menyediakan Batal dengan `btn-cancel`. Penyelesaian disimpan di browser per akun. Navigasi, hilangnya akses, atau pelepasan penyedia mengakhiri sesi; pemasangan gagal membatalkan registrasi.

## Panduan Halaman

Cakupan meliputi persiapan pertemuan, kontrol panggilan, chat, dan berbagi, serta pemeriksaan dan tinjauan pengakhiran atau penghapusan khusus administrator.

## Kunci Tutorial Deskriptif

Kunci terjemahan langkah tutorial dan pengenal sasaran menjelaskan topiknya, bukan posisinya dalam panduan. Kunci yang sama tersedia dalam keempat bahasa yang didukung.

## Petunjuk Yang Berguna

Langkah tutorial berfokus pada kontrol dan tugas yang tersedia, tanpa pernyataan yang tidak relevan tentang izin atau tindakan yang tidak dilakukan panduan.

## Tentukan isyarat Berikutnya per langkah

Setiap langkah tutorial kini menetapkan `highlightNext` secara eksplisit: penjelasan yang memerlukan Berikutnya atau Selesai mengaktifkannya, sedangkan latihan berbasis interaksi atau penantian menonaktifkannya. Pengurangan gerakan mempertahankan garis tepi statis.

Setiap komponen antarmuka wajib dicakup tutorial. Panduan kontribusi mengharuskan alur tugas yang berfokus pada pengguna dan peninjauan tutorial setiap kali fitur atau perilaku antarmuka berubah.

## Target tepat dan pengulangan cabang

Penjelasan siklus rapat menyoroti kontrol Akhiri atau Hapus yang ditampilkan. Target pertama yang dapat digunakan dipilih dalam bagian tutorial; langkah dilewati jika tidak ada kontrol yang cocok.

## Wilayah tutorial yang terlihat

Wilayah tutorial dan isyarat Berikutnya ditetapkan secara eksplisit.

## Antrean menu mengambang bersama

Menu mengikuti antrean host bersama dan masa hidup komponen.

## Kontrol pemulihan yang didokumentasikan

Tampilan target hilang menyediakan Berikutnya dan Mulai Ulang Tutorial; pemutaran ulang juga menyediakan Batal.

## Hapus Fixture Demo Peramban

Fixture peramban tutorial mandiri dihapus; pengujian otomatis penyedia dan modul tetap dipertahankan.

## Panduan tutorial terarah

Tutorial menjelaskan kontrol terlihat yang berbeda sesuai urutan UI. Petunjuk bersama mencakup penemuan tampilan aktif, contoh stabil, keadaan kosong, cabang bersyarat, dan pembersihan siklus hidup. Kontrol pemutaran ulang serta dokumentasi pengurangan gerakan sesuai host bersama.

## Panduan Terarah

Panduan rapat menyorot seluruh panel peserta terlebih dahulu dan bagian peserta tersedia pada tahap pemilihan peserta.

## Chat Rapat Opsional

Langkah chat rapat dihilangkan dari alur dan jumlah langkah selama chat tidak tersedia.

## Komit

- [2ca1e32](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2ca1e3292d5c02ae229f8a5652b40929b0272219)
- [d051ae2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d051ae21ab8a123834e74ef86d24e14809d77e4b)
- [15730bd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/15730bdfee1eb85b53cc208310add93bf7a14704)
- [f9a767f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f9a767f19179e0e1b5bfbf981bd634d2e2d684f9)
- [6678445](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/66784457b47bd835d947f862890365272f5d6e16)
- [2fada40](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2fada407ffe66e9590f037ce6f500e5a5e2cd158)
- [1235d37](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1235d37629580ae9bdde13c07520a783a1c81949)
- [dcf444a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dcf444aafe4e88fc1d5b21064c6356013c8e3900)
- [e422908](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e4229088d211facd06d3464ee1e578f4eda7a8b7)
- [986caf0e7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/986caf0e74d203cb5b86092892fbdb75871853bd)
- [b7c4f6886](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b7c4f68864ea21dee0150186c1509e428df28a7b)
- [2e99cf649](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2e99cf649345992d41f19a9179c83153b6dfabd6)
- [d6f10af07](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f10af071009f75e9f52526a01d59cb6987714c)
