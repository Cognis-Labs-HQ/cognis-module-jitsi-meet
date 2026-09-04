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

## Otorisasi panggilan dari keanggotaan ruang kanonis

Endpoint VoIP kini meminta penyelesai ruang Messages tepercaya untuk mengotorisasi pemohon dan memperoleh seluruh daftar peserta. Daftar anggota yang dikirim klien tidak lagi dapat memilih peserta.

## Gunakan kembali satu pemetaan ruang dengan aman

Panggilan sekali pakai kini memakai referensi ruang percakapan yang sudah ada dan dilindungi batasan skema unik. Permintaan serentak menggunakan kembali rapat yang lebih dahulu dibuat tanpa menambahkan bidang ruang sumber kedua, sementara pembersihan rapat sekali pakai menghapus ruang percakapan milik rapat melalui kapabilitas Messages yang terotorisasi.

## Lokalkan dan bersihkan panggilan penyedia

Penyedia memakai istilah VoIP yang netral, menerima subjek dari konsumen, dan menggunakan subjek terlokalkan jika tidak diberikan. Penutupan komponen host kini menjalankan pembersihan kehadiran normal sebelum membuang Jitsi. Pembatasan rapat sekali pakai dijelaskan secara konsisten sebagai aturan rapat, bukan aturan untuk konsumen VoIP tertentu.

## Pertahankan tamu berbagi sekali pakai pada lapisan keluar

Tamu yang meninggalkan rapat sekali pakai yang dibagikan melalui tautan kini tetap berada pada lapisan “Meninggalkan Rapat”, bukan melihat layar beranda Rapat. Pengakhiran oleh penyelenggara mempertahankan lapisan rapat ditutup sementara pembersihan sekali pakai menghentikan tautan berbagi.

## Komit

- [86e9ab3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86e9ab36cd72e15e68648d23180ea238971bce77)
- [6161476](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/61614768725d67669811159ec059c7d9af91a537)
- [b3f0b4c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b3f0b4ccb143dc068555df17e8731d5fe90b5074)
- [a11ea4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a11ea4a31e51f806fd80c1fde2820c011467dee9)
- [5aea5d1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5aea5d1710aabf1cb2bdfff7a6c57f029e054c18)
- [6e02bef](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6e02befec71d6adcd77a18e5a56487f835ee91bd)
- [14cc4de](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/14cc4de32fe631befbb9cd8cb460e00dec50239f)
- [e348c18](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e348c183eb5930a42aaddd8fc30883a52d9e1c80)
