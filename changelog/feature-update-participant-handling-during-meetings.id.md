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

## Amankan status rapat dan pencarian peserta

Pencarian peserta kini memverifikasi akses rapat sebelum mengecualikan rapat dari pemfilteran kehadiran aktif. Status berbagi layar menggunakan endpoint Meetings yang independen dan direset di antara instans rapat agar kunci lama tidak terbawa.

## Prioritaskan berbagi layar setiap peserta

Setiap peserta akun atau tamu Share yang berwenang dapat melaporkan peristiwa berbagi layar yang diamati Jitsi. Berbagi layar peserta mana pun akan menutup dan mengunci Whiteboard tersinkronisasi untuk seluruh rapat sampai Jitsi melaporkan bahwa berbagi telah berhenti.

## Jelaskan permintaan persetujuan peserta aktif

Persetujuan undangan rapat aktif kini memberi tahu Share peserta yang ditambahkan dan nama rapat tujuan, sehingga pemberi persetujuan melihat tindakan dan tujuan yang konkret, bukan teks tautan berbagi umum.

## Selesaikan pembongkaran Whiteboard sebelum menampilkan overlay keluar

Saat meninggalkan atau mengakhiri rapat, kanvas Whiteboard kini ditutup, jendela gambar-dalam-gambarnya dilepas, dan overlay dikembalikan ke panggung Jitsi sebelum konferensi dibuang. Pesan Rapat Ditutup dan Rapat Ditinggalkan pun muncul di panggung normal.

## Pertahankan kestabilan undangan yang dipentaskan selama penyegaran

Peserta yang secara optimistis dipindahkan ke rapat aktif kini tetap dipentaskan ketika permintaan undangan dan penyegaran keanggotaan berkala bertumpang tindih. Penanda tertunda dibersihkan setelah server mengonfirmasi keanggotaan atau undangan gagal, sehingga avatar tidak berpindah-pindah antara panggung dan daftar tersedia.

## Inisialisasi undangan tertunda setelah navigasi SPA

Pengendali peserta Meetings kini menginisialisasi kumpulan undangan tertunda setiap kali rute dipasang. Navigasi SPA dapat memasang Meetings dengan aman meskipun host mempertahankan status dari instans modul sebelumnya, tanpa menggagalkan penyegaran peserta.

## Pulihkan overlay rapat tertutup setelah PiP dibuang

Pembongkaran Whiteboard kini membuang kanvas komponen sebelum memindahkan overlay rapat kembali ke panggung Jitsi normal. Pembersihan halaman komponen tidak lagi dapat menghapus overlay yang dipulihkan, sehingga penghentian oleh moderator saat PiP terbuka menampilkan pesan Rapat Ditutup, bukan panggung kosong.

## Pulihkan overlay keluar ke panggung aktif

Pembuangan komponen Whiteboard dapat mengganti pembungkus panggungnya dan membuat referensi DOM yang ditangkap sebelumnya menjadi usang. Pembersihan keluar kini mencari frame rapat dan pembungkus panggung saat ini dari rute terpasang sebelum memulihkan overlay, sehingga Rapat Ditutup tetap terlihat pada permukaan composer aktif setelah moderator mengakhiri rapat.

## Pulihkan urutan keluar PiP yang terbukti

Pembongkaran saat keluar dari rapat kini mengikuti urutan yang telah terbukti: overlay kembali ke panggung sebelum jendela Jitsi mengambang dilepas, sementara pembuangan komponen Whiteboard tetap berlangsung asinkron dengan pencatatan kegagalan terstruktur. Penutupan sematan Jitsi dan perenderan Rapat Ditutup tidak lagi menunggu pembuangan halaman komponen yang dapat mengambil alih DOM panggung.

## Isolasi komponen Whiteboard dari panggung rapat

Komponen Whiteboard kini dipasang pada host khusus alih-alih mengambil alih pembungkus yang juga memuat Jitsi dan overlay rapat. Pembuangan komponen tidak lagi dapat menghapus UI Rapat Ditutup. Pembongkaran PiP hanya menyembunyikan dan membuang host Whiteboard, lalu memulihkan Jitsi dan overlay-nya secara terpisah.

## Pertahankan overlay rapat dalam tata letak panggung

Overlay sebelum dan setelah rapat kini menjadi elemen grid berukuran penuh, bukan anak berposisi absolut yang induknya dapat menyusut ketika Jitsi dan Whiteboard disembunyikan. Shell Whiteboard pelindung menambah batas kepemilikan di sekitar host komponen dan mencegah pembersihan komponen menghapus UI rapat di sebelahnya.

## Kecualikan panggung rapat dari penyegaran peserta

Penyegaran berkala peserta tersedia kini hanya memperbarui permukaan peserta dan rapat aktif. Penyegaran tidak lagi merender ulang avatar yang dipentaskan atau mengganti pesan panggung, sehingga Rapat Ditutup dan Rapat Ditinggalkan tetap terlihat. Pembuangan Whiteboard juga memicu pemulihan akhir dari elemen overlay yang dipertahankan bila pembersihan host melepaskannya.

## Pertahankan kompatibilitas pemulihan overlay dengan cache modul SPA

Pemulihan overlay setelah Whiteboard kini menggunakan kembali utilitas `updateOverlay` yang sudah ada secara langsung, bukan menambahkan metode utilitas lintas modul. Instans modul campuran selama navigasi SPA tidak lagi menolak promise pembersihan dengan `restoreMeetingOverlay is not a function`, sementara pemasangan saat ini tetap menerapkan kembali tampilan Rapat Ditutup atau Rapat Ditinggalkan.

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

## Gunakan kapabilitas keanggotaan Messages yang kanonis

Undangan rapat aktif dan penghapusan peserta kini menggunakan kapabilitas terpadu `social:messages:membership` dengan ID akun pelaku dan pengguna yang kanonis agar sesuai dengan kontrak integrasi Cognis Messages terkini.

## Pulihkan akses chat saat bergabung kembali

Setiap peserta terautentikasi yang bergabung ke rapat kini menjalankan kembali operasi keanggotaan Messages yang idempoten sebelum chat dimuat. Peserta yang sebelumnya meninggalkan atau mengarsipkan chat rapat dapat melihatnya kembali setelah bergabung kembali ke rapat.

## Gunakan operasi keanggotaan Whiteboard yang kanonis

Penambahan dan penghapusan peserta aktif kini memperbarui kanvas persisten melalui `whiteboard:membership` dengan ID akun penyelenggara dan peserta yang kanonis sebelum daftar peserta rapat disimpan. Perluasan akses agregat lama di sisi browser tidak lagi digunakan.

## Setujui undangan secara otomatis untuk satu peserta

Jika paling banyak satu peserta yang aktif hadir, penambahan peserta lain kini langsung disetujui tanpa menunggu konsensus dari pengguna yang sudah keluar. Rapat dengan beberapa peserta aktif tetap menggunakan keputusan persetujuan Share.

## Stabilkan proses bergabung dari notifikasi dan penguncian rapat aktif

Parameter rapat dari notifikasi yang telah digunakan kini dihapus dari URL sebelum bergabung, dan bagian rapat aktif dikunci segera setelah rapat dipilih, termasuk melalui notifikasi. Notifikasi rapat berakhir tidak lagi menyertakan URL tindakan atau tautan rapat dalam email.

## Delegasikan normalisasi handle kepada identitas Profile

Seluruh kanonisasi handle di sisi server kini menggunakan kapabilitas publik `social:profile:identity`. Penyimpanan rapat, pemeriksaan akses, pencarian peserta, orkestrasi Share, rute Whiteboard, dan operasi siklus hidup tidak lagi menyimpan atau mengimpor aturan normalisasi milik modul.

## Pertahankan pencocokan peserta berbasis direktori

Normalisasi identitas Profile yang kanonis juga diterapkan saat membandingkan pengenal peserta berbasis direktori, sehingga akses rapat tetap ada setelah handle profil berubah tanpa memperkenalkan kembali normalisasi milik modul.

## Polling rapat aktif tanpa konflik profil

Penemuan rapat aktif pasif kini mengembalikan daftar kosong yang berhasil ketika akun terautentikasi belum dapat diselesaikan menjadi handle profil yang dapat digunakan. Kegagalan penyelesaian dicatat dengan konteks terstruktur sementara operasi rapat yang bergantung pada profil tetap memerlukan profil, sehingga penyegaran berkala tidak lagi menghasilkan konflik 409 berulang.

## Deteksi rapat peserta aktif secara andal

Ketika penyelesaian profil saat ini tidak menyediakan handle, penemuan rapat aktif kini melanjutkan otorisasi dengan identitas akun terautentikasi. Dengan demikian, setiap rapat yang dianggap aktif oleh Cognis tetap terlihat ketika akun termasuk dalam peserta tersimpannya, termasuk rapat yang masih menyimpan handle profil sebelumnya.

## Teruskan identitas Profil dengan benar ke penemuan aktif

Penemuan rapat aktif kini meneruskan kapabilitas `social:profile:identity` secara eksplisit ke penyelesaian handle kanonis. Dengan demikian, akun normal seperti `admin`, `firehawk`, dan `test` kembali diselesaikan tanpa kesalahan normalisasi berulang.

## Selesaikan undangan dengan pemilik Whiteboard sebenarnya

Setelah konsensus berhasil, undangan peserta kini membaca pemilik sebenarnya dari kanvas persisten yang dipetakan, menyelesaikan ID akun kanonis pemilik tersebut, lalu menggunakannya untuk `whiteboard:membership`. Karena itu, kanvas yang dibuka peserta berwenang lain dapat diperbarui tanpa membatalkan undangan dengan respons 503.

## Hentikan polling chat setelah pengguna dikeluarkan

Ketika pengguna lokal dikeluarkan atau rapat dibongkar karena alasan lain, Meetings kini terlebih dahulu menghentikan timer polling chat dan membersihkan identitas ruang aktif serta terakhir digunakan beserta kunci ruang yang di-cache. Karena itu, penggambaran ulang berikutnya tidak dapat mengaktifkan kembali ruang rapat yang sudah dilepas atau mengirim permintaan pesan tanpa izin lebih lanjut.

## Gunakan kembali identitas rapat persisten

Pembuatan rapat kini juga menyelesaikan seluruh kumpulan peserta yang dinormalisasi dari baris peserta tersimpan. Karena itu, rapat persisten digunakan kembali setelah server dimulai ulang dan setelah perubahan keanggotaan aktif dengan ID, nama, URL, serta ruang Messages yang sama. Rapat tanpa peserta melewati penggunaan kembali, menerima identitas baru setiap kali, dan memasang chat ke rekaman baru tersebut; saat berakhir, chat tetap dihapus permanen sebelum rekaman rapat dihapus.

## Perbaiki pencarian peserta dan overlay rapat awal

Cari Peserta kini meneruskan filter hasil `user` yang didukung Cognis core sehingga hanya hasil pengguna yang ditampilkan. Perubahan fokus tanpa penyeretan aktif tidak lagi mengubah overlay rapat. Rapat aktif dipindahkan dari panel peserta ke kartu yang menyatu di overlay awal tepat di atas Mulai Rapat dan disembunyikan segera setelah rapat dipilih atau dimasuki. Peserta yang ditambahkan selama rapat aktif tetap berada dalam rekaman peserta persisten dan menentukan identitas rapat yang digunakan kembali.

## Tampilkan rapat persisten di ruang kerja peserta

Ruang kerja Peserta kini menggunakan sekitar 30% di kiri untuk pemilihan pengguna dikenal yang dapat digulir vertikal dan sekitar 70% di kanan untuk galeri rapat persisten yang memuat akun saat ini dan dapat digulir horizontal. Setiap kartu pendek memusatkan nama rapat stabil di atas dan menyebarkan hingga sepuluh avatar profil standar dengan sedikit tumpang tindih. Rapat yang dianggap aktif oleh Cognis memperoleh cahaya tepi hijau aplikasi yang mengorbit, sedangkan rapat sekali pakai tanpa peserta tidak dimasukkan ke galeri.

## Gunakan kembali atau tinggalkan rapat sebelumnya

Panel Peserta kini menyebut kartu ringkas ini “Rapat Sebelumnya”. Mengklik kartu memulihkan anggotanya ke panggung dan menggulir ke Mulai Rapat. Menahannya selama tiga detik mengubah sorotan dari hijau menjadi merah sebelum meminta konfirmasi untuk keluar. Kepergian terakhir menghapus rapat tersimpan beserta chat Messages dan Whiteboard terkait; rapat dengan satu anggota tersisa tetap dapat ditemukan agar anggota tersebut dapat menyelesaikan pembersihan.

## Sempurnakan umpan balik kartu rapat sebelumnya

Kartu Rapat Sebelumnya kini membungkus avatar sesuai tinggi konten sebenarnya dan merapat ke bagian atas galeri horizontal sehingga luapan vertikal yang tidak perlu hilang. Rapat aktif memakai segmen hijau aplikasi bertopeng yang hanya bergerak mengelilingi batas. Penahanan untuk menghapus langsung memulai gradien hijau-ke-merah yang halus dengan opasitas tetap; popup memakai perlakuan batal untuk Hapus dan netral untuk Batal, sedangkan penghapusan berhasil memakai toast informasi.

## Ringkas penemuan peserta dan riwayat rapat

Cari Peserta kini berupa avatar profil bertanda tanya di awal Peserta Tersedia. Memindahkan judul Peserta ke kolom kiri membuat Rapat Sebelumnya dimulai di ruang kanan atas yang dibebaskan, sementara pengurangan jarak galeri menghapus sisa luapan vertikal. Penahanan penghapusan tiga detik kini memakai lapisan terlihat khusus; gradien hijau beropasitas tetap dimulai saat penunjuk ditekan dan terus dianimasikan menjadi merah.

## Sejajarkan kembali judul ruang peserta

Judul Peserta bersama dikembalikan ke atas tabel dua kolom sehingga Peserta Tersedia dan Rapat Sebelumnya kembali dimulai pada baris yang sama. Luapan vertikal dipotong pada panel peserta dan kolom Rapat Sebelumnya, sementara penggulir kartu rapat horizontal dan pengguliran internal Peserta Tersedia tetap berfungsi.

## Dapatkan kembali ruang judul peserta

Judul Peserta kini menghapus margin judul bawaan serta memakai tinggi baris dan jarak yang ringkas. Rapat Sebelumnya tetap dapat digulir horizontal sepenuhnya sambil menyembunyikan bilah gulir yang terlihat pada perenderan browser berbasis standar dan WebKit.

## Seimbangkan ruang judul dan tata letak peserta

Judul Peserta kembali memakai tinggi teks alami yang diwarisi, bukan ukuran font dan tinggi baris ringkas yang dipaksakan. Panel kini mengalokasikan judul dan tabel peserta sebagai baris flex terpisah sehingga tata letak dapat tumbuh atau menyusut ke ruang induk yang tersisa tanpa ditekan oleh judul.

## Gunakan penghapusan ruang chat terotorisasi

Pembersihan rapat kini menyelesaikan kapabilitas Cognis `social:messages:deleteChatroom` dan memasok kontrak kanonis `roomId` serta `actorAccountId`. Pembersihan rapat sekali pakai memakai pemilik rapat sebagai pelaku, sedangkan kepergian terakhir dari rapat persisten memakai akun pemilik kanonis sehingga Messages dapat mengotorisasi pembuat atau satu-satunya peserta tersisa dan menghapus data chat terkait secara transaksional.

## Lanjutkan pembersihan melewati sumber daya yang hilang

Penghapusan rapat kini menganggap Whiteboard dan ruang chat terkait yang mengembalikan status, kode, atau pesan tidak ditemukan standar sebagai sudah dihapus. Kondisi dicatat dengan metadata sumber daya terstruktur, lalu pembersihan berlanjut melalui chat, berbagi, dan rekaman rapat yang tersisa; kegagalan penghapusan lain tetap menghentikan pembersihan dengan aman.

## Wajibkan kontrak penghapusan ruang chat terbaru

Jitsi kini mendeklarasikan kapabilitas publik berbasis flow `social:messages:deleteChatroom` yang diperkenalkan oleh perubahan Cognis Messages terbaru sebagai kontrak runtime wajib. Pendaftaran API memvalidasi bahwa kapabilitas dapat dipanggil, sementara pembersihan tetap memasok nilai `roomId` dan `actorAccountId` kanonis serta mempertahankan penanganan tidak-ditemukan yang idempoten.

## Tolak kegagalan layanan persetujuan

Undangan peserta kini ditolak secara aman ketika layanan persetujuan Share mengalami kegagalan, sehingga akses tidak diberikan tanpa konsensus yang diwajibkan.

## Selesaikan identitas pemohon dengan benar

Pencarian peserta kini meneruskan kontrak identitas Profile saat menyelesaikan pemohon, sehingga rapat yang diizinkan dapat dikecualikan dari pemfilteran kehadiran tanpa menyembunyikan calon undangan yang memenuhi syarat.

## Pulihkan kesetaraan catatan rilis terlokalisasi

Catatan rilis bahasa Indonesia dan Jepang kini memuat padanan terjemahan untuk setiap poin perubahan yang ada pada varian bahasa Jerman dan Inggris.

## Serialisasikan perubahan status kolaboratif

Suara Whiteboard kini diterapkan sesuai urutan rapat dan berbagi layar diperiksa kembali tepat sebelum aktivasi, sehingga suara konsensus tidak hilang dan status aktif tidak saling bertentangan. Kegagalan penyediaan akses Whiteboard kini membatalkan keanggotaan obrolan terenkripsi yang baru diberikan.

## Edit susunan peserta yang dipulihkan

Peserta di panggung kini dapat kembali ke Peserta Tersedia dengan sekali klik di luar tautan profil atau dengan menyeretnya kembali. Perubahan pada susunan peserta yang dipulihkan dari Rapat Sebelumnya kini membuat rapat baru, bukan memakai kembali nama stabil ruang lain yang cocok.

## Pulihkan kolaborasi Whiteboard langsung

Klien penyelenggara kini menyinkronkan ulang akses kanvas persisten setelah penambahan peserta aktif. Permintaan Whiteboard dari non-penyelenggara kini memanggil persetujuan Share agar peserta aktif lainnya menerima permintaan konsensus.

## Lengkapi umpan balik dan pembersihan kolaborasi

Pengiriman persetujuan Whiteboard kini menampilkan toast informasi, dan Cari Peserta disembunyikan saat kumpulan peserta tersedia kosong. Pemilik yang keluar dihapus dari keanggotaan chat agar peserta terakhir dapat menghapus ruang chat dengan otorisasi satu-satunya peserta yang valid.

## Perkuat indikator rapat aktif

Kartu aktif di Rapat Sebelumnya kini memakai segmen batas hijau yang lebih tebal dan panjang, cahaya yang lebih kuat, serta putaran lebih cepat agar rapat yang sedang berlangsung terlihat jelas.

## Tutup peletakan terbengkalai dan satukan riwayat

Peristiwa pelepasan penunjuk dan tetikus kini menutup target peletakan peserta rapat aktif yang belum selesai. Rapat Sebelumnya menyatukan ruang dengan susunan peserta kanonis yang sama menjadi satu kartu dan mengutamakan ruang aktif, sehingga perluasan berulang dari dua menjadi tiga peserta tidak memenuhi riwayat dengan kartu tiga peserta duplikat.

## Pecah modul rute dan UI yang terlalu besar

Rute ringkasan ruang obrolan rapat dan pengikatan peristiwa browser interaktif kini berada dalam modul yang terfokus, sehingga pemformatan tetap mudah dibaca dan berkas siklus hidup serta pemasangan utama jauh lebih kecil.

## Pulihkan dependensi sematan rapat SPA

Pengendali interaktif yang diekstrak kini mengimpor penyelesai URL rapat dan tema secara langsung, sehingga sinkronisasi tema serta tindakan autentikasi rapat tidak lagi gagal setelah navigasi SPA.

## Pulihkan dependensi pengendali interaktif yang tersisa

Pengendali interaktif yang diekstrak kini mengimpor normalisasi ID rapat dan klien gateway Messages secara langsung, memperbaiki pemilihan rapat aktif setelah navigasi SPA dan mencegah kegagalan cakupan yang sama saat mengirim pesan obrolan.

## Pulihkan pengikatan reset rapat

Pengikat interaksi yang diekstrak kini menerima operasi reset rapat secara eksplisit, sehingga peserta yang meninggalkan rapat kosong dapat menyelesaikan pembongkaran tanpa galat cakupan yang tidak tertangani.

## Pertahankan riwayat chat saat peserta berubah

Rapat kini menyimpan susunan peserta awal yang tetap di samping keanggotaan langsung. Rapat Sebelumnya memakai susunan tersebut dan pembuatan mencocokkan keduanya, sehingga penambahan atau penghapusan peserta tidak lagi membuat ruang pengganti dengan cepat atau memisahkan kartu stabil dari riwayat chat terenkripsinya. Permintaan konsensus papan tulis tetap menampilkan toast informasi bahwa permintaan telah dikirim.

## Perbaiki sumber daya kolaborasi dan pilihan rapat

Setiap peserta berwenang yang memulai atau memakai kembali rapat kini menyelesaikan ruang Messages terkait meskipun terdapat ID ruang lama, sehingga ruang yang hilang dapat dibuat ulang dan disimpan. Keanggotaan papan tulis persisten disinkronkan dengan peserta akun yang terdaftar dan hadir sebelum dibuka, dan kartu Rapat Aktif serta Rapat Sebelumnya yang cocok berbagi status terpilih.

## Pulihkan penyegaran chat setelah pengiriman

Pengikat interaksi yang diekstrak kini menerima callback penyegaran chat native yang terpasang secara eksplisit, sehingga pesan rapat dan pribadi yang dikirim tidak lagi menimbulkan galat cakupan yang tidak tertangani sebelum chat digambar ulang.

## Sembunyikan rapat sekali pakai dari riwayat

Rapat Sebelumnya kini mengecualikan rapat sekali pakai dengan satu akun dan hanya menampilkan rapat persisten yang didukung susunan peserta awal atau saat ini dengan beberapa akun.

## Commit

- [5d419a6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5d419a6c2ad1a3ca5abd31c553ca427e60aded63)

- [747bdc2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/747bdc20c7b38150a160f575a2be92f138d54bd5)

- [0f3516d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0f3516df8656c4e857c69b16c4c82ce03255345b)

- [4125c7b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4125c7b45a18b651ecac7611c55a6b710ef902b0)

- [591d3da](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/591d3dad10e63dddbad5eeb72cabebb5c1b43b03)

- [d1e2ed3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d1e2ed36be684a2cfff639c89f8ec3264f02e7f0)

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
- [d6f689a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f689a8d46f17897c4d1abf65f93673e99b4b30)

- [8665186](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86651863fcf6af7736904af8c01f7cc89d5a45de)

- [59c24f4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/59c24f423c6f965dc02c97444c955c334cf4c7c5)
- [5675466](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/56754666a4937045764a6ab61dff35010e5c64f1)
- [3d93676](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3d93676af78496cbcd33ad943e7a62ca11553745)
- [a3e1cf2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a3e1cf2ccc718579c47d66551fe480a1727981b2)
- [483e085](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/483e0858f5afc6861ee502a816a770fa7f393290)
- [6c42f79](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6c42f79e0872703d785ac3b8e1143cd0fd68d077)
- [05be888](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/05be8883b9154da291ebf195c09d5048067ac026)
- [5288d1d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5288d1d9cb3343ca92529ef66f35e55d6fb77c22)
- [d6fa13f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6fa13fe33cc5e764127f0d83721ac0a549568cb)
- [ab6210b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ab6210b46afc7d0abb5c7063419744075e21c460)
- [e555c2b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e555c2bc1f4c262bde5c29e988cd0aea91937ffa)
- [03f9098](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/03f909850369d744334ef22885a246acc75709a5)
- [d41ae6e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d41ae6e3d090201a450f9622efc615adb5c0d56f)
- [c2f39a9](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c2f39a9b76a7ae0075d6523f5e6b5cc65cdbd516)
- [ff2e3ec](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ff2e3ec1b8e3b2fc51e6574b4145319986f30a07)
- [d4978cd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d4978cd490af8a9f8de9aae965f0d5ffdb1f4c53)
- [f67f0bd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f67f0bda2db676a577c333632705525d1e042ef8)
- [1cfdaff](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1cfdaff9320edc04c9b12e9a4eda165a68d06849)
- [d55bb4e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d55bb4e36920abe4a0d1c57dfba23376b97af96a)
- [a0548f5](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a0548f55eafbb75b9992a48f7d0fe9d65aaa63b1)
- [a0ce233](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a0ce233c6d5c28729e3e85694cd45acd4cdff975)
- [b1387d6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1387d6c27e76ae3516e27e50abbda29987da771)
- [49c8e46](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/49c8e46c4b8e79b084579705441025663173f600)
- [a5055d9](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a5055d9155f25f28b8ac8bf719cd9e4fbe9620d9)

- [34559a7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34559a7ee8116097d73b16c9b2ed3c284ade690f)

- [a3ea56f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a3ea56f84ab3fa2653aaa7dc36ff0d8136c57e10)

- [885ab5d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/885ab5d0d6c4d90684728d3f286c86f65c3eac47)

- [8aa21f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8aa21f2566be6e37eff14ab7c7c4dc699a6db472)

- [db5a961](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/db5a961d4b24c74b08b84d0c0c1ad30873795efb)

- [38218e8](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/38218e83cfab4e5ff072f1a179033e23d84fac0a)

- [31556f7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/31556f782c79053063024c15d1d504eb7d3b004e)

- [a29b1d2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a29b1d22dd72cf413bf0e2b465b827dc1e5b89de)

- [874a2e9](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/874a2e9102e1a5015ab3f2950516af56c005edf2)
