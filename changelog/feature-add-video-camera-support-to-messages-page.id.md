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

## Lewati konsensus Papan Tulis untuk rapat kecil

Rapat sekali pakai dan rapat dengan tidak lebih dari dua peserta aktif atau yang diundang kini langsung membuka Papan Tulis tanpa meminta keputusan konsensus Share. Rapat dengan lebih banyak peserta tetap memakai alur persetujuan yang ada.

## Pertahankan chat sumber setelah rapat VoIP

Mengakhiri rapat VoIP sekali pakai kini membersihkan data dan pembagian rapat tanpa menghapus chat Messages privat yang memulai panggilan. Chat milik modul untuk rapat tanpa peserta tetap dihapus.

## Hapus chat dari jendela komponen sekali pakai

Rapat sekali pakai yang ditampilkan dalam jendela komponen tidak lagi menyertakan permukaan chat rapat atau pengenal chat dalam payload. Kapabilitas terautentikasi baru `meeting:getMeetingChat` secara terpisah mengembalikan ID chat terlampir hanya kepada peserta rapat yang berwenang.

## Gunakan kembali gaya host tanpa memuat ulang

Meetings tidak lagi meminta stylesheet page composer global atau seluruh katalog stylesheet umum saat rute atau jendela komponen dibuka. Modul hanya mendaftarkan stylesheet miliknya yang sepenuhnya tercakup sehingga posisi kaskade yang lebih akhir tidak mengubah gaya permukaan Cognis lain.

## Pertahankan keanggotaan chat sumber saat dikeluarkan

Ketika seseorang dikeluarkan dari rapat VoIP sekali pakai, Jitsi kini hanya menghapusnya dari data rapat dan kehadiran serta, bila berlaku, Papan Tulis rapat. Keanggotaannya dalam chat privat atau grup yang memulai panggilan tetap tidak berubah.

## Selesaikan panggilan VoIP yang digunakan kembali secara andal

Pemetaan rapat yang ada kini mengotorisasi anggota ruang melalui identitas akun stabil, bukan handle profil yang dapat berubah. Konsumen yang hanya mendukung `navigate` juga dapat menyelesaikan rapat reguler yang dipetakan, lalu tindakan dari server diperiksa terhadap tindakan yang ditawarkan setelah resolusi.

## Lindungi panggilan komponen hingga PiP

Panggilan sekali pakai tetap memakai perlindungan navigasi pembongkaran, tautan, dan riwayat dalam jendela komponen asal. Navigasi yang dikelola host hanya diizinkan ketika komponen benar-benar berada dalam jendela PiP mengambang. Rapat sekali pakai juga menekan seluruh notifikasi rapat.

## Komit

- [86e9ab3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86e9ab36cd72e15e68648d23180ea238971bce77)
- [6161476](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/61614768725d67669811159ec059c7d9af91a537)
- [b3f0b4c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b3f0b4ccb143dc068555df17e8731d5fe90b5074)
- [a11ea4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a11ea4a31e51f806fd80c1fde2820c011467dee9)
- [5aea5d1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5aea5d1710aabf1cb2bdfff7a6c57f029e054c18)
- [6e02bef](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6e02befec71d6adcd77a18e5a56487f835ee91bd)
- [14cc4de](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/14cc4de32fe631befbb9cd8cb460e00dec50239f)
- [e348c18](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e348c183eb5930a42aaddd8fc30883a52d9e1c80)

- [624111a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/624111a681b1a9bc49d1c4ec320ea718e5bd5d89)
- [47d031e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/47d031ebbd27aa3bc1ae9b8b6c9926c5f4b149c1)
- [0d7d459](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0d7d4599220a9e9c53fd89f7c61b9c83249ecd76)
- [a17a685](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a17a6852353a0e47376c352eb21213a8cf2c5f6e)
- [fa90ce2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/fa90ce290871f6ff69b52a9e4b2860ee3725e197)
- [ee9e19a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ee9e19a1856c0eef35b6004a206e4ce1751887dd)
- [47ac3cb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/47ac3cb3282a28e2ce0f40a72d3d592f42d49ea5)
