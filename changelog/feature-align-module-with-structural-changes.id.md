# Menyelaraskan Jitsi Meet dengan Runtime Modul Tercakup

**Cabang Fitur:** feature-align-module-with-structural-changes

## Menggunakan Konteks yang Tercakup dalam Siklus Hidup

Jitsi Meet kini memperoleh kapabilitas serta menjalankan atau memperluas alur host langsung melalui konteks modulnya yang tercakup. Pengelolaan berbagi, pembersihan akun, integrasi Papan Tulis, pemeriksaan pengaktifan konfigurasi, dan kait penyedia tidak lagi bergantung pada konteks sistem privat, sehingga siklus penonaktifan dan pengaktifan ulang tetap sepenuhnya dilacak oleh Cognis.

## Mendeklarasikan Kontrak Integrasi Terkini

Manifes kini mempertahankan modul tanpa hak istimewa dan menerbitkan kapabilitas browser melalui katalog penyedia yang tercakup siklus hidup, menggunakan Bootstrap sebagai satu-satunya titik masuk runtime, serta menyinkronkan versi 1.5.221 dan seluruh digest berkas yang dideklarasikan. Pengujian struktural mencakup batas baru tersebut.

## Menjaga Kontrol Overlay yang Tidak Aktif Tetap Tersembunyi

Lobi rapat kini memberlakukan perilaku status HTML tersembunyi di dalam permukaan modul sehingga aturan tampilan tombol host tidak dapat menampilkan kontrol autentikasi, pengambilalihan, keluar, atau tetap berada dalam rapat sebelum status rapat yang sesuai. Versi rilis dan digest integritas disinkronkan pada 1.5.221.

## Memulihkan Penemuan Nextcloud Whiteboard

Jitsi kini menyelesaikan kapabilitas server yang diterbitkan modul Nextcloud Whiteboard terkini. Endpoint ketersediaan kembali mengenali penyedia yang aktif sehingga tombol Whiteboard rapat, verifikasi papan, pembaruan keanggotaan, dan pembersihan dipulihkan.

## Memuat Penyedia UI Khusus

Jitsi kini mendeklarasikan `whiteboard:uiGateway` sebagai persyaratan kapabilitas browser opsional. Cognis dapat memuat penyedia khusus yang diperkenalkan oleh perubahan Nextcloud Whiteboard terbaru sebelum memasang Meetings, tanpa bergantung pada bilah navigasi Whiteboard untuk menginisialisasi pabrik kanvas.

## Menggunakan Penemuan Penyedia Browser untuk Visibilitas

Setelah Cognis PR #222 membuat pendaftaran penyedia kapabilitas eksternal mengikuti siklus hidup, kontrol Meetings kini memakai `whiteboard:uiGateway` yang telah dimuat secara langsung dan tidak lagi menghapus dirinya berdasarkan permintaan ketersediaan backend terpisah. Endpoint backend tetap tersedia untuk diagnosis.

## Gunakan Kontrak Whiteboard yang Dideklarasikan Penyedia

Jitsi kini menyelesaikan `whiteboard:fetchBoardData`, `whiteboard:membership`, dan `whiteboard:deleteCanvas`, yaitu kapabilitas yang dideklarasikan manifes Nextcloud Whiteboard terkini. Jitsi tidak lagi bergantung pada fasad implementasi `whiteboard:api` yang tidak dideklarasikan sehingga verifikasi server dan Whiteboard rapat tersinkron dipulihkan.

## Inisialisasi Runtime Browser yang Diekspos

Mengikuti Cognis PR #224, titik masuk browser Meetings mengimpor sumber daya runtime `/static/reuse/ui-ctx.js` yang diekspos deployment agar pemuatan langsung dan penyegaran menginisialisasi konteks yang sama dengan navigasi SPA. Utilitas browser lain tetap diselesaikan melalui `ui:reuse`; Jitsi kini memakai `ctx.registerCapabilityProvider` untuk `voip:startCall`, menghapus kapabilitas `meetings:isProviderAvailable` yang berlebihan, dan tidak meminta akses istimewa.

## Pertahankan Integrasi Whiteboard sebagai Opsional

Jitsi hanya menyelesaikan kapabilitas verifikasi, keanggotaan, dan penghapusan Whiteboard ketika penyedia opsional diaktifkan. Kapabilitas server tersebut tidak lagi menghalangi pengaktifan Jitsi, sedangkan `whiteboard:uiGateway` tetap menjadi kontrak penemuan penyedia peramban.

## Deklarasikan Dependensi Runtime Basis Data

Jitsi kini mendeklarasikan `db:executor`, yang diperlukan oleh rute konfigurasi saat nonaktif, pengujian pengaktifan, dan penyimpanan rapat saat aktif. Cognis dapat menginisialisasi penyedia basis data sebelum mendaftarkan `/config`, sehingga konfigurasi tidak lagi kembali ke HTTP 503 dan validasi pengaktifan dapat memeriksa URL Jitsi yang tersimpan.

## Pertahankan Kapabilitas Server dalam Namespace Modul

Resolver chat rapat terautentikasi kini diterbitkan sebagai `jitsi-meet:getMeetingChat`. Dengan demikian, setiap kapabilitas yang disumbangkan Jitsi tetap berada dalam namespace milik modul dan lolos validasi batas Cognis tanpa akses istimewa.

## Memperbarui Rapat Tersimpan Setelah Penghapusan Akun

Ketika Cognis menghapus akun, Jitsi kini menghapus akun tersebut dari catatan peserta aktif dan peserta asli. Kunci rapat yang dapat digunakan kembali diperbarui untuk daftar tersimpan yang tersisa, sedangkan rapat dengan kurang dari dua peserta tersimpan akan dihapus.

## Menunda Pemuatan Penyedia Whiteboard Opsional

Meetings tidak lagi mendeklarasikan gateway Whiteboard browser opsional sebagai persyaratan tingkat rute. Pemuatan langsung dan penyegaran kini memungkinkan Cognis menginisialisasi konteks UI sebelum Jitsi menemukan dan memuat penyedia Whiteboard, sementara navigasi SPA dan kontrol Whiteboard tetap menggunakan kontrak gateway yang sama.

## Menyelesaikan Kapabilitas Whiteboard dari Registry Tercakup

Diselaraskan dengan kontrak pendaftaran terbaru dari PR #30 Nextcloud Whiteboard. Jitsi kini menyelesaikan penyedia verifikasi papan, keanggotaan, penghapusan, dan akses terdelegasi secara dinamis melalui `ctx.capabilities`, sehingga penyedia yang dikontribusikan setelah bootstrap Jitsi tersedia untuk `/whiteboard/state`.

## Menyelesaikan Kedua Permukaan Akses Kapabilitas Publik

Jitsi kini mencerminkan perilaku pendaftaran terbaru PR #30 Nextcloud Whiteboard dengan menyelesaikan penyedia server opsional terlebih dahulu dari registry tercakup lalu dari pengakses konteks modul. Ini mencakup penyedia yang didaftarkan melalui salah satu permukaan publik yang mengikuti siklus hidup dan mencegah kanvas yang berhasil dibuat langsung gagal saat verifikasi pemetaan.

## Memulihkan Kontrak Penyedia Langsung

Mengikuti PR #30 Nextcloud Whiteboard, Jitsi kembali menggunakan kapabilitas publik spesifik `whiteboard:*` secara langsung melalui konteks modul dan menghapus penyelesai paralel. Selaras dengan PR #225 Cognis, pembersihan akun menyelesaikan ID akun kanonis menjadi handle profil saat ini sebelum mengubah daftar rapat tersimpan.

## Commit

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)

- [1e557a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)

- [e869c66](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)

- [2432bb4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)

- [6af5e9d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6af5e9d449b87a30616d01a4aa3cbd06754c3d16)

- [3e99028](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3e99028a46b22727d6a74c79be66307e2cdf689f)

- [a94d066](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a94d06602a508b05c7d5ce5a389212aa7a2a3ac8)

- [18feef0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18feef04c15884d664bfc838e565fd4de5505129)

- [34a9e73](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34a9e730d6389aa4ba0fd49e4594f3219c47c7dd)

- [444c415](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/444c415532dc20a285123231368cf2c30e376f1a)

- [d8c7696](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d8c769663b694a244b402304b37047c5e3bea699)

- [33a2ecd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33a2ecdb02e84101247c48c7247b527a4863077f)

- [09c93f4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/09c93f4d5bb52cff518455cda7494ca302cb3b7f)

- [bce5f43](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/bce5f43fef2cc079f596771553e947adc2a77e28)

- [d0ed763](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d0ed763193e09ee5807ff0ffa89718f45b65ffbb)

- [b864da0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b864da0c1388c35000b8f21117ab7b52340f13a8)

- [c69fa5f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c69fa5fc53db518779c9ac7905cc2919d4911aae)
