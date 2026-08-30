# Undang peserta ke rapat aktif

**Cabang Fitur:** work

## Perluas rapat aktif yang tidak sekali pakai

Peserta kini dapat diseret ke rapat aktif yang dimulai dengan peserta undangan. Keanggotaan rapat dan chat Messages terenkripsi diperbarui, peserta baru menerima undangan, dan dapat mengambil kata sandi rapat saat bergabung. Peserta yang sudah ditempatkan tidak dikembalikan ke daftar pengguna tersedia setelah rapat dimulai.

## Pertahankan kegunaan permukaan rapat aktif

Penyegaran peserta tidak lagi membuka kembali overlay lobi di atas rapat yang sudah dimasuki sehingga proses bergabung melalui notifikasi dan daftar aktif tetap dapat digunakan. Kolom peserta tersedia kini menampilkan “Tidak ada peserta yang tersedia.” saat kosong.

## Tampilkan target peletakan peserta aktif

Menyeret peserta yang tersedia kini menampilkan sementara target peletakan terlokalisasi di atas jendela rapat aktif yang memenuhi syarat. Meletakkan peserta akan mengundangnya, sedangkan mengakhiri penyeretan memulihkan tampilan rapat tanpa gangguan.

## Lapiskan target peletakan di atas sematan Jitsi

Penyeretan peserta yang valid kini mengaktifkan target peletakan langsung dari peristiwa seret avatar. Target tersebut sama persis dengan jendela Jitsi tersemat, bergerak di atas iframe selama penyeretan, lalu kembali ke bawah setelah peserta diletakkan atau penyeretan berakhir.

## Pertahankan panduan seret hijau

Target peserta aktif kini mempertahankan garis hijau yang sama selama seluruh penyeretan, menambahkan tepi dalam hijau dan target putus-putus, serta hanya menghapus panduan saat penyeretan berakhir atau peserta diletakkan.

## Cabut akses peserta yang dikeluarkan

Klien rapat kini mengenali peristiwa dan kesalahan pengeluaran lokal dari Jitsi. Pengguna akun yang dikeluarkan dihapus dari keanggotaan tersimpan dan muncul kembali sebagai peserta yang dapat diundang, sedangkan hanya tautan Share yang digunakan oleh sesi tamu yang dikeluarkan yang dicabut; kehadiran juga dinonaktifkan.

## Lepaskan root rute persisten saat unmount

Mount Meetings yang dirutekan, dibagikan, dan disematkan kini tidak mengambil root yang sudah dibatalkan dan menghapus `.jitsi-route-root` ketika sinyal siklus hidup dibatalkan. Inisialisasi asinkron berhenti sebelum membuat pekerjaan presentasi berikutnya, sementara pembersihan yang ada tetap membuang observer, penangan, timer, pekerjaan chat, papan tulis, dan sematan Jitsi.

## Commit

- [4c26402](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4c26402d1005c86a6f28eecc78883e447bb97c11)
- [206b29f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/206b29f70af70eab3d63d8dae871f182dc97f40a)
- [5f7683b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5f7683b1c03719763333174cd6802bf4d33d37e9)
- [33eddd2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33eddd2c63b80998f6d8e9ee44b6152c0080628f)
- [1386015](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1386015409eeb5bd252208dcdff27b809e4db00e)
- [eb8aef2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/eb8aef223aa633bcd302ee27dd934a63e92bcf78)
- [2d07b3b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d07b3b6d0bd57563c83706f37c5dffcbf01f59f)
