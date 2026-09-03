# Panggilan video Messages dengan rapat Jitsi sekali pakai

**Cabang Fitur:** work

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

## Komit

- [8443708](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8443708a97361cf0d755442beabcca2c9f20e781)
- [cc6a92c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cc6a92c0054168293a38133b4e520d50bd8344c2)
