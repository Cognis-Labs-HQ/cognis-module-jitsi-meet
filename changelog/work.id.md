# Menyelaraskan Jitsi Meet dengan Runtime Modul Tercakup

**Cabang Fitur:** work

## Menggunakan Konteks yang Tercakup dalam Siklus Hidup

Jitsi Meet kini memperoleh kapabilitas serta menjalankan atau memperluas alur host langsung melalui konteks modulnya yang tercakup. Pengelolaan berbagi, pembersihan akun, integrasi Papan Tulis, pemeriksaan pengaktifan konfigurasi, dan kait penyedia tidak lagi bergantung pada konteks sistem privat, sehingga siklus penonaktifan dan pengaktifan ulang tetap sepenuhnya dilacak oleh Cognis.

## Mendeklarasikan Kontrak Integrasi Terkini

Manifes kini menandai integrasi istimewa tepercaya yang diperlukan untuk kapabilitas dan alur rapat milik host, menggunakan Bootstrap sebagai satu-satunya titik masuk runtime, serta menyinkronkan versi 1.5.206 dan seluruh digest berkas yang dideklarasikan. Pengujian struktural mencakup batas baru tersebut.

## Menjaga Kontrol Overlay yang Tidak Aktif Tetap Tersembunyi

Lobi rapat kini memberlakukan perilaku status HTML tersembunyi di dalam permukaan modul sehingga aturan tampilan tombol host tidak dapat menampilkan kontrol autentikasi, pengambilalihan, keluar, atau tetap berada dalam rapat sebelum status rapat yang sesuai. Versi rilis dan digest integritas disinkronkan pada 1.5.206.

## Commit

- [2da84cf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2da84cf21e4804a39e2cf2de47f0b3770f13abf5)
- [f968ac5](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f968ac54673f1c34d5a745db94496095e36b1ba7)
