# Modul Jitsi Meet

Jitsi Meet menyediakan ruang rapat Cognis dengan pemilihan peserta, chat Messages, pengambilalihan sesi, berbagi terbatas dan Whiteboard opsional yang tersinkron. Layanan eksternal diselesaikan melalui ctx; modul memiliki API, sumber daya browser dan penyimpanannya.

## Contoh Penggunaan

- Di Administrasi → Modul, konfigurasikan URL instans Jitsi HTTP(S), jalankan uji aktivasi dan aktifkan Jitsi Meet. Administrasi → Meetings menampilkan rapat aktif dan mendatang.
- Buka Meetings, pilih peserta dan mulai atau gabung ke ruang. Operasi yang bergantung profil memerlukan nama profil yang terlihat. Keanggotaan aktif yang ada tetap dapat ditemukan melalui identitas akun terautentikasi jika nama profil tidak tersedia.
- Tarik peserta yang tersedia ke rapat berjalan untuk meminta persetujuan Share. Penolakan mengembalikan peserta ke daftar tersedia dan menampilkan toast.
- Pilih Whiteboard untuk membuka kanvas rapat, atau Tutup Whiteboard untuk menutupnya. Berbagi layar menonaktifkan kontrol dengan tooltip penjelasan. Tamu tautan mengikuti keadaan penyelenggara tanpa kontrol terlihat.

Pemanggil browser memperoleh integrasi VoIP dari konteks yang telah diinisialisasi host:

```js
const startCall = uiCtx.capabilities.get("voip:startCall");
const action = await startCall({
    source: "messages",
    room: { id: roomId, kind: "group" },
    users: members,
    supportedActions: ["component"],
});
```

Tindakan yang dikembalikan menjelaskan komponen Meetings; pemanggil membukanya melalui kontrak halaman komponen host.

## Spesifikasi Teknis

### Integrasi dan Alur Tindakan

`bootstrap.js` mendaftarkan rute, kontribusi UI, kapabilitas publik `jitsi-meet:getMeetingChat`, penyedia browser `voip:startCall` dan kait pada alur rapat, berbagi serta penghapusan pengguna milik host. Modul tidak memiliki akses istimewa dan mendeklarasikan UUID komponen serta kapabilitas yang diperlukan dalam manifest. Layanan Whiteboard opsional ditemukan secara dinamis dan tidak menghalangi aktivasi.

Operasi penyimpanan asinkron modul aktif menjalankan alur milik modul `jitsi-meet:*` dengan tahap `initialize-store` dan `execute-action`. Otorisasi dan validasi rute tetap pada batas API; penangan milik operasi menjalankan pekerjaan nyata, dan panggilan penyimpanan internal mempertahankan batas transaksi. Hasil eksekusi yang hilang merupakan kesalahan. Pengujian memeriksa katalog lengkap tindakan asinkron, eksekusi tahap nyata dan penerusan kesalahan memakai tiruan kontrak publik.

Titik masuk terbatas `api/disabled.js` mendaftarkan konfigurasi dan uji aktivasi tanpa rute fitur atau UI. Cognis tidak mendaftarkan alur modul nonaktif, sehingga konfigurasi siklus hidup ini memakai penyimpanan terinjeksi yang sama secara langsung. Penghapusan instalasi menghapus konfigurasi dan secara opsional data modul tersimpan. Cognis melepas pendaftaran rute, kapabilitas, alur dan kait yang dibatasi siklus hidup ketika modul dinonaktifkan.

### Konfigurasi dan Akses API

Semua endpoint memakai `/api/v1/modules/jitsi-meet`. Konfigurasi `GET` memerlukan pengguna; `PUT`, `DELETE` dan `/admin/enable-test` memerlukan administrator dan tetap tersedia saat nonaktif. Konfigurasi memvalidasi URL instans HTTP(S). Uji aktivasi memerlukan layanan terkonfigurasi yang merespons. Origin yang dikonfigurasi diberikan ke kapabilitas origin CSP host. Mengubah instans yang sudah ada menghapus data rapat milik modul melalui transaksi database.

Pembuatan rapat, bergabung, kehadiran, keadaan, klaim kata sandi, pengambilalihan sesi, perubahan peserta, ringkasan chat, keberangkatan persisten dan perubahan Whiteboard memerlukan akses terautentikasi dan otorisasi rapat. Daftar administrasi memerlukan administrator. Identitas profil serta data Messages, Share, notifikasi dan kalender memakai kapabilitas host. Tamu Share harus memiliki kapabilitas sumber daya tepat yang diperlukan operasi; izin yang ditolak tidak pernah dicoba ulang tanpa kapabilitas itu. Berbagi pengguna dan hubungan blokir diperiksa melalui kontrak akses host. Mount tamu tidak meminta profil akun atau endpoint pencarian peserta.

### Identitas Rapat dan Penyimpanan

ID dan kata sandi rapat menggunakan keacakan kriptografis. Nama berupa frasa sandi empat kata dengan huruf awal kapital yang dibuat host, dipakai kembali sebagai slug ruang, URL dan nama ruang Jitsi eksplisit. Inisialisasi tidak pernah membuat ulang identitas yang ada. Rapat persisten ditemukan berdasarkan himpunan lengkap peserta asli yang dinormalisasi dan mempertahankan ruang serta kata sandi setelah perubahan keanggotaan dan mulai ulang proses. Kredensial dan keadaan rapat memakai penyimpanan milik modul melalui pelaksana database terinjeksi host dan enkripsi terbatas cakupan.

Rapat tersimpan memiliki `chat_room_id` Messages yang unik. Rapat tersimpan baru meminta `reuseExisting: false`; membuka ulang mempertahankan ruang yang ada. Bergabung dan keluar hanya mengubah keanggotaan, bukan identitas ruang. `jitsi_chat_calls` secara terpisah mencadangkan satu panggilan sementara per percakapan. Penetapan ruang dan pencadangan bersifat transaksional sehingga konflik tidak meninggalkan baris rapat yatim. Inisialisasi skema berurutan mencegah persaingan permintaan konfigurasi dan siklus hidup.

Kehadiran kedaluwarsa setelah heartbeat terlewat. Bergabung menonaktifkan sesi rapat lain milik akun, dan rapat berakhir mengabaikan sisa kehadiran. Rapat tanpa undangan bersifat sementara dan menghapus chat miliknya serta catatan rapat ketika berakhir; panggilan dari Messages mempertahankan percakapan asal. Tamu tautan yang pergi tetap berada pada overlay Meninggalkan Rapat. Berakhirnya rapat sementara juga menghapus berbagi rapatnya.

### Kontrak Whiteboard Opsional

Nextcloud Whiteboard merupakan dependensi lunak. Penemuan browser menyelesaikan `whiteboard:uiGateway` setelah konteks UI host tersedia, beserta kapabilitas jendela mengambang. Pabrik kanvas menentukan ketersediaan kontrol; pabrik yang tidak tersedia membuat kontrol tidak ditampilkan. Aktivasi memeriksa endpoint ketersediaan server sebelum membuat kanvas. Verifikasi server memerlukan kontrak publik `whiteboard:fetchBoardData`, `whiteboard:membership` dan `whiteboard:deleteCanvas`. Diagnostik ketersediaan mencakup versi penyedia, integritas dan informasi kepercayaan.

Jitsi memakai metode gateway publik `requestCanvasPage({signal})` dan `openCanvas({whiteboardId, elementId, signal})`. Provider Whiteboard memiliki ID rute, tata letak kanvas, transport dan semantik sesi. Jitsi hanya memberikan ID papan yang tepat dan target pemasangannya sendiri, lalu melepas jendela saat pembongkaran. Perubahan anggota memakai kontrak keanggotaan publik milik server. Jitsi membatasi wadah komponen tertanam pada viewport rapat dan meregangkan elemen akar ke baris kisi dengan ukuran pasti. Permukaan penyedia yang terisolasi tetap terlihat tanpa ukuran intrinsiknya memperbesar jendela rapat.

Provider Whiteboard yang aktif dengan kontrak UI publik tidak lengkap tetap menampilkan kontrol nonaktif dengan tooltip penjelasan dan mencatat metode capability yang hilang. Kegagalan pemuatan provider juga dijelaskan. Provider opsional yang tidak ada tidak menampilkan kontrol. Ketersediaan avatar terpisah dari kesiapan Whiteboard; respons 404 ketersediaan profil tidak menonaktifkannya.

Rapat persisten memakai `createCanvas`; hanya rapat yang secara eksplisit ditandai sementara memakai `createDisposableCanvas`. Jumlah peserta dan perubahan daftar undangan tidak mengubah persistensi kanvas. Pemetaan kanvas tersimpan yang sesuai dipakai kembali saat rapat dibuka lagi. Pemetaan kanvas harus cocok dengan ID papan tepat, judul rapat dan akun pembuat yang diharapkan. Pembaruan keanggotaan menyelesaikan pemilik papan sebenarnya serta ID akun peserta kanonis. Tamu tautan hanya menggunakan pemetaan yang sudah diverifikasi dan tidak pernah membuat atau menggantinya. Share mendelegasikan akses hanya selama hubungan rapat-papan yang tepat sedang terbuka.

Penyelenggara dapat membuka segera; peserta lain memerlukan mayoritas mutlak peserta hadir selain penyelenggara melalui persetujuan Share. Berbagi layar mencegah pembukaan. Otorisasi keyring pada halaman induk mendahului jendela komponen tertanam. Pembukaan otomatis menunggu aktivasi browser, dan percobaan otomatis yang gagal tidak diulang untuk papan itu. Jeda percobaan ulang terbatas dan dapat dibatalkan; pembatalan melepas timer serta pendengar dan mencegah pembukaan berikutnya.

Persiapan kanvas serentak berbagi operasi pabrik yang tertunda. Sinkronisasi gagal dapat memakai kembali kanvas yang belum dikonfirmasi pada mount berikutnya, sementara instans penyedia berbeda memiliki cache terisolasi. Hasil setelah navigasi atau perubahan rapat tidak boleh mengubah pemicu saat ini.

Bergabung ke rapat aktif memulihkan keanggotaan akun terotorisasi pada Whiteboard persisten yang terbuka sebelum mengembalikan data bergabung, terlepas dari pilihan chat. Pembukaan otomatis akun menjalankan `jitsi-meet:followWhiteboard` untuk memverifikasi pemetaan terbuka yang tepat, memberikan keanggotaan terotorisasi pemilik dan mengonfirmasi pemetaan lagi sebelum mount. Mengikuti tidak memulai pemungutan persetujuan baru atau mengubah keadaan terbuka; papan tertutup atau diganti membatalkan proses tanpa pesan kesalahan. Tamu tautan mempertahankan akses terdelegasi, dan pemetaan tertutup tidak menjadikan penyedia opsional sebagai dependensi untuk bergabung.

Pemilihan rapat terkunci saat memuat, menyelesaikan keyring, menunggu autentikasi atau pengambilalihan sesi, dan selama konferensi tertanam. Permintaan bergabung berbagi operasi tertunda; pembatalan dan respons usang tidak mengganti tujuan saat ini. Pencarian aktif menyertakan rapat undangan yang diizinkan dengan kehadiran terkini meskipun autentikasi tertunda. Memulai kembali rapat persisten memulihkan kanvas tersimpan melalui kontrak keanggotaan publik yang diizinkan pemilik. Kanvas opsional yang tidak tersedia atau dihapus dicatat dan tidak mencegah pengguna bergabung.

### Mount UI dan Sesi Konferensi

Meetings memakai page composer Cognis, router SPA, konteks UI yang diinisialisasi host dan `ui:reuse`. CSS modul menargetkan permukaan serta kontrol milik Jitsi dan tidak menimpa tampilan composer. Mount tertanam menerima `meetingId` dalam `focusState` dan tidak menggandakan navigasi. Setiap mount aktif mengklaim `.jitsi-route-root`; pembatalan melepas klaim serta observer, timer, penangan dan pekerjaan konferensi milik modul. Polling memeriksa masa hidup mount, urutan permintaan dan identitas rapat sebelum menerapkan hasil, termasuk keadaan berakhir atau sesi diambil alih. Respons kosong yang berhasil mengakhiri tampilan pemuatan, dan respons tak berubah mempertahankan DOM peserta.

Whiteboard dipasang melalui broker halaman komponen host. PiP memakai bilah floating-window dan lapisan teratas browser sambil mempertahankan susunan DOM, tema, dan tipografi asal. Overlay, kontrol status, indikator pemeriksaan awal, dan sasaran undangan mengikuti frame rapat aktif dan kembali saat dilepas. Pesan peserta tunggal berukuran penuh mempertahankan judul, tombol Mulai nonaktif dan status pemeriksaan awal bersama Keluar/Tetap. Hanya PiP yang menyembunyikan elemen tambahan agar muat pada ukuran minimum; elemen tersebut kembali saat ditampilkan di jendela utama. Ukuran minimum adalah 400 × 225, meningkat sekali menjadi 500 × 282 ketika peserta aktif ketiga bergabung. Pembatalan seret, Escape, dan hilangnya fokus menghapus sasaran undangan. Pengguna yang sudah bergabung tidak dapat berpindah ke rapat aktif lain. Peristiwa keluar bersamaan memakai satu proses penutupan yang menutup frame, menghentikan polling chat, dan menyegarkan ketersediaan.

Sebelum penyematan, modul hanya menghapus ID sesi autentikasi Jitsi yang tersimpan dan mempertahankan preferensi lain. Penyimpanan browser yang ditolak atau rusak dicatat tanpa mencegah bergabung. Setelah penyambungan ulang akibat pemindahan DOM, sesi yang sebelumnya berhasil bergabung dapat mengirim ulang kata sandi yang diselesaikan. Penolakan berulang sebelum keberhasilan tetap meminta nilai keyring baru. Memulai rapat menahan token pemuatan halaman host sepanjang pemeriksaan awal dan percobaan bergabung.

### Pembersihan dan Verifikasi Rilis

Jika akun yang dihapus mengelola rapat yang dipertahankan, kepemilikan beralih ke peserta tersisa pertama menurut urutan handle ternormalisasi, termasuk jika pengelola sudah keluar dari daftar peserta. Pengelola lain dan identitas ruang chat tetap dipertahankan.

Keberangkatan persisten terakhir dan penghapusan akun berbagi pembersihan sumber daya eksternal yang diotorisasi pemilik. Sumber daya hilang dicatat tanpa menghalangi pembersihan; kesalahan lain diteruskan sebelum catatan rapat dihapus. Penghapusan akun memperbarui daftar peserta asli dan aktif, mempertahankan ruang yang dapat dipakai dan menghapus rapat yang tidak dapat dipakai. Satu katalog tabel menghapus anak sebelum induk dan mencakup kehadiran, keadaan, peserta serta reservasi panggilan sementara.

Modul menyinkronkan versi manifest, paket dan lockfile serta memverifikasi hash SHA-256 berkas paket. Pengujian memakai tiruan kontrak publik lokal dan menegakkan isolasi komponen, kepemilikan namespace, ukuran sumber, struktur dokumentasi dan kesetaraan bahasa. Catatan rilis memakai satu set changelog bahasa Jerman, Inggris, Indonesia dan Jepang per PR.

Versi penyedia dalam respons ketersediaan adalah diagnostik: `testedProvider` menyebut rilis yang diuji, sedangkan `provider.version` melaporkan rilis terpasang dari assurance host. Kapabilitas publik menentukan ketersediaan, bukan perbandingan versi minimum yang tidak didokumentasikan. Integrator dapat menerapkan kontrak netral yang sama tanpa Nextcloud.

### Struktur Modul dan Siklus Hidup

Registrasi API berada di `api/index.js`, handler domain di `api/routes/<domain>/index.js`, CSS di `ui/styles/`, dan markup di `ui/templates/`. Gunakan AGENTS.md turunan templat dan jalankan skrip lokal dengan `npm --prefix <checkout> test`; operasi terpasang memakai `cognisctl modules:jitsi-meet:ping`. Penyedia browser mengekspor `mountProvider(scopedUiCtx)` dan memakai alur, kapabilitas serta listener terbatas. Tautan navigasi disumbangkan melalui `ui:navbarLinks`. Kontribusi health dan pemilik keyring mengembalikan pembersihan untuk `ctx.registerDisposer`. Reset keyring menghapus tanda pengiriman kata sandi agar dikirim ulang, sambil mempertahankan rapat, keanggotaan dan kanvas.

Uji browser memakai Chromium terpasang melalui CDP tanpa Playwright: `CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm --prefix <checkout> run test:browser`. Buat ulang hash dengan `npm run manifest:hashes`, lalu periksa `npm run check:manifest`. Metadata rilis ada di `docs/changelog/` dan tidak masuk digest paket.

Banner Marketplace memadukan merek Cognis dan identitas penyedia dalam tata letak tengah yang aman dari pemotongan; ikon penyedia yang ada dipertahankan.

## Administrasi dan pemulihan rapat

Administrasi → Rapat menyediakan filter Aktif, Semua rapat, dan Masalah. Daftar khusus administrator membaca catatan yang ada tanpa inisialisasi skema, menandai kelompok peserta dan URL duplikat serta referensi ruang obrolan/kanvas bersama, dan tidak menampilkan kata sandi. Akhiri mengakhiri kehadiran Cognis dan menutup rapat bagi klien Cognis yang terhubung; tindakan ini tidak mengelola konferensi Jitsi yang diikuti secara mandiri. Rapat aktif harus diakhiri sebelum dihapus. Hapus menghapus catatan dan berbagi rapat, serta ruang obrolan atau kanvas hanya jika tidak dirujuk rapat lain. Kegagalan pembersihan mempertahankan catatan untuk percobaan ulang; sumber daya yang sudah tidak ada tidak menghalangi pembersihan. Penghapusan referensi duplikat membersihkan kegagalan keunikan yang tersimpan agar inisialisasi skema normal dapat dicoba lagi. Rute nonadministrator tetap menerapkan skema normal. Penemuan rapat menghentikan penyegaran otomatis dan melaporkan kegagalan ketika respons gagal.

## Pengikatan sumber integrasi eksklusif

Obrolan rapat menyatakan `source: {sourceType: "meeting", sourceId: meeting.id}` melalui resolver Messages. Aktivasi kanvas mengklaim identitas yang sama melalui `whiteboard:sourceBinding`. Penyedia menolak pengikatan rapat yang bersaing; Jitsi tidak mengubah kolom pengikatan penyedia. Penghapusan administrator hanya melepaskan pengikatan rapat yang dihapus jika referensi lama lain masih ada. Pembersihan panggilan Messages melepaskan klaim sumber sambil mempertahankan percakapan asal. Catatan rapat panggilan baru dibatalkan jika pengikatan obrolan gagal. Pengikatan sumber Messages diwajibkan; Whiteboard tetap opsional dan hanya tersedia jika kontrak pengikatannya ada.

Konfigurasi dan pengaktifan hanya menginisialisasi tabel konfigurasi, sehingga kegagalan integritas rapat tidak mencegah pengaktifan modul dan akses pemulihan administrasi. Administrasi hanya menginisialisasi tabel tambahan riwayat peserta yang diperlukan untuk pemeriksaan dan mempertahankan batasan rapat.

## Administrasi rapat yang mudah dibaca

Daftar rapat berbagi satu panel dengan jarak antara bagian Aktif dan Mendatang. Nama, ID, serta referensi obrolan dan kanvas yang dapat dibuka tetap bersama; pil masalah yang ringkas memberi ruang untuk peserta, aktivitas, dan tindakan. Filter memakai kontrol netral host tanpa bergerak saat diarahkan penunjuk. Daftar Mendatang hanya memuat rapat tidak aktif yang belum berakhir dengan jadwal mendatang yang valid. Jadwal lampau, kosong, dan tidak valid tetap tersedia di Semua rapat.

## Pengenal kanvas rapat yang stabil

Jitsi mengirim UUID rapat sebagai `resourceId` dan `meeting` sebagai `resourceType`; nama tampilan hanya menjadi judul. Membuka rapat yang sama meminta referensi penyedia generik yang sama, meskipun namanya berubah. Whiteboard mengelola persistensi, pemeriksaan akses, dan penyelesaian referensi bersamaan tanpa mengetahui mekanisme internal Jitsi.

## Pesan sendirian setelah masuk rapat dikonfirmasi

Pesan sendirian mengikuti konfirmasi masuk konferensi Jitsi lokal dan kehadiran terkini, bukan jumlah undangan atau keanggotaan. Masa tunggu setelah masuk atau autentikasi dan penutupan melalui Tetap berlaku seperti sebelumnya. Pesan muncul lagi setelah peserta lain masuk lalu keluar. Autentikasi yang masih menunggu tidak menampilkan pesan sendirian. Setelah Jitsi mengonfirmasi masuk, status autentikasi lama tidak dapat menggantikan pesan aktif. Tampilan dan posisi pada jendela utama dan PiP tetap sama.

## Satu identitas rapat per kelompok peserta

Pembuatan memakai kembali rapat basis data dengan kelompok peserta terkini atau asli yang sama setelah normalisasi, terlepas dari konteks pemanggil. Opsi forceNew dihapus. Kunci peserta stabil dan penyisipan atomik dengan pengabaian konflik membuat permintaan bersamaan menerima ID yang sama. Perubahan keanggotaan mempertahankan kunci awal; pencarian dan penemuan tidak lagi berhenti pada jumlah catatan tetap. Kecocokan historis memilih satu rapat aktif; beberapa rapat aktif yang cocok memerlukan pemulihan administrator. Penggunaan kembali memulihkan anggota yang diminta dan tidak mengganti hubungan obrolan yang ada. Peserta yang menunggu autentikasi mempertahankan kehadiran dan memeriksa rapat yang sama; setelah autentikasi selesai mereka masuk ke ID tersebut. Konfirmasi masuk Jitsi memulai pelacakan kehadiran berkala meskipun penanda autentikasi lama masih ada. Daftar Rapat tetap terkunci selama masuk dan konferensi, dengan kursor tidak diizinkan dan kartu noninteraktif.

## Pemulihan referensi rapat dan kanvas yang dihapus

Pembukaan kanvas secara eksplisit memperbarui referensi penyedia generik, bukan mempercayai ID kanvas tersiapkan. Kanvas yang hilang dibuat lagi melalui penyedia dan dipetakan ke rapat. Kanvas terbuka yang sudah disetujui dapat diganti tanpa permintaan persetujuan baru hanya jika penyedia memastikan kanvas lama tidak ada dan penggantinya memiliki jenis serta pengenal sumber daya yang sama persis. Peluncuran eksplisit rapat yang dihapus memakai metadata peserta yang sudah dimuat dan pembuatan kanonis normal, mempertahankan sifat sementara dan masuk ke ID pengganti. Referensi tidak dikenal, tamu, serta kegagalan izin atau layanan tidak dipakai untuk menebak sumber daya baru. Konten terhapus tidak dipulihkan; percobaan terbatas membuat item baru dengan notifikasi keberhasilan.

Halaman Meetings yang dimuat langsung membatalkan mount saat host menjalankan perubahan rute atau dokumen ditinggalkan. Polling penemuan rapat dimiliki mount tersebut, berhenti saat dibatalkan, dan tidak dapat dimulai kembali. Respons terlambat dan permintaan yang dibatalkan tidak boleh mengubah halaman tujuan atau menampilkan galat Meetings di sana. Navigasi yang dibatalkan mempertahankan halaman saat ini.

Referensi menggunakan komposer bagian yang dapat dibuka dari host, sama seperti Components. Referensi yang terbuka tetap terbuka selama polling rapat dan rapat mendatang, dengan kontrol yang dapat digunakan melalui papan ketik. Filter Rapat Aktif, Semua Rapat, dan Rapat Bermasalah masing-masing memiliki pesan kosong tersendiri.

Klaim sumber kanvas hanya dilakukan setelah persetujuan, di dalam pembaruan status berseri. Kegagalan sinkronisasi anggota atau penyimpanan melepas klaim baru dan mempertahankan klaim yang sudah dipetakan. Pembuatan rapat umum tidak membuat panggilan sementara; pemulihan panggilan percakapan memakai rute VoIP percakapan yang ada. Polling rapat mendatang yang sudah tergantikan diabaikan. Halaman langsung memakai sinyal siklus hidup host, bukan controller mandiri.

## Tangani koneksi terputus saat pencarian ruang

Pencarian ruang menghentikan polling setelah kegagalan jaringan dan menangani penolakan promise pewaktu. Permintaan luring dan yang dibatalkan tidak memunculkan toast kesalahan pencarian atau menghapus daftar ruang terakhir. Modul menggunakan kapabilitas status luring host yang opsional dan mengikat pembersihan pada sinyal halaman. Polling kehadiran dan status ruang aktif mengikuti siklus hidup yang sama dan berhenti bersama setelah permintaan latar belakang gagal.
