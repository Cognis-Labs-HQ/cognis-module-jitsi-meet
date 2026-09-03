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

## Komit

- [faf0878](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/faf087887c39e69f50503856ffb59ffa2d29e921)
- [74e686a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/74e686a2083fc8440a4ffbd77d655300d211fd2a)
