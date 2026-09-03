# Panggilan video Messages dengan rapat Jitsi sekali pakai

**Cabang Fitur:** work

## Mulai panggilan terbatas dari Messages

Jitsi Meet kini menyediakan penyedia VoIP peramban untuk percakapan langsung dan grup. Panggilan hanya mencakup anggota ruang pemicu dan tidak membuat percakapan rapat terpisah.

## Pertahankan panggilan sekali pakai dan terfokus

Panggilan Messages tidak dapat dibagikan, ditambah pesertanya, atau dihubungkan ke Whiteboard. Kembali ke Messages mempertahankan rapat aktif dalam jendela gambar-dalam-gambar yang dapat dipindahkan, lalu catatan rapat dihapus saat panggilan berakhir.

## Penyedia tersedia pada render awal

Pendaftaran bilah navigasi kini mendeklarasikan `voip:startCall`, sehingga Cognis dapat memuat Jitsi sebelum Messages memeriksa ketersediaan penyedia dan menampilkan tindakan kamera video pada render percakapan pertama.

## Komit

- [39f6fde](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/39f6fde4a0a48b73f1ff77259ae47ea15c125049)
- [4800983](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4800983502abcdd530a34419f6fe8ae6ead042f1)
