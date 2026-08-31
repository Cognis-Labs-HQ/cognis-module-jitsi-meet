# Undang peserta ke rapat aktif

**Cabang Fitur:** feature-update-participant-handling-during-meetings

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

## Skalakan minimum gambar-dalam-gambar rapat

Minimum gambar-dalam-gambar rapat kini 400 × 225 piksel, 25% lebih besar dari sebelumnya. Peserta aktif ketiga meningkatkan kedua dimensi satu kali sebesar 25%, dan Cognis langsung menerapkan minimum terbatas melalui pembaru jendela mengambangnya.

## Verifikasi kontrak perluasan Papan Tulis

Meetings kini memvalidasi kontrak `whiteboard:uiGateway.expandCanvasAccess` persis yang disediakan PR 24 Nextcloud Whiteboard. Pembaruan yang berhasil harus mengidentifikasi kanvas yang diminta dan mengembalikan setiap peserta yang diminta dalam daftar akses yang diperluas sebelum Meetings mencatat sinkronisasi sebagai selesai.

## Hentikan pengulangan perluasan Papan Tulis tanpa izin

Kini hanya penyelenggara rapat yang memanggil kapabilitas perluasan kanvas yang diotorisasi pemilik. Peserta undangan tidak membuat permintaan perluasan, dan permintaan pemilik yang gagal diingat untuk kanvas serta kumpulan peserta tersebut agar polling dan pembaruan siklus hidup sematan tidak berulang kali mengirim permintaan terlarang yang sama.

## Pertahankan overlay di PiP dan pulihkan Papan Tulis otomatis

Overlay rapat, termasuk permintaan peserta sendirian, kini berpindah ke bingkai Jitsi mengambang selama PiP Papan Tulis aktif dan kembali ke panggung saat ditutup. Pembukaan Papan Tulis otomatis kini mencoba ulang kegagalan impor modul dinamis sementara melalui seluruh backoff terbatas, bukan berhenti setelah kegagalan pertama.

## Batasi pertumbuhan PiP pada tiga peserta

PiP rapat kini hanya memiliki dua status ukuran minimum: 400 × 225 piksel untuk hingga dua peserta aktif dan 500 × 282 piksel untuk tiga atau lebih. Rapat yang lebih besar tidak lagi terus meningkatkan minimum dan mengambil alih layar yang tersedia.

## Pulihkan penguraian pengendali Papan Tulis

Referensi DOM bingkai rapat dan overlay kini tetap lokal pada permukaan Meetings, bukan dideklarasikan ulang dari payload kapabilitas Papan Tulis. Browser dapat kembali mengurai dan memuat pengendali, dan pemeriksaan regresi sintaks JavaScript langsung melindungi entrypoint tersebut.

## Pertahankan peletakan rapat aktif di PiP

Memulai penyeretan peserta kini memastikan kembali induk overlay untuk jendela rapat yang sedang aktif. Saat PiP Papan Tulis terbuka, target peletakan peserta hijau muncul di atas bingkai Jitsi mengambang; jika tidak, target tetap di atas panggung rapat normal.

## Prioritaskan berbagi layar Jitsi dan satukan visibilitas Papan Tulis

Peristiwa peserta berbagi layar lokal dan jarak jauh waktu nyata milik Jitsi kini menutup Papan Tulis tersinkronisasi untuk semua orang dan menonaktifkan pembukaan kembali hingga berbagi berhenti, sehingga area normal kembali ke konferensi. Pemeriksaan kapabilitas backend kini menjadi keputusan bersama visibilitas Papan Tulis agar setiap akun menampilkan kontrol nonaktif yang sama saat penyedia browser diinisialisasi atau menyembunyikannya saat penyedia tidak tersedia.

## Hentikan loop kegagalan Papan Tulis otomatis dan tampilkan diagnostik

Pembukaan akun otomatis kini menunggu keyring yang sudah terbuka, bukan mencoba pembukaan kunci yang dibatasi browser tanpa aktivasi pengguna. Satu peringatan meminta pengguna memilih Papan Tulis saat interaksi diperlukan, dan pemasangan otomatis yang gagal tidak dicoba ulang untuk papan yang sama. Kegagalan nyata kini menyebut tahap yang gagal pada toast serta menulis ID terstruktur, pesan kesalahan, dan objek Error lengkap ke log host dan konsol browser.

## Pertahankan lapisan rapat aktif pada jendela langsungnya

Bergabung ke rapat yang sudah ada tidak lagi membuat perenderan peserta memulihkan lapisan lobi atau pra-pemeriksaan. Penempatan lapisan kini mendeteksi induk mengambang aktual dari bingkai rapat, bukan hanya mengandalkan callback pelepas lokal, dan penyeretan peserta menggunakan lapisan yang telah dipindahkan secara langsung agar zona pelepasan hijau mengikuti PiP Whiteboard.

## Ikat dan bersihkan zona pelepasan peserta PiP

Target peserta kini mendeteksi kelas `floating-window` Cognis yang sebenarnya serta menyelesaikan lapisan dan bingkai Jitsi saat ini dari DOM aktif sebelum setiap transisi, sehingga target terikat pada elemen PiP alih-alih panggung Whiteboard. Pembersihan akhir-seret dan pelepasan tingkat dokumen, ditambah penanganan Escape dan hilangnya fokus jendela, menghapus target saat seretan dibatalkan.

## Gunakan kembali target rapat, tampilkan pemuatan core, dan jelaskan aktivasi Whiteboard

Penyeretan peserta ke rapat aktif kini menggunakan kembali lapisan rapat dan desain target hijau yang ada tanpa popup putus-putus tambahan. Memulai rapat mempertahankan roda pemuatan halaman bersama Cognis core sejak klik Mulai Rapat sampai upaya bergabung ke Jitsi selesai. Kegagalan Whiteboard yang dilaporkan dilacak ke otorisasi pemunculan halaman komponen Cognis: pemasangan akun otomatis tanpa aktivasi browser saat ini kini ditunda dengan satu permintaan tindakan, bukan mencoba ulang pemunculan tanpa izin hingga melaporkan `whiteboard_component_window_unavailable`.

## Jelaskan penguncian berbagi layar, lanjutkan Whiteboard, dan setujui undangan aktif

Tindakan Whiteboard yang dinonaktifkan kini menampilkan penjelasan hover terlokalisasi saat berbagi layar menggunakan permukaan rapat. Papan akun tersinkron yang menemui persyaratan aktivasi pengguna Cognis kini memasang listener input aman-abort dan otomatis melanjutkan pada aktivasi berikutnya tanpa memerlukan klik khusus Whiteboard. Undangan peserta aktif meminta konsensus melalui kapabilitas persetujuan opsional Share sebelum mutasi, menolak penolakan eksplisit, dan fail-open dengan log terstruktur jika infrastruktur persetujuan tidak tersedia.

## Mulai konsensus saat dilepas, rollback penolakan, dan kunci perpindahan rapat

Pelepasan peserta aktif kini memperbarui kumpulan peserta secara optimistis dan segera mengirim permintaan API berbasis persetujuan. Suara yang menolak mengembalikan peserta yang diusulkan ke daftar tersedia dan memberi pengundang toast penolakan terlokalisasi khusus. Kisi Rapat Aktif dan kontrolnya kini selalu dinonaktifkan selama pengguna lokal masih bergabung ke suatu rapat.

## Gunakan alur persetujuan Share nyata dan hapus pegangan PiP ganda

Saat kapabilitas persetujuan Share langsung tidak ada, penambahan peserta aktif kini menjalankan tahap persetujuan mint Share yang sudah ada, menunggu keputusannya, lalu segera mencabut token sementara, sehingga penerapan saat ini tidak lagi melewati konsensus. PiP Whiteboard tidak lagi mengikat header panggung rapat sebagai pengendali gerak tambahan di samping bilah alat jendela mengambang Cognis.

## Wajibkan persetujuan akhir Share untuk undangan rapat aktif

Penambahan peserta ke rapat aktif kini langsung mewajibkan kapabilitas `share:requestApproval` yang dideklarasikan. Hanya persetujuan akhir yang eksplisit yang menerima peserta; keputusan yang ditolak, tertunda, atau tidak valid mengembalikan peserta ke daftar tersedia. Kegagalan runtime tetap fail-open dan dicatat tanpa jalur kompatibilitas lama untuk membuat lalu mencabut berbagi.

## Pulihkan pembongkaran rapat dan hindari perluasan Whiteboard berulang

Keluar atau berakhirnya konferensi kini menjalankan satu pembongkaran langsung, memulihkan overlay rapat, mengosongkan pilihan peserta, dan menunggu pemuatan ulang rapat aktif serta peserta tersedia. Sinkronisasi akses Whiteboard kini menganggap keanggotaan awal telah diizinkan dan hanya memanggil penyedia perluasan setelah peserta berubah, sehingga permintaan khusus pemilik tidak berulang saat polling.

## Cegah overlay keluar bereaksi terhadap klik berikutnya

Proses penutupan rapat kini menghapus rapat aktif sebelum menyinkronkan kontrol Whiteboard. Dengan demikian, pembuka Whiteboard otomatis yang tertunda tidak dapat diaktifkan kembali selama proses keluar dan memakai klik berikutnya untuk menyembunyikan overlay Rapat Ditutup atau Rapat Ditinggalkan.

## Pulihkan seluruh panggung rapat setelah pembersihan

Pemulihan overlay kini mempertahankan dan memulihkan seluruh pembungkus bingkai rapat ketika pembersihan komponen melepaskannya. Tampilan Rapat Ditutup atau Rapat Ditinggalkan pun kembali bersama panggung setelah daftar peserta dan rapat aktif digambar ulang.

## Jaga sinkronisasi sumber daya rapat aktif

Whiteboard persisten kini mengonfirmasi akses seluruh peserta pada sinkronisasi pertama agar peserta yang diundang setelah rapat dimulai dapat membuka kanvas yang sudah ada. Pembaruan Messages mempertahankan ruang chat rapat yang sama sambil mengubah keanggotaannya untuk pengguna yang ditambahkan dan dihapus, lalu chat mini digambar ulang dari ruang tersebut. Pengujian juga memastikan nama dan URL rapat yang dibuat tetap tersimpan pada entitas rapat yang tidak sekali pakai selama perubahan keanggotaan.

## Pulihkan target peletakan peserta di atas PiP

Target peletakan peserta aktif kini beralih dari penempatan kisi panggung normal ke posisi inset absolut saat dipindahkan ke dalam bingkai Jitsi mengambang. Menyeret peserta yang tersedia kembali menutupi seluruh jendela rapat PiP dengan target undangan.

## Cegah kegagalan penambahan peserta saat menggunakan kembali chat

API penambahan peserta kini langsung menggunakan ruang Messages rapat yang tersimpan, bukan meminta resolusi anggota persis mengembalikan ruang tersebut lalu menolak ruang berbeda yang dibuatnya. Browser memperbarui keanggotaan melalui klien Messages host, menggambar ulang chat mini yang sama, dan melaporkan kesalahan terlokalisasi dengan diagnostik terstruktur jika keanggotaan chat tidak dapat diubah.

## Selaraskan identitas rapat, chat, dan keanggotaan Whiteboard

Modul rapat memanggil operasi Messages sisi server yang terfokus untuk menambah atau menghapus anggota sebelum menyimpan perubahan peserta yang sesuai. ID ruang chat tersimpan tidak pernah berubah, klien hanya menggambar ulang ruang tersebut, dan perluasan Whiteboard menerima kumpulan peserta tersimpan yang sama. Inisialisasi skema tidak lagi membuat ulang nama, slug, atau URL rapat tersimpan sehingga penyimpangan identitas antara sumber daya Jitsi, Messages, dan Whiteboard dihapus.

## Gunakan operasi anggota Messages yang terfokus

Perubahan peserta rapat kini memanggil kapabilitas sederhana `social:messages:addRoomMember` atau `social:messages:removeRoomMember` untuk ruang rapat yang tersimpan. Pembuatan ruang tetap menjadi operasi satu kali yang terpisah, rapat tetap memiliki asosiasi ruang, dan tidak diperlukan kapabilitas sinkronisasi agregat.

## Commit

- [736ed26](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/736ed2651843b76e095f075a58b0ee7823128942)
- [b95fb10](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b95fb1027087f679a699ea807295f7b1286bb8b0)
- [0523439](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/05234396cd0e1bfc99075aecd9575291df1fab54)
- [ff60844](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ff6084469d7c8c18c631d6c59bac0b65fdf04b44)
- [0afee2e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0afee2e9720010b6a2b5c8de256310dd77efd947)
- [3aa0da6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3aa0da6b54b2bf66dd36e760630cf7c50d7a55b3)
- [a854724](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a8547244e698f6e3ef1c4b93d31531891a8edae2)
- [12de19a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12de19a4fcf312a67e238efd23c0beb0ffe03d2e)
- [a47b5b4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a47b5b48340e023192dc88a1cbbc6f2c4ecb4587)
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
- [6a1e873](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6a1e873ff9454735dcbbcc0ed3290d7a446ac8b6)
- [cef74a0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cef74a09b02dfc3f50523dcadaf497488f9822ef)
- [812a79e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/812a79eb9960118a6addc5d17147e565db413639)
- [402045d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/402045d752ae3dcfd03497565a0c6bf70328ab66)
- [3b50f6d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3b50f6d1707d136ad222a615771e7a43d0289481)
- [cc022ac](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cc022ace92fafd44941961ea8282b3f051c94f5e)
- [e65d307](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e65d3078012ebca12c5a0c5cda15235a8c216c96)
- [2a9cc59](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2a9cc59e8ad051da54ca7919de34fde15256fde9)
- [2d72282](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d722820c4bd77d0c7ef6dd8991ec63c8ed11b52)
- [f6d7cdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f6d7cdb9645e336a672b7749a7aab616b74b32d9)
- [b064315](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b0643159333c67f4117d5afc6fdbdcad9ba1b1ec)
- [c373996](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c37399694fa2c71da5ddda3f26133eebf5e985f2)
- [b8d6adb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b8d6adbd9c3aec0cf7e34e60233f804445f0baa5)
- [3c87494](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3c87494d228a96afa177602e3a3c7ae8e40d5c01)
- [8019153](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8019153c46dd027cc05b849a272327e3114a1c63)
- [d105cf3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d105cf394e47fefc26c894d8ba0278e97b7f09b2)
- [0e5340a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0e5340abd33d63446a5d6bf557748040c1e49fc7)
- [8c26ddf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8c26ddf4ca40c8964c36e15ad43ef055a31c627b)
- [d18e4d2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d18e4d21b84c5f88898873bd83d74f3a74840e10)
- [6eb02e6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6eb02e68d05d3bb907945a891232023f45908e89)
- [8454f05](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8454f05f4aab00b90e83f46c039a1a31a0b2ff72)
- [a243551](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a24355173a41a0c442dc624f54b7e22fd88b1313)
- [4514fab](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4514fab46af476bda59562f58440bb0f19003ccf)
- [b778ee7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b778ee7b3dd80dd15582ac7e982a1b435869236a)
- [3b6bda6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3b6bda658696fdf143e042b6b14d8ff96d36b0dd)
- [e0e916f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e0e916f59892bc0c812451a359ca2b36e6864cff)
- [93727a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/93727a180bc1bdede576460b6d3bdf54dcae3604)
- [f7d14b3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f7d14b3ccaef984bf26b51d4e82a96fe80d3077b)
