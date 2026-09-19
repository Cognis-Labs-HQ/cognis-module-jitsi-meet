# Menyelaraskan Jitsi Meet dengan Runtime Modul Tercakup

**Cabang Fitur:** feature-align-module-with-structural-changes

## Menggunakan Konteks yang Tercakup dalam Siklus Hidup

Jitsi Meet kini memperoleh kapabilitas serta menjalankan atau memperluas alur host langsung melalui konteks modulnya yang tercakup. Pengelolaan berbagi, pembersihan akun, integrasi Papan Tulis, pemeriksaan pengaktifan konfigurasi, dan kait penyedia tidak lagi bergantung pada konteks sistem privat, sehingga siklus penonaktifan dan pengaktifan ulang tetap sepenuhnya dilacak oleh Cognis.

## Mendeklarasikan Kontrak Integrasi Terkini

Manifes kini menandai integrasi istimewa tepercaya yang diperlukan untuk kapabilitas dan alur rapat milik host, menggunakan Bootstrap sebagai satu-satunya titik masuk runtime, serta menyinkronkan versi 1.5.210 dan seluruh digest berkas yang dideklarasikan. Pengujian struktural mencakup batas baru tersebut.

## Menjaga Kontrol Overlay yang Tidak Aktif Tetap Tersembunyi

Lobi rapat kini memberlakukan perilaku status HTML tersembunyi di dalam permukaan modul sehingga aturan tampilan tombol host tidak dapat menampilkan kontrol autentikasi, pengambilalihan, keluar, atau tetap berada dalam rapat sebelum status rapat yang sesuai. Versi rilis dan digest integritas disinkronkan pada 1.5.210.

## Memulihkan Penemuan Nextcloud Whiteboard

Jitsi kini menyelesaikan kapabilitas server dengan namespace yang diterbitkan modul Nextcloud Whiteboard terkini. Endpoint ketersediaan kembali mengenali penyedia yang aktif sehingga tombol Whiteboard rapat, verifikasi papan, pembaruan keanggotaan, dan pembersihan dipulihkan.

## Menunggu Pengaktifan Penyedia

Klien Meetings kini mengulangi keputusan ketersediaan Whiteboard backend dengan backoff eksponensial terbatas. Penyedia yang menyelesaikan pendaftaran kapabilitas saat halaman dipasang dapat mengisi kontrol Whiteboard sehingga tempatnya tidak terus kosong.

## Memuat Penyedia UI Khusus

Jitsi kini mendeklarasikan `whiteboard:uiGateway` sebagai persyaratan kapabilitas browser opsional. Cognis dapat memuat penyedia khusus yang diperkenalkan oleh perubahan Nextcloud Whiteboard terbaru sebelum memasang Meetings, tanpa bergantung pada bilah navigasi Whiteboard untuk menginisialisasi pabrik kanvas.

## Menjaga Hasil Ketersediaan Tetap Terkini

Permintaan dan respons ketersediaan Whiteboard kini secara eksplisit melewati cache browser. Mengaktifkan atau mendaftarkan ulang penyedia tidak lagi membuat Meetings memakai hasil tidak tersedia sebelumnya sementara tempat kontrol tetap kosong.

## Commit

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
