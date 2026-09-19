# Menyelaraskan Jitsi Meet dengan Runtime Modul Tercakup

**Cabang Fitur:** feature-align-module-with-structural-changes

## Menggunakan Konteks yang Tercakup dalam Siklus Hidup

Jitsi Meet kini memperoleh kapabilitas serta menjalankan atau memperluas alur host langsung melalui konteks modulnya yang tercakup. Pengelolaan berbagi, pembersihan akun, integrasi Papan Tulis, pemeriksaan pengaktifan konfigurasi, dan kait penyedia tidak lagi bergantung pada konteks sistem privat, sehingga siklus penonaktifan dan pengaktifan ulang tetap sepenuhnya dilacak oleh Cognis.

## Mendeklarasikan Kontrak Integrasi Terkini

Manifes kini menandai integrasi istimewa tepercaya yang diperlukan untuk kapabilitas dan alur rapat milik host, menggunakan Bootstrap sebagai satu-satunya titik masuk runtime, serta menyinkronkan versi 1.5.214 dan seluruh digest berkas yang dideklarasikan. Pengujian struktural mencakup batas baru tersebut.

## Menjaga Kontrol Overlay yang Tidak Aktif Tetap Tersembunyi

Lobi rapat kini memberlakukan perilaku status HTML tersembunyi di dalam permukaan modul sehingga aturan tampilan tombol host tidak dapat menampilkan kontrol autentikasi, pengambilalihan, keluar, atau tetap berada dalam rapat sebelum status rapat yang sesuai. Versi rilis dan digest integritas disinkronkan pada 1.5.214.

## Memulihkan Penemuan Nextcloud Whiteboard

Jitsi kini menyelesaikan kapabilitas server yang diterbitkan modul Nextcloud Whiteboard terkini. Endpoint ketersediaan kembali mengenali penyedia yang aktif sehingga tombol Whiteboard rapat, verifikasi papan, pembaruan keanggotaan, dan pembersihan dipulihkan.

## Memuat Penyedia UI Khusus

Jitsi kini mendeklarasikan `whiteboard:uiGateway` sebagai persyaratan kapabilitas browser opsional. Cognis dapat memuat penyedia khusus yang diperkenalkan oleh perubahan Nextcloud Whiteboard terbaru sebelum memasang Meetings, tanpa bergantung pada bilah navigasi Whiteboard untuk menginisialisasi pabrik kanvas.

## Menggunakan Penemuan Penyedia Browser untuk Visibilitas

Setelah Cognis PR #222 membuat pendaftaran penyedia kapabilitas eksternal mengikuti siklus hidup, kontrol Meetings kini memakai `whiteboard:uiGateway` yang telah dimuat secara langsung dan tidak lagi menghapus dirinya berdasarkan permintaan ketersediaan backend terpisah. Endpoint backend tetap tersedia untuk diagnosis.

## Gunakan Namespace Kapabilitas Whiteboard Terpadu

Jitsi kini menyelesaikan `whiteboard:fetchBoardData`, `whiteboard:membership`, dan `whiteboard:deleteCanvas`, sesuai dengan kontrak penyedia Nextcloud Whiteboard terbaru. Verifikasi server, keanggotaan peserta, akses terdelegasi, dan pembersihan tidak lagi meminta namespace khusus modul yang telah digantikan.

## Inisialisasi Konteks UI Host pada Pemuatan Langsung

Pemuatan langsung `/meetings` dan penyegaran peramban kini mengimpor bootstrap konteks UI publik Cognis sebelum mengakses `ui:reuse` atau penyedia kapabilitas opsional. Halaman tidak lagi mengasumsikan shell dasbor sudah membuat konteks UI.

## Deklarasikan Kontrak Kapabilitas Server Whiteboard

Jitsi kini mendeklarasikan kapabilitas verifikasi, keanggotaan, dan penghapusan Whiteboard yang digunakannya. Cognis memvalidasi penyedia aktif sebelum Jitsi menangani sinkronisasi status Whiteboard sehingga kontrol tidak mencapai rute dengan kapabilitas server terbatas yang tidak tersedia.

## Commit

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)

- [1e557a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)

- [e869c66](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)

- [2432bb4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)
