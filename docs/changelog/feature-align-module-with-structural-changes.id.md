Rilis 1.5.258 — Halaman Meetings yang dimuat langsung membatalkan mount saat host menjalankan perubahan rute atau dokumen ditinggalkan. Polling penemuan rapat dimiliki mount tersebut, berhenti saat dibatalkan, dan tidak dapat dimulai kembali. Respons terlambat dan permintaan yang dibatalkan tidak boleh mengubah halaman tujuan atau menampilkan galat Meetings di sana. Navigasi yang dibatalkan mempertahankan halaman saat ini.

# Selaraskan Jitsi Meet dengan Kontrak Cognis

**Cabang Fitur:** feature-align-module-with-structural-changes

## Persetujuan, kepemilikan sumber daya, dan polling

Rilis 1.5.260 — Klaim sumber kanvas hanya dilakukan setelah persetujuan, di dalam pembaruan status berseri. Kegagalan sinkronisasi anggota atau penyimpanan melepas klaim baru dan mempertahankan klaim yang sudah dipetakan. Pembuatan rapat umum tidak membuat panggilan sementara; pemulihan panggilan percakapan memakai rute VoIP percakapan yang ada. Polling rapat mendatang yang sudah tergantikan diabaikan. Halaman langsung memakai sinyal siklus hidup host, bukan controller mandiri.

## Filter administrasi dan referensi

Rilis 1.5.259 — Referensi menggunakan komposer bagian yang dapat dibuka dari host, sama seperti Components. Referensi yang terbuka tetap terbuka selama polling rapat dan rapat mendatang, dengan kontrol yang dapat digunakan melalui papan ketik. Filter Rapat Aktif, Semua Rapat, dan Rapat Bermasalah masing-masing memiliki pesan kosong tersendiri.

## Gunakan ctx terbatas dan alur tindakan yang dijalankan

Bootstrap memperoleh layanan eksternal hanya melalui ctx yang dibatasi siklus hidup dan mendaftarkan rute, penyedia, kapabilitas serta kait milik modul. Operasi penyimpanan modul aktif menjalankan alur bernama `jitsi-meet:*` dengan tahap `initialize-store` dan `execute-action`; operasi internal mempertahankan transaksi yang ada. Otorisasi mendahului tindakan rute, dan pelaksana yang tidak lengkap gagal alih-alih melewati pekerjaan secara diam-diam. Konfigurasi saat nonaktif menggunakan titik masuk siklus hidup terbatas karena Cognis tidak mendaftarkan alur modul yang nonaktif.

## Pertahankan identitas rapat dan percakapan

Rapat tersimpan mempertahankan ruang obrolan terpisah, ditegakkan oleh batasan skema terkini dan pengikatan sumber milik penyedia. Reservasi panggilan sementara mencegah panggilan bersaing.

## Hormati penyedia Whiteboard opsional

Pabrik kanvas browser opsional ditemukan setelah inisialisasi host, sedangkan server menyelesaikan kapabilitas Whiteboard yang dideklarasikan penyedia secara dinamis. Aktivasi memeriksa ketersediaan sebelum membuat kanvas. Tamu mengikuti pemetaan yang ada tanpa membuat kanvas. Persiapan serentak berbagi panggilan pabrik yang tertunda, percobaan ulang memakai kembali hasil yang belum dikonfirmasi, penggantian penyedia mengisolasi cache, dan percobaan jendela yang dibatalkan berhenti sebelum membuka lagi. Verifikasi keanggotaan dan pemetaan menggunakan identitas akun kanonis.

## Gunakan ulang pembersihan dan tolak pekerjaan UI usang

Penghapusan akun memperbarui daftar peserta tersimpan atau membersihkan sumber daya eksternal sebelum menghapus rapat yang tidak dapat dipakai. Keberangkatan terakhir dan pembersihan akun menggunakan penghapusan sumber daya terotorisasi pemilik yang sama. Satu katalog mencakup reservasi panggilan saat menghapus baris rapat. Jeda bersama yang dapat dibatalkan melepas pendengar saat selesai maupun dibatalkan. Polling memeriksa masa hidup mount, urutan permintaan dan identitas rapat sebelum menerapkan hasil, termasuk respons rapat berakhir atau sesi diambil alih.

## Pertahankan tampilan host dan sesi konferensi

Meetings menggunakan page composer, router, pratinjau profil, kontrol, overlay dan jendela mengambang host. Aturan keadaan tersembunyi hanya menargetkan kontrol dan permukaan milik Jitsi. Respons rapat kosong menyelesaikan keadaan pemuatan awal. Mount Whiteboard mempertahankan otorisasi keyring dan penguncian berbagi layar tersinkron. Pembersihan sesi autentikasi Jitsi mempertahankan preferensi browser lain dan mengizinkan browser yang menolak akses penyimpanan untuk tetap bergabung.

## Terbitkan satu kontrak rilis tersinkron

Modul 1.5.250 menyinkronkan versi paket dan inventaris SHA-256. Dokumentasi standar menjelaskan perilaku yang didukung saat ini dalam bahasa Jerman, Inggris, Indonesia dan Jepang. PR ini memakai satu set changelog dengan tautan implementasi gabungan. Pengujian perilaku mencakup eksekusi alur tindakan, penolakan izin, pembatalan percobaan ulang, kanvas serentak dan respons usang, selain pemeriksaan isolasi struktural.

## Pulihkan akses Whiteboard sebelum pembukaan otomatis

Bergabung ke rapat aktif memulihkan keanggotaan akun terotorisasi pada Whiteboard persisten yang terbuka sebelum mengembalikan data bergabung, terlepas dari pilihan chat. Pembukaan otomatis akun menjalankan `jitsi-meet:follow-whiteboard` untuk memverifikasi pemetaan terbuka yang tepat, memberikan keanggotaan terotorisasi pemilik dan mengonfirmasi pemetaan lagi sebelum mount. Mengikuti tidak memulai pemungutan persetujuan baru atau mengubah keadaan terbuka; papan tertutup atau diganti membatalkan proses tanpa pesan kesalahan. Tamu tautan mempertahankan akses terdelegasi, dan pemetaan tertutup tidak menjadikan penyedia opsional sebagai dependensi untuk bergabung.

## Kontrak presentasi publik

Jitsi memakai metode gateway publik `requestCanvasPage({signal})` dan `openCanvas({whiteboardId, elementId, signal})`. Provider Whiteboard memiliki ID rute, tata letak kanvas, transport dan semantik sesi. Jitsi hanya memberikan ID papan yang tepat dan target pemasangannya sendiri, lalu melepas jendela saat pembongkaran. Presentasi memerlukan Whiteboard 2.3.147 atau lebih baru. Perubahan anggota memakai kontrak keanggotaan publik milik server.

## Jelaskan kontrol Whiteboard yang tidak tersedia

Provider Whiteboard yang aktif dengan kontrak UI publik tidak lengkap tetap menampilkan kontrol nonaktif dengan tooltip penjelasan dan mencatat metode capability yang hilang. Kegagalan pemuatan provider juga dijelaskan. Provider opsional yang tidak ada tidak menampilkan kontrol. Ketersediaan avatar terpisah dari kesiapan Whiteboard; respons 404 ketersediaan profil tidak menonaktifkannya.

## Lindungi transisi rapat dan pulihkan kanvas persisten

Pemilihan rapat terkunci saat memuat, menyelesaikan keyring, menunggu autentikasi atau pengambilalihan sesi, dan selama konferensi tertanam. Permintaan bergabung berbagi operasi tertunda; pembatalan dan respons usang tidak mengganti tujuan saat ini. Pencarian aktif menyertakan rapat undangan yang diizinkan dengan kehadiran terkini meskipun autentikasi tertunda. Memulai kembali rapat persisten memulihkan kanvas tersimpan melalui kontrak keanggotaan publik yang diizinkan pemilik. Kanvas opsional yang tidak tersedia atau dihapus dicatat dan tidak mencegah pengguna bergabung.

## Batasi wadah komponen rapat

Jitsi membatasi wadah komponen tertanam pada viewport rapat dan meregangkan elemen akar ke baris kisi dengan ukuran pasti. Permukaan penyedia yang terisolasi tetap terlihat tanpa ukuran intrinsiknya memperbesar jendela rapat. Uji regresi Chromium memakai markup rapat sebenarnya dalam mode standar untuk memeriksa pembukaan dan perubahan ukuran. Integrasi tetap tidak bergantung pada rincian internal tampilan Whiteboard.

## Pertahankan overlay rapat aktif di PiP

Pembaruan status mencari overlay pada jendela aktif, bukan memindahkannya dari portal kembali ke halaman utama. Tombol, pesan, dan indikator pemeriksaan awal diperbarui dan diikat di overlay tersebut; frame mengambang tetap dikenali sebagai rapat aktif saat composer diperbarui. Frame PiP mempertahankan lingkup gaya modul dan overlay menutupinya dengan posisi absolut. Menutup PiP memulihkan lingkup dan posisi asal. Uji perilaku memeriksa status di luar akar halaman; Chromium memeriksa batas overlay mengambang.

## Pulihkan tampilan overlay semula

PiP memakai opsi floating-window yang ada agar rapat tetap dalam susunan DOM asal sambil tampil di lapisan teratas browser. Tema dan tipografi tetap diwarisi tanpa menambahkan lingkup rute baru; popover asli mewarisi warna teks frame. Pesan peserta tunggal hanya menampilkan pesannya serta Keluar/Tetap, tanpa judul awal, pemilihan peserta, tombol Mulai atau status pemeriksaan awal. Uji browser membandingkan tampilan biasa dan PiP, memastikan tidak ada pengguliran vertikal pada ukuran minimum yang ada, dan memeriksa pemulihan kontrol awal. Pegangan floating-window asli tetap mendukung pembaruan ukuran minimum.

## Pertahankan pesan peserta tunggal berukuran penuh

Pulihkan judul asal, tombol Mulai nonaktif dan indikator pemeriksaan awal pada pesan peserta tunggal di jendela utama. Batasi tampilan ringkas hanya untuk PiP agar ukuran minimumnya tetap tanpa pengguliran vertikal. Uji browser memeriksa kontrol berukuran penuh sebelum mengambang dan pemulihannya saat dilepas.

## Percakapan rapat unik

Pulihkan ID ruang chat yang unik. Minta ruang terpisah untuk rapat tersimpan dan cari ruang tersimpan berdasarkan ID setelah perubahan peserta; ruang terhapus diganti melalui Messages. Pertahankan pencadangan panggilan transaksional dan rollback konflik.

## Struktur templat dan pembersihan

Pindahkan handler rute ke direktori domain, style dan markup ke direktori UI tersendiri, serta catatan rilis ke docs/changelog. Gunakan panduan templat dan alur aksi camel case. Selesaikan pembersihan penyedia browser, health dan keyring; reset keyring menghapus tanda pengiriman sambil mempertahankan rapat dan kanvas.

## Kontrak developer dan perintah

Dokumentasikan antarmuka publik dalam empat bahasa. Bedakan skrip npm lokal pada checkout dari perintah operasional berprefiks modules. Ganti label versi minimum yang menyesatkan dengan diagnostik rilis yang diuji; ketersediaan tetap berbasis kapabilitas. Gunakan Chromium/CDP tanpa Playwright.

## Pertahankan pemilik rapat yang valid dan presentasi opsional

Hapus persyaratan lama untuk membuat halaman komponen secara langsung; gateway Whiteboard opsional memiliki pembuatan halaman. Penghapusan akun mengalihkan rapat yang dipertahankan ke pengelola tersisa tanpa mengubah identitas ruang chat. Panduan menjelaskan kontrak publik tanpa nomor rilis; rilis yang disinkronkan adalah 1.5.250.

## Ilustrasi Cognis dan penyedia

Ganti banner Marketplace dengan komposisi Cognis + penyedia, tempatkan merek di pita tengah yang terlihat dan pertahankan ikon yang ada.

## Deskripsi Marketplace yang konsisten

Gunakan ringkasan tindakan singkat dan deskripsi fitur konkret pada metadata Marketplace dengan makna terjemahan yang selaras.

## Administrasi dan pemulihan rapat

Rilis 1.5.251 menambahkan pemulihan administrasi untuk referensi rapat yang bertentangan.

Administrasi → Rapat menyediakan filter Aktif, Semua rapat, dan Masalah. Daftar khusus administrator membaca catatan yang ada tanpa inisialisasi skema, menandai kelompok peserta dan URL duplikat serta referensi ruang obrolan/kanvas bersama, dan tidak menampilkan kata sandi. Akhiri mengakhiri kehadiran Cognis dan menutup rapat bagi klien Cognis yang terhubung; tindakan ini tidak mengelola konferensi Jitsi yang diikuti secara mandiri. Rapat aktif harus diakhiri sebelum dihapus. Hapus menghapus catatan dan berbagi rapat, serta ruang obrolan atau kanvas hanya jika tidak dirujuk rapat lain. Kegagalan pembersihan mempertahankan catatan untuk percobaan ulang; sumber daya yang sudah tidak ada tidak menghalangi pembersihan. Penghapusan referensi duplikat membersihkan kegagalan keunikan yang tersimpan agar inisialisasi skema normal dapat dicoba lagi. Rute nonadministrator tetap menerapkan skema normal. Penemuan rapat menghentikan penyegaran otomatis dan melaporkan kegagalan ketika respons gagal.

## Pengikatan sumber integrasi eksklusif

Obrolan rapat menyatakan `source: {sourceType: "meeting", sourceId: meeting.id}` melalui resolver Messages. Aktivasi kanvas mengklaim identitas yang sama melalui `whiteboard:sourceBinding`. Penyedia menolak pengikatan rapat yang bersaing; Jitsi tidak mengubah kolom pengikatan penyedia. Penghapusan administrator hanya melepaskan pengikatan rapat yang dihapus jika referensi lama lain masih ada. Pembersihan panggilan Messages melepaskan klaim sumber sambil mempertahankan percakapan asal. Catatan rapat panggilan baru dibatalkan jika pengikatan obrolan gagal. Pengikatan sumber Messages diwajibkan; Whiteboard tetap opsional dan hanya tersedia jika kontrak pengikatannya ada.

## Tindakan browser terbatas dan administrasi terverifikasi

Konfigurasi dan pengaktifan hanya menginisialisasi tabel konfigurasi, sehingga kegagalan integritas rapat tidak mencegah pengaktifan modul dan akses pemulihan administrasi. Administrasi hanya menginisialisasi tabel tambahan riwayat peserta yang diperlukan untuk pemeriksaan dan mempertahankan batasan rapat.

## Administrasi rapat yang mudah dibaca

Daftar rapat berbagi satu panel dengan jarak antara bagian Aktif dan Mendatang. Nama, ID, serta referensi obrolan dan kanvas yang dapat dibuka tetap bersama; pil masalah yang ringkas memberi ruang untuk peserta, aktivitas, dan tindakan. Filter memakai kontrol netral host tanpa bergerak saat diarahkan penunjuk. Daftar Mendatang hanya memuat rapat tidak aktif yang belum berakhir dengan jadwal mendatang yang valid. Jadwal lampau, kosong, dan tidak valid tetap tersedia di Semua rapat.

Rilis 1.5.252 — tata letak administrasi dan penyaringan jadwal.

## Persistensi kanvas mengikuti jenis rapat

Rilis 1.5.253 — Rapat persisten memakai `createCanvas`; hanya rapat yang secara eksplisit ditandai sementara memakai `createDisposableCanvas`. Jumlah peserta dan perubahan daftar undangan tidak mengubah persistensi kanvas. Pemetaan kanvas tersimpan yang sesuai dipakai kembali saat rapat dibuka lagi.

## Pengenal kanvas rapat yang stabil

Rilis 1.5.254 — Jitsi mengirim UUID rapat sebagai `resourceId` dan `meeting` sebagai `resourceType`; nama tampilan hanya menjadi judul. Membuka rapat yang sama meminta referensi penyedia generik yang sama, meskipun namanya berubah. Whiteboard mengelola persistensi, pemeriksaan akses, dan penyelesaian referensi bersamaan tanpa mengetahui mekanisme internal Jitsi.

## Pesan sendirian setelah masuk rapat dikonfirmasi

Rilis 1.5.255 — Pesan sendirian mengikuti konfirmasi masuk konferensi Jitsi lokal dan kehadiran terkini, bukan jumlah undangan atau keanggotaan. Masa tunggu setelah masuk atau autentikasi dan penutupan melalui Tetap berlaku seperti sebelumnya. Pesan muncul lagi setelah peserta lain masuk lalu keluar. Autentikasi yang masih menunggu tidak menampilkan pesan sendirian. Setelah Jitsi mengonfirmasi masuk, status autentikasi lama tidak dapat menggantikan pesan aktif. Tampilan dan posisi pada jendela utama dan PiP tetap sama.

## Satu identitas rapat per kelompok peserta

Rilis 1.5.256 — Pembuatan memakai kembali rapat basis data dengan kelompok peserta terkini atau asli yang sama setelah normalisasi, terlepas dari konteks pemanggil. Opsi forceNew dihapus. Kunci peserta stabil dan penyisipan atomik dengan pengabaian konflik membuat permintaan bersamaan menerima ID yang sama. Perubahan keanggotaan mempertahankan kunci awal; pencarian dan penemuan tidak lagi berhenti pada jumlah catatan tetap. Kecocokan historis memilih satu rapat aktif; beberapa rapat aktif yang cocok memerlukan pemulihan administrator. Penggunaan kembali memulihkan anggota yang diminta dan tidak mengganti hubungan obrolan yang ada. Peserta yang menunggu autentikasi mempertahankan kehadiran dan memeriksa rapat yang sama; setelah autentikasi selesai mereka masuk ke ID tersebut. Konfirmasi masuk Jitsi memulai pelacakan kehadiran berkala meskipun penanda autentikasi lama masih ada. Daftar Rapat tetap terkunci selama masuk dan konferensi, dengan kursor tidak diizinkan dan kartu noninteraktif.

## Pemulihan referensi rapat dan kanvas yang dihapus

Rilis 1.5.257 — Pembukaan kanvas secara eksplisit memperbarui referensi penyedia generik, bukan mempercayai ID kanvas tersiapkan. Kanvas yang hilang dibuat lagi melalui penyedia dan dipetakan ke rapat. Kanvas terbuka yang sudah disetujui dapat diganti tanpa permintaan persetujuan baru hanya jika penyedia memastikan kanvas lama tidak ada dan penggantinya memiliki jenis serta pengenal sumber daya yang sama persis. Peluncuran eksplisit rapat yang dihapus memakai metadata peserta yang sudah dimuat dan pembuatan kanonis normal, mempertahankan sifat sementara dan masuk ke ID pengganti. Referensi tidak dikenal, tamu, serta kegagalan izin atau layanan tidak dipakai untuk menebak sumber daya baru. Konten terhapus tidak dipulihkan; percobaan terbatas membuat item baru dengan notifikasi keberhasilan.

## Commit

- [7c8e3142](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [60428332](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)
- [1e557a1a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)
- [e869c668](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)
- [2432bb48](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)
- [6af5e9d4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6af5e9d449b87a30616d01a4aa3cbd06754c3d16)
- [3e99028a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3e99028a46b22727d6a74c79be66307e2cdf689f)
- [a94d0660](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a94d06602a508b05c7d5ce5a389212aa7a2a3ac8)
- [18feef04](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18feef04c15884d664bfc838e565fd4de5505129)
- [34a9e730](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34a9e730d6389aa4ba0fd49e4594f3219c47c7dd)
- [444c4155](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/444c415532dc20a285123231368cf2c30e376f1a)
- [d8c76966](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d8c769663b694a244b402304b37047c5e3bea699)
- [33a2ecdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33a2ecdb02e84101247c48c7247b527a4863077f)
- [09c93f4d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/09c93f4d5bb52cff518455cda7494ca302cb3b7f)
- [bce5f43f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/bce5f43fef2cc079f596771553e947adc2a77e28)
- [d0ed7631](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d0ed763193e09ee5807ff0ffa89718f45b65ffbb)
- [b864da0c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b864da0c1388c35000b8f21117ab7b52340f13a8)
- [c69fa5fc](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c69fa5fc53db518779c9ac7905cc2919d4911aae)
- [8e79fd7d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8e79fd7d77cc8857bb1482f245ea9aa56a7afeb7)
- [de197326](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/de19732675ee9d054088787f8710adfc96c809ce)
- [82899c91](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/82899c9148162acd33805632d5ce0d749e40ba6c)
- [9894d9ee](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
- [1d990487](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1d990487c733d1d4e9db03b9e2ec54d0f04632d1)
- [561ab35f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/561ab35f41d807651f2ec5c28b5ab43eda928305)
- [30603f26](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/30603f2679ed778ee2a3467de9d18b4932445836)
- [736abfbf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/736abfbf2a8579b7c6961755ad26cb6446a54cac)
- [04158e4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
- [e8042612](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e8042612c8e55a549db7aa32cbc8ab9e0d1cdd04)
- [6bd01f73](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6bd01f73b330f9d69169a81693325f3c89d445da)
- [b26fc491](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b26fc4912e6d48c8b31c18b474af3b2fd625b642)
- [65f51269](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/65f5126935c0e9f0ed63e89def8110589b88edde)
- [b1311b8d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1311b8d637806ae49c5b96067c4627cd6f182e5)
- [8d709449](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8d70944999fb802c5b776d1760d370d45696c427)
- [1e6f727](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e6f7271ff3b1fece3c748f71b10d502c7351aa8)
- [a1bceaa](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a1bceaa85535892a60cc3f3203d265a87e0b136e)
- [f129d7d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f129d7d1fea5518b657e7bd88991c3c5e96ee029)
- [ed255e0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ed255e0ff54d332cd92dc1781d11a3009be14f68)
- [1b064f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1b064f20fef5a6c239a7772a24913b370c445332)
- [daabd62](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/daabd620f48c797c05df6171576fb2e33c1d8849)
- [f47348f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f47348f871886d8fa72ca0e8fa1c0e6a126357ed)
- [202c527](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/202c527a84226b8beea541a3902136d8be2a9384)
- [adb2cb2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/adb2cb2af083776f91d58ce963cf565fe96ffb3b)
- [2abb9b4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2abb9b447b81299f68ecf92a02cf935efe33c1df)
- [3318f35](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3318f352bff2c16c79688dde53cfaa3c737c21ee)
- [d2aedf7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d2aedf74428a7eaf937f67032c1521279e38387b)
- [0d2dd75](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0d2dd75cdd8dbefe85e7850a7f95c87f0353f140)
- [e03210b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e03210b2a65f161c16a266cf85645235084690cf)
- [56838ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/56838ae4539bfae71e10088830e698248c3471cb)
- [a040064](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a040064d599dd686f662cb34a17d29192c5222b0)
- [dca2b28](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dca2b2890b9d1d63268eb086061e38def6da856a)

- [71b382c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/71b382c07cfc5aa07b906af86ba64d83f2ee11e9)
