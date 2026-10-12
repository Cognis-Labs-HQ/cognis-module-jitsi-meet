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

Rapat tersimpan boleh berbagi percakapan Messages. Referensi historis `chat_room_id` tidak unik; `jitsi_chat_calls` mereservasi satu panggilan sementara per percakapan dan satu percakapan per panggilan. Pembuatan dan penggantian ruang mereservasi dalam transaksi pemiliknya sehingga konflik tidak meninggalkan baris yatim. Pencarian ruang mengutamakan panggilan yang direservasi, lalu rapat tersimpan yang paling baru diperbarui. Penghapusan dan reset konfigurasi melepas reservasi. Inisialisasi skema terserialisasi mencegah perlombaan permintaan konfigurasi dan siklus hidup.

Kehadiran kedaluwarsa setelah heartbeat terlewat. Bergabung menonaktifkan sesi rapat lain milik akun, dan rapat berakhir mengabaikan sisa kehadiran. Rapat tanpa undangan bersifat sementara dan menghapus chat miliknya serta catatan rapat ketika berakhir; panggilan dari Messages mempertahankan percakapan asal. Tamu tautan yang pergi tetap berada pada overlay Meninggalkan Rapat. Berakhirnya rapat sementara juga menghapus berbagi rapatnya.

### Kontrak Whiteboard Opsional

Nextcloud Whiteboard merupakan dependensi lunak. Penemuan browser menyelesaikan `whiteboard:uiGateway` setelah konteks UI host tersedia, beserta kapabilitas halaman komponen dan jendela mengambang. Pabrik kanvas menentukan ketersediaan kontrol; pabrik yang tidak tersedia membuat kontrol tidak ditampilkan. Aktivasi memeriksa endpoint ketersediaan server sebelum membuat kanvas. Verifikasi server memerlukan kontrak publik `whiteboard:fetchBoardData`, `whiteboard:membership` dan `whiteboard:deleteCanvas`; Nextcloud Whiteboard 2.3.146 atau lebih baru menyediakan kontrak verifikasi. Diagnostik ketersediaan mencakup versi penyedia, integritas dan informasi kepercayaan.

Jitsi memakai metode gateway publik `requestCanvasPage({signal})` dan `openCanvas({whiteboardId, elementId, signal})`. Provider Whiteboard memiliki ID rute, tata letak kanvas, transport dan semantik sesi. Jitsi hanya memberikan ID papan yang tepat dan target pemasangannya sendiri, lalu melepas jendela saat pembongkaran. Presentasi memerlukan Whiteboard 2.3.147 atau lebih baru. Perubahan anggota memakai kontrak keanggotaan publik milik server.

Rapat dengan undangan memakai `createCanvas`; rapat tanpa undangan memakai `createDisposableCanvas`. Pemetaan kanvas harus cocok dengan ID papan tepat, judul rapat dan akun pembuat yang diharapkan. Pembaruan keanggotaan menyelesaikan pemilik papan sebenarnya serta ID akun peserta kanonis. Tamu tautan hanya menggunakan pemetaan yang sudah diverifikasi dan tidak pernah membuat atau menggantinya. Share mendelegasikan akses hanya selama hubungan rapat-papan yang tepat sedang terbuka.

Penyelenggara dapat membuka segera; peserta lain memerlukan mayoritas mutlak peserta hadir selain penyelenggara melalui persetujuan Share. Berbagi layar mencegah pembukaan. Keadaan terbuka berlaku pada sesi rapat saat ini; pemetaan tersimpan saja tidak membuka sesi baru. Otorisasi keyring pada halaman induk mendahului jendela komponen tertanam. Pembukaan otomatis menunggu aktivasi browser, dan percobaan otomatis yang gagal tidak diulang untuk papan itu. Jeda percobaan ulang terbatas dan dapat dibatalkan; pembatalan melepas timer serta pendengar dan mencegah pembukaan berikutnya.

Persiapan kanvas serentak berbagi operasi pabrik yang tertunda. Sinkronisasi gagal dapat memakai kembali kanvas yang belum dikonfirmasi pada mount berikutnya, sementara instans penyedia berbeda memiliki cache terisolasi. Hasil setelah navigasi atau perubahan rapat tidak boleh mengubah pemicu saat ini.

Bergabung ke rapat aktif memulihkan keanggotaan akun terotorisasi pada Whiteboard persisten yang terbuka sebelum mengembalikan data bergabung, terlepas dari pilihan chat. Pembukaan otomatis akun menjalankan `jitsi-meet:follow-whiteboard` untuk memverifikasi pemetaan terbuka yang tepat, memberikan keanggotaan terotorisasi pemilik dan mengonfirmasi pemetaan lagi sebelum mount. Mengikuti tidak memulai pemungutan persetujuan baru atau mengubah keadaan terbuka; papan tertutup atau diganti membatalkan proses tanpa pesan kesalahan. Tamu tautan mempertahankan akses terdelegasi, dan pemetaan tertutup tidak menjadikan penyedia opsional sebagai dependensi untuk bergabung.

### Mount UI dan Sesi Konferensi

Meetings memakai page composer Cognis, router SPA, konteks UI yang diinisialisasi host dan `ui:reuse`. CSS modul menargetkan permukaan serta kontrol milik Jitsi dan tidak menimpa tampilan composer. Mount tertanam menerima `meetingId` dalam `focusState` dan tidak menggandakan navigasi. Setiap mount aktif mengklaim `.jitsi-route-root`; pembatalan melepas klaim serta observer, timer, penangan dan pekerjaan konferensi milik modul. Polling memeriksa masa hidup mount, urutan permintaan dan identitas rapat sebelum menerapkan hasil, termasuk keadaan berakhir atau sesi diambil alih. Respons kosong yang berhasil mengakhiri tampilan pemuatan, dan respons tak berubah mempertahankan DOM peserta.

Whiteboard dipasang melalui broker halaman komponen host. Pergerakan PiP memakai bilah alat jendela mengambang host; overlay dan target undangan mengikuti bingkai rapat aktif dan kembali saat dilepas. Ukuran minimum 400 × 225 naik sekali menjadi 500 × 282 ketika peserta aktif ketiga bergabung. Pembatalan drag, Escape dan hilangnya fokus menghapus target undangan. Pengguna yang sudah bergabung tidak dapat beralih ke rapat aktif lain. Kejadian keluar konferensi serentak berbagi satu pembersihan yang menutup bingkai, menghentikan polling chat dan memperbarui ketersediaan.

Sebelum penyematan, modul hanya menghapus ID sesi autentikasi Jitsi yang tersimpan dan mempertahankan preferensi lain. Penyimpanan browser yang ditolak atau rusak dicatat tanpa mencegah bergabung. Setelah penyambungan ulang akibat pemindahan DOM, sesi yang sebelumnya berhasil bergabung dapat mengirim ulang kata sandi yang diselesaikan. Penolakan berulang sebelum keberhasilan tetap meminta nilai keyring baru. Memulai rapat menahan token pemuatan halaman host sepanjang pemeriksaan awal dan percobaan bergabung.

### Pembersihan dan Verifikasi Rilis

Keberangkatan persisten terakhir dan penghapusan akun berbagi pembersihan sumber daya eksternal yang diotorisasi pemilik. Sumber daya hilang dicatat tanpa menghalangi pembersihan; kesalahan lain diteruskan sebelum catatan rapat dihapus. Penghapusan akun memperbarui daftar peserta asli dan aktif, mempertahankan ruang yang dapat dipakai dan menghapus rapat yang tidak dapat dipakai. Satu katalog tabel menghapus anak sebelum induk dan mencakup kehadiran, keadaan, peserta serta reservasi panggilan sementara.

Modul 1.5.240 menyinkronkan versi manifest, paket dan lockfile serta memverifikasi hash SHA-256 berkas paket. Pengujian memakai tiruan kontrak publik lokal dan menegakkan isolasi komponen, kepemilikan namespace, ukuran sumber, struktur dokumentasi dan kesetaraan bahasa. Catatan rilis memakai satu set changelog bahasa Jerman, Inggris, Indonesia dan Jepang per PR.
