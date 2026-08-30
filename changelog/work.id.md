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

## Cegah benturan kunci peserta dan sembunyikan pengguna yang dicadangkan

Perubahan keanggotaan aktif kini menggunakan kunci peserta yang tercakup pada rapat sehingga kegagalan keunikan PostgreSQL tidak terjadi saat daftar peserta yang dihasilkan sama dengan rapat lain. Pencarian peserta menyembunyikan pengguna yang sedang hadir aktif dalam rapat lain, dan API undangan aktif menerapkan aturan ketersediaan yang sama tanpa menyembunyikan pengguna yang hanya dijadwalkan untuk diundang.

## Segarkan integrasi peserta langsung

Peserta tersedia dan rapat aktif kini disegarkan setiap lima detik, penyedia kehadiran avatar diinisialisasi setelah navigasi SPA, chat rapat memuat ulang keanggotaan yang diperluas beserta pesan baru, dan undangan aktif yang berhasil menampilkan toast. Papan tulis persisten yang sudah ada menerima perluasan akses peserta melalui kapabilitas penyedia opsional. Pesan peserta kosong cocok dengan status rapat aktif kosong, pesan pengeluaran dipersingkat, dan ukuran minimum gambar-dalam-gambar yang diumumkan adalah 320 × 180 piksel.

## Bedakan tindakan Papan Tulis

Tombol Papan Tulis kini memakai tampilan konfirmasi saat membuka papan dan beralih ke tampilan batal selama menampilkan “Tutup Papan Tulis.”

## Commit

- [790401f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/790401f6d0c6714179d977e0d9384c59bc91f30c)

- [28774f3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/28774f3df4a49adabc7e5470442e4cc087555e87)

- [4c26402](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4c26402d1005c86a6f28eecc78883e447bb97c11)
- [206b29f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/206b29f70af70eab3d63d8dae871f182dc97f40a)
- [5f7683b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5f7683b1c03719763333174cd6802bf4d33d37e9)
- [33eddd2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33eddd2c63b80998f6d8e9ee44b6152c0080628f)
- [1386015](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1386015409eeb5bd252208dcdff27b809e4db00e)
- [eb8aef2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/eb8aef223aa633bcd302ee27dd934a63e92bcf78)
- [2d07b3b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d07b3b6d0bd57563c83706f37c5dffcbf01f59f)
- [b88f6db](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b88f6db738e3bfad4ea1fd84ffecd2afe8bcb91f)
