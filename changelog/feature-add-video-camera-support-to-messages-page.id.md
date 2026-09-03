# Panggilan video Messages dengan rapat Jitsi sekali pakai

**Cabang Fitur:** feature-add-video-camera-support-to-messages-page

## Mulai panggilan terbatas dari Messages

Jitsi Meet kini menyediakan penyedia VoIP peramban untuk percakapan langsung dan grup. Panggilan hanya mencakup anggota ruang pemicu dan tidak membuat percakapan rapat terpisah.

## Pertahankan panggilan sekali pakai dan terfokus

Panggilan Messages tidak dapat dibagikan, ditambah pesertanya, atau dihubungkan ke Whiteboard. Kembali ke Messages mempertahankan rapat aktif dalam jendela gambar-dalam-gambar yang dapat dipindahkan, lalu catatan rapat dihapus saat panggilan berakhir.

## Penyedia tersedia pada render awal

Pendaftaran bilah navigasi kini mendeklarasikan `voip:startCall`, sehingga Cognis dapat memuat Jitsi sebelum Messages memeriksa ketersediaan penyedia dan menampilkan tindakan kamera video pada render percakapan pertama.

## Tindakan panggilan per ruang milik host

Jitsi kini menyelesaikan setiap permintaan ruang menjadi tindakan `component` yang dinormalisasi, alih-alih membuat dan memasang panggung sendiri. Sesuai kontrak penyedia terbaru, Cognis Messages memiliki pemasangan dan pembersihan komponen serta umpan balik peluncuran.

## Gunakan kembali ruang rapat dan buat panggilan tanpa benturan

Setiap permintaan kapabilitas VoIP kini memeriksa ruang percakapan rapat serta ruang sumber panggilan sekali pakai. Rapat yang sudah ada mengembalikan pengalihan router; ruang yang belum cocok membuat satu rapat komponen sekali pakai dengan kunci peserta unik sehingga kegagalan batasan basis data dapat dicegah.

## Pertahankan panggilan sekali pakai tertanam dan tersembunyi dari Meetings

Ruang yang dipetakan ke panggilan sekali pakai tetap mengembalikan tindakan komponen, bukan pengalihan; hanya ruang percakapan rapat biasa yang berpindah ke Meetings. Panggilan sekali pakai juga dikecualikan dari penemuan rapat aktif dan riwayat rapat sebelumnya.

## Sembunyikan overlay rapat di jendela komponen

Rapat yang dipasang melalui kontrak halaman komponen kini menyembunyikan overlay rapat selama siklus hidup komponen. Bingkai panggilan tertanam tetap tidak terhalang, sedangkan halaman Meetings penuh tetap memakai overlay normal.

## Sederhanakan tampilan panggilan tertanam dan kenali panggilan VoIP

Rapat dalam jendela komponen kini menyembunyikan header “Jendela Rapat” bersama overlay dan tidak lagi menambahkan tombol Kembali ke pesan. Messages mengirim “Cognis VoIP Call” sebagai subjek rapat Jitsi melalui metadata komponen, sedangkan rapat biasa tetap memakai “Cognis Classroom”.

## Tutup jendela komponen saat panggilan berakhir

Setelah rapat yang dipasang dalam komponen menyelesaikan pembersihan karena peserta keluar, dikeluarkan, atau konferensi berakhir, Jitsi kini membuang jendela komponen host yang memuatnya. Sesi halaman Meetings penuh tetap terbuka.

## Wajibkan seluruh peserta panggilan komponen

Metadata komponen kini dapat mewajibkan setiap peserta selama panggilan berlangsung. Panggilan VoIP Messages mengaktifkan perilaku ini, sehingga keluarnya peserta lokal maupun jarak jauh mengakhiri rapat, menyelesaikan pembersihan normal, dan menutup jendela komponen host.

## Deklarasikan dimensi PiP Jitsi

Tindakan komponen VoIP Jitsi kini menyertakan dimensi 400 × 225 piksel dalam payload. Nilai tersebut sesuai dengan ukuran minimum halaman komponen Meetings dan memungkinkan host mengatur ukuran panggilan mengambang secara konsisten.

## Gunakan payload ukuran minimum PiP bersama

Tindakan komponen VoIP kini memublikasikan `minSize: { width, height }`, sesuai definisi metadata PiP yang digunakan Nextcloud Whiteboard, alih-alih menyediakan bidang dimensi khusus penyedia.

## Tutup PiP Papan Tulis dari antarmuka host

Jendela PiP rapat yang dibuka bersama Papan Tulis kini menyediakan definisi `closeButton` untuk jendela mengambang host. Mengaktifkannya menjalankan tindakan penutupan Papan Tulis yang sudah ada, menyinkronkan status rapat, dan memulihkan rapat dari PiP.

## Pertahankan panggilan selama navigasi host

Tindakan VoIP Messages kini mengaktifkan `allowNavigation`, sehingga Cognis dapat berpindah halaman sambil mempertahankan rapat komponen dalam PiP. Perlindungan pembongkaran, tautan, dan riwayat rapat aktif tetap aktif secara bawaan untuk rapat lainnya. Definisi tombol tutup PiP Papan Tulis juga meminta gaya `btn-cancel`.

## Komit

- [86e9ab3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86e9ab36cd72e15e68648d23180ea238971bce77)
- [6161476](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/61614768725d67669811159ec059c7d9af91a537)
- [b3f0b4c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b3f0b4ccb143dc068555df17e8731d5fe90b5074)
- [a11ea4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a11ea4a31e51f806fd80c1fde2820c011467dee9)
- [5aea5d1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5aea5d1710aabf1cb2bdfff7a6c57f029e054c18)
