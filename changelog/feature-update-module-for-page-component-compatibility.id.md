# Memperbarui modul untuk kompatibilitas halaman komponen

Rute SPA Rapat kini secara eksplisit mengizinkan penggunaan sebagai halaman komponen Cognis. Komponen lain dapat menemukannya melalui UUID modul Jitsi Meet dan ID rute stabil untuk tampilan overlay, layar penuh, atau gambar-dalam-gambar.

Pemanggil tertanam dapat memberikan pengenal rapat yang dapat diserialkan melalui `focusState`. Halaman dipasang di dalam root yang diberikan dengan composer tanpa bingkai sehingga navigasi host, footer, dan kontrol tema tidak digandakan.

Pengenal rute halaman komponen menggunakan nama yang dipisahkan titik agar pemanggil dapat menemukannya sesuai konvensi ID rute kanonis platform.

Siklus hidup rapat kini memperlakukan kegagalan Jitsi `conference.destroyed` sebagai rapat yang ditutup dan segera memulihkan tindakan Mulai Rapat setelah keluar. Fungsi peserta, performa, dan latar belakang dihapus dari toolbar Jitsi tertanam.

Saat kapabilitas ctx Nextcloud Whiteboard opsional tersedia, tombol Papan Tulis membuat kanvas sementara dan membuka jendela komponennya yang tersinkron di panggung rapat. Rapat langsung berpindah ke gambar-dalam-gambar tanpa memutus koneksi, dan menutup papan tulis memulihkan tampilan rapat biasa.

Integrasi tidak lagi memanggil rute API Jitsi untuk membuat papan tulis melalui modul lain. Tombol Papan Tulis hanya disediakan ketika modul Papan Tulis menyumbangkan kapabilitas CTX browser opsional `whiteboard:uiGateway`, dengan metode `createDisposableCanvas` yang menangani pembuatan oleh penyedia. Jitsi hanya menyimpan endpoint status jendela aktif lokal rapat.

Penemuan Papan Tulis kini memakai `component-pages:request` tanpa memasang UI. Setelah kanvas sementara disiapkan, aktivasi tombol oleh pengguna memanggil `component-pages:spawn` secara sinkron dengan ID panggung Jendela Rapat. Broker menangani pembatasan, pemblokiran navigasi, pembersihan penyedia, dan handle pembuangan yang dikembalikan. Gambar-dalam-gambar rapat merespons status broker `component-page-stage` tanpa pemosisian jendela komponen khusus.

Penekanan tombol Papan Tulis berulang tidak lagi membuang kanvas yang terbuka. Rapat peserta mempertahankan ID kanvas stabil berbasis sumber daya di seluruh instans rapat, rapat tanpa peserta tetap sementara, jendela broker dan halaman tertanam memenuhi panggung, serta pemasangan ulang SPA secara eksplisit memastikan penyedia UI dimuat dan menyiapkan kanvas untuk rapat saat ini.

Meetings kini mencoba ulang gateway Papan Tulis yang hilang dengan memaksa satu kali penyegaran katalog penyedia host, memperbaiki katalog usang setelah startup atau pembaruan modul tanpa siklus nonaktif/aktif. Jendela komponen memakai handle pembuangan broker dengan fallback berbasis panggung, sedangkan pembersihan seluruh rute melalui `component-pages:discardAll` tetap menjadi tanggung jawab shell SPA.

Pemasangan SPA kini mencoba ulang kesiapan penyedia, memberikan setiap panggung rapat yang baru diikat ID tujuan tahan benturan, dan meminta Papan Tulis dalam mode overlay. Ini mencegah DOM Meetings yang diparkir atau usang menerima pemasangan dan mencegah kanvas terbatas diperlakukan sebagai halaman layar penuh.

Papan Tulis yang dibuka kini meminta tampilan tanpa bingkai dan memakai penggantian jarak berbasis panggung untuk ruang kerja, panel, bagian, kisi, dan widget agar kanvas meluas ke area Jendela Rapat yang tersedia sambil mempertahankan gambar-dalam-gambar rapat.

PiP rapat kini sepenuhnya dimiliki broker halaman komponen Cognis. Modul memanggil kapabilitas jendela mengambang inti tanpa membawa kode atau gaya pemosisian PiP. Aktivasi Papan Tulis kini tetap tertunda hingga pemasangan komponen dan sinkronisasi status selesai agar polling tidak membuang pemasangan yang sedang berlangsung.

Presentasi Papan Tulis kini menandai kanvas sebagai sementara hanya untuk rapat tanpa peserta; rapat dengan peserta yang disiapkan membuka kanvas normal berbasis sumber daya.

Kapabilitas jendela mengambang inti kini diaktifkan sebelum pemasangan halaman komponen asinkron dimulai. Ini memulihkan perilaku sebelumnya: rapat masuk ke PiP segera saat Papan Tulis mengambil alih panggung, bukan menunggu pemasangan Papan Tulis selesai.

Pembuatan jendela komponen Papan Tulis kini menetapkan flag kontrak inti Cognis `borderless`, sehingga broker menghapus bingkai jendela luar sementara status fokus tanpa bingkai yang ada mengendalikan shell Papan Tulis tersemat.

Tombol Papan Tulis langsung disorot selama jendela komponennya aktif. Memilih tombol yang disorot sekali lagi akan membuang jendela komponen, melepaskan gambar-dalam-gambar rapat, dan menyinkronkan tampilan rapat default.

Rapat baru kini memperoleh nama tampilannya dari slug ruang Jitsi yang dibuat. Nama unik yang sama diteruskan ke Papan Tulis rapat, sedangkan chat Messages terkait memakai nama rapat unik yang diikuti tanggal pembuatannya.

Jendela Papan Tulis tanpa bingkai kini memungkinkan panggung Jitsi tumbuh mengikuti kontennya, bukan memotongnya dalam area bertinggi tetap dengan overflow vertikal. Panggung merespons kelas host inti `app-page__main--component-borderless`, dan override margin jendela komponen milik modul yang berlebihan dihapus demi kontrak inti.

Override tingkat host `app-page__main--component-borderless` telah dihapus. Overflow berasal dari aturan panggung Jitsi `overflow: hidden` yang dimuat lebih akhir dan menggantikan perilaku generik inti `component-page-stage`; perbaikan kini menargetkan `.jitsi-stage-frame-wrap.component-page-stage` secara langsung dan membiarkan anak tanpa bingkai menetapkan tinggi panggung otomatis.

Meetings kini menyimpan status opsional per rapat `whiteboardOpen` hanya jika kanvas Papan Tulis ada. Penyelenggara langsung membukanya; non-penyelenggara mengumpulkan suara berbasis kehadiran hingga mayoritas mutlak setuju. Klien polling yang melihat status terbuka otomatis membuat kanvas bersama dan mengaktifkan PiP rapat, termasuk peserta yang bergabung kemudian.

Memulai atau mengambil alih instans rapat tidak lagi mereset Papan Tulis per rapat yang sudah terbuka. Ini menghapus race siklus hidup bergabung yang menutup Papan Tulis rapat tanpa peserta pada pembaruan status lima detik berikutnya; penghentian rapat secara eksplisit tetap menutup Papan Tulis bersama.

Endpoint status lima detik kini mengembalikan bentuk status rapat publik yang sama dengan pemuatan rapat awal. Endpoint memetakan flag Papan Tulis internal yang tersimpan ke `whiteboardOpen`, sehingga polling tidak menganggap Papan Tulis rapat tanpa peserta yang terbuka sebagai tidak ada lalu menutup jendela komponennya.

Meetings kini mencerminkan handle Papan Tulis tanpa bingkai yang aktif ke panggung rapat sebagai `component-page-stage--borderless`. Hanya selama handle tersebut aktif, tinggi rapat tetap dan overflow panggung yang terpotong dilonggarkan agar kanvas komponen dapat memperbesar panggung; penutupan atau kegagalan pembukaan komponen memulihkan tata letak Jitsi bawaan.

Kontrol Papan Tulis kini dirender sebagai tautan dan memakai tampilan aktif standar `btn-confirm`. Sinkronisasi status buka oleh penyelenggara kini selesai sebelum aktivasi halaman komponen dan PiP, menghilangkan kondisi balapan awal antara polling dan pemasangan yang menimbulkan umpan balik kegagalan buka berulang. Kegagalan awal pemasangan komponen yang bersifat sementara dicoba ulang secara internal sebelum toast kegagalan ditampilkan.

Tindakan Papan Tulis berbasis tautan kini memiliki gaya kontrol milik modul yang lengkap. Kontrol tidak lagi tampil sebagai tautan bergaris bawah polos ketika bawaan tombol host atau deklarasi `btn-*` khusus administrasi tidak tersedia, sementara `btn-confirm` tetap memilih warna aktifnya.

Meetings kini menggunakan page-builder, stylesheet bagian halaman yang dapat digunakan ulang, dan utilitas `ensurePageStylesheet` milik Cognis core alih-alih menduplikasi palet tombol, pengalihan siklus hidup stage komponen, dan injeksi stylesheet. Ini juga memperbaiki tautan Papan Tulis nonaktif yang mewarisi warna tautan biru global: `btn-neutral` dan `btn-confirm` kini berasal dari bundel stylesheet core kanonis.

Meetings kini menggunakan kapabilitas `ui:reuse` yang baru dipublikasikan sebagai satu-satunya gateway browser menuju modul produksi di bawah `ui/reuse/` dan stylesheet reuse umum. Fasad kecil milik modul memvalidasi ketersediaan kapabilitas, setiap entrypoint UI hanya meminta utilitas yang digunakannya, `page-sections.css` dimuat melalui kapabilitas, dan injektor stylesheet duplikat telah dihapus.

Ekspor lokal `ensureStylesheetLoaded` dipulihkan sebagai delegasi yang didukung `ui:reuse`, dan entrypoint Meetings saat ini menggunakan ekspor yang sama. Ini mencegah cache SPA campuran memuat entry rute lama terhadap modul helper yang lebih baru dan menggagalkan instansiasi modul karena ekspor bernama tidak ditemukan.

Kegagalan pemasangan Papan Tulis kini dikunci untuk mount SPA Meetings saat ini. Kegagalan impor dinamis yang tidak dapat dicoba ulang dihentikan segera; semua kegagalan akhir saat persiapan atau pemasangan dicatat sekali, menampilkan “Terjadi kesalahan saat memuat papan tulis”, menonaktifkan kontrol Papan Tulis lokal, dan mencegah polling konsensus mencoba pemasangan lagi hingga pemuatan ulang atau remount SPA.

Tindakan Papan Tulis tetap berupa tautan dan kini mendelegasikan semua status visual ke Cognis core: `btn-neutral` menjadi bawaan, sedangkan hover dan status aktif/terbuka memakai `btn-confirm`. Saat pointer meninggalkan kontrol, `btn-neutral` dipulihkan kecuali Papan Tulis masih aktif.

Tautan Papan Tulis tidak lagi membawa kelas presentasi khusus modul. Tampilan bawaan, hover, dan aktifnya kini sepenuhnya berasal dari utilitas Cognis core `btn-neutral`, `btn-confirm`, dan `btn-animated`; modul hanya mempertahankan status ARIA semantik dan perilakunya.

SPA Meetings kini memanggil kontrak `loadCommonStyles()` dari kapabilitas `ui:reuse` sebelum merender, alih-alih hanya memuat `page-sections.css`. Dengan demikian, seluruh katalog stylesheet Cognis core, termasuk tampilan tombol standar, tersedia setelah navigasi langsung maupun navigasi SPA.

Tindakan Papan Tulis kini menggunakan kontrak `<button>` native dan `btn-*` core yang sama seperti tindakan Bagikan di sebelahnya, termasuk status nonaktif native. Spawn tanpa bingkai juga meneruskan kontrak tata letak pengguliran dokumen dalam konteks komponen, dan stage Jitsi aktif memakai baris grid berukuran konten dengan luapan terlihat agar kanvas tertanam dapat membesar tanpa membuat penggulir vertikal bertingkat.

Nama rapat kini dibuat sebagai empat kata oleh paket frasa sandi terpelihara yang aman secara kriptografis. Persiapan Papan Tulis mengikat hasil asinkron ke rapat asal, konsensus yang tertunda tidak dapat dilewati melalui pemetaan kanvas yang diusulkan, dan API status menolak nilai aktif non-boolean.

## Tambahkan pembersihan penghapusan instalasi dan metadata terlokalisasi

Jitsi Meet kini menghapus konfigurasi tersimpan saat dihapus instalasinya dan juga dapat menghapus seluruh konten rapat tersimpan jika diminta. Metadata toko modul kini diterjemahkan melalui kunci bahasa milik modul.

## Hapus obrolan rapat sekali pakai

Ketika rapat hanya memiliki pembuat dan tautan berbagi, menutup rapat kini juga menghapus obrolan Pesan terkait milik pembuat. Jika penghapusan obrolan gagal, catatan rapat dipertahankan agar pembersihan dapat dicoba kembali dengan aman.

## Pengaturan Modul

## Konfigurasi dari inti

Cognis kini menampilkan pengaturan yang dideklarasikan dalam manifes dan bertukar nilai melalui endpoint konfigurasi GET dan PUT milik modul. Pencatatan browser, toast, dan pelaporan kesalahan fatal menggunakan kapabilitas host.

## Standar kualitas

Modul kini menggunakan konfigurasi Prettier Cognis serta pemeriksaan mandiri untuk struktur, pelokalan, penamaan, dan konvensi dokumentasi.

## Templat dokumentasi lokal

Templat dokumentasi kontributor kini mencakup varian bahasa Jerman, Inggris, Indonesia, dan Jepang yang disalin dari standar Cognis.

## Integrasikan gateway UI berbagi ke modul rapat

Tombol berbagi rapat kini dipasang melalui antarmuka kontainer gateway UI berbagi pusat. Ikon, label yang dilokalkan, gaya, perilaku tamu, dan proses pelepasannya mengikuti perilaku Cognis yang sudah ditetapkan. Halaman rapat juga tetap dapat digunakan ketika gateway menyembunyikan pemicu untuk konteks berbagi saat ini.

Pemilik rapat juga dapat bergabung ke rapat aktif ketika hanya tamu yang menggunakan tautan berbagi yang hadir.

## Varian README yang dilokalkan

Menambahkan varian README berbahasa Jerman, Inggris, Indonesia, dan Jepang dengan symlink `README.md` berbahasa Inggris, serta pemeriksaan regresi untuk URL bundel bahasa manifest.

## Perbaikan identitas rapat dan chat sekali pakai

Rapat kini memakai nama unik empat kata secara konsisten untuk Papan Tulis dan chat Messages tanpa tanggal. Rapat sekali pakai tanpa peserta tidak lagi membuat chat, dan chat terkait yang sudah ada dihapus permanen saat rapat berakhir. Tombol Papan Tulis juga mempertahankan tampilan aktifnya setelah penggambaran ulang.

## Memulihkan tombol berbagi rapat

Jendela rapat kini mendeklarasikan kapabilitas popup berbagi yang digunakannya, sehingga Cognis dapat menyediakan tombol Bagikan dan membuka dialog berbagi standar setelah peserta bergabung.

## Perbaikan persistensi Papan Tulis peserta

Payload rapat kini secara eksplisit menunjukkan apakah terdapat peserta undangan. Rapat peserta mewajibkan pabrik kanvas persisten milik penyedia dan tidak pernah beralih ke pembuatan sekali pakai, sehingga penyimpanan otomatis untuk kanvas yang dipetakan tetap tersedia.

## Perbaikan kelas aktif Papan Tulis

Tombol Papan Tulis kini menerima kelas standar `active` selama jendela komponennya terbuka, agar sesuai dengan item navigasi terpilih dan mempertahankan penanda setelah rapat digambar ulang.

## Perbaikan penemuan tombol Papan Tulis

Tombol Papan Tulis kini hanya bergantung pada pabrik kanvas dasar penyedia dan kapabilitas jendela komponen. Metode opsional untuk kanvas persisten dan penyimpanan peserta tidak lagi membuat kontrol menghilang saat versi penyedia dimuat atau ditingkatkan.

## Penyederhanaan integrasi CSS Papan Tulis

Meetings tidak lagi menambahkan kelas presentasi khusus Papan Tulis atau menimpa jendela komponen bersama. Kontrol memakai status tombol yang diimpor dan komponen memakai kelas broker yang diimpor, sehingga stylesheet-nya tidak memengaruhi halaman SPA berikutnya.

## Perbaikan popup gantungan kunci Papan Tulis

Meetings kini meminta akses gantungan kunci dari halaman induk sebelum memasang jendela komponen Papan Tulis. Gantungan kunci yang terkunci dapat menampilkan popup buka kunci sehingga pemuatan komponen tidak terhenti pada respons otorisasi yang tidak tertangani.

## Perbaikan jenis pemetaan Papan Tulis

Meetings kini menyimpan apakah setiap Papan Tulis yang dipetakan bersifat sekali pakai. Rapat peserta menolak pemetaan lama yang jenisnya tidak diketahui atau sekali pakai dan meminta kanvas persisten baru, bukan membuka kembali kanvas sekali pakai dengan penyimpanan otomatis yang dinonaktifkan.

## Perbaikan indikator Papan Tulis terbuka

Papan Tulis yang terbuka kini memberi kontrol rapat tampilan aktif berlatar aksen dan mengubah label menjadi “Tutup Papan Tulis”, sehingga terlihat jelas bahwa memilihnya akan menutup kanvas saat ini.

## Perbaikan sinkronisasi peserta Papan Tulis

Meetings kini membatasi kanvas sekali pakai untuk sesi tanpa peserta. Kanvas rapat persisten disimpan bagi setiap peserta dan dibuka kembali secara otomatis dari pemetaan rapat, sedangkan kontrol penyelenggara dan peserta mengikuti status terbuka yang tersinkron.

## Perbaikan pembersihan shell Papan Tulis

Jendela komponen Papan Tulis kini menjaga tampilan tanpa bingkai tetap lokal pada stage Meetings. Menutup komponen atau bernavigasi pergi akan menghapus status lokal itu secara sinkron dan tidak lagi menempatkan shell halaman Cognis bersama ke mode tanpa bingkai milik broker.

## Integrasi gateway Papan Tulis persisten

Rapat peserta kini memanggil metode `createCanvas` milik penyedia Papan Tulis dengan judul rapat dan handle peserta undangan persis seperti yang disediakan gateway terbaru. Rapat tanpa peserta tetap memakai metode `createDisposableCanvas` yang terikat pada sumber daya.
