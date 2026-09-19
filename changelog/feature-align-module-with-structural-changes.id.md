# Menyelaraskan Jitsi Meet dengan Runtime Modul Tercakup

**Cabang Fitur:** feature-align-module-with-structural-changes

## Menggunakan Konteks yang Tercakup dalam Siklus Hidup

Jitsi Meet kini memperoleh kapabilitas serta menjalankan atau memperluas alur host langsung melalui konteks modulnya yang tercakup. Pengelolaan berbagi, pembersihan akun, integrasi Papan Tulis, pemeriksaan pengaktifan konfigurasi, dan kait penyedia tidak lagi bergantung pada konteks sistem privat, sehingga siklus penonaktifan dan pengaktifan ulang tetap sepenuhnya dilacak oleh Cognis.

## Mendeklarasikan Kontrak Integrasi Terkini

Manifes kini menandai integrasi istimewa tepercaya yang diperlukan untuk kapabilitas dan alur rapat milik host, menggunakan Bootstrap sebagai satu-satunya titik masuk runtime, serta menyinkronkan versi 1.5.207 dan seluruh digest berkas yang dideklarasikan. Pengujian struktural mencakup batas baru tersebut.

## Menjaga Kontrol Overlay yang Tidak Aktif Tetap Tersembunyi

Lobi rapat kini memberlakukan perilaku status HTML tersembunyi di dalam permukaan modul sehingga aturan tampilan tombol host tidak dapat menampilkan kontrol autentikasi, pengambilalihan, keluar, atau tetap berada dalam rapat sebelum status rapat yang sesuai. Versi rilis dan digest integritas disinkronkan pada 1.5.207.

## Memulihkan Penemuan Nextcloud Whiteboard

Jitsi kini menyelesaikan kapabilitas server dengan namespace yang diterbitkan modul Nextcloud Whiteboard terkini. Endpoint ketersediaan kembali mengenali penyedia yang aktif sehingga tombol Whiteboard rapat, verifikasi papan, pembaruan keanggotaan, dan pembersihan dipulihkan.

## Commit

- [17491e9](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/17491e947e3c67ebd030080bf619df59b1e2775f)
- [c7ac761](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c7ac7619266b446dff0101b80ab7a95afbab3174)
