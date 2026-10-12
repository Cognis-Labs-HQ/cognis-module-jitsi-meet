# Selaraskan Jitsi Meet dengan Kontrak Cognis

**Cabang Fitur:** feature-align-module-with-structural-changes

## Gunakan ctx terbatas dan alur tindakan yang dijalankan

Bootstrap memperoleh layanan eksternal hanya melalui ctx yang dibatasi siklus hidup dan mendaftarkan rute, penyedia, kapabilitas serta kait milik modul. Operasi penyimpanan modul aktif menjalankan alur bernama `jitsi-meet:*` dengan tahap `initialize-store` dan `execute-action`; operasi internal mempertahankan transaksi yang ada. Otorisasi mendahului tindakan rute, dan pelaksana yang tidak lengkap gagal alih-alih melewati pekerjaan secara diam-diam. Konfigurasi saat nonaktif menggunakan titik masuk siklus hidup terbatas karena Cognis tidak mendaftarkan alur modul yang nonaktif.

## Pertahankan identitas rapat dan percakapan

Rapat persisten mempertahankan himpunan peserta asli yang dinormalisasi, identitas ruang dan kata sandi ketika keanggotaan berubah atau proses dimulai ulang. Rapat tersimpan boleh berbagi ruang Messages; reservasi panggilan sementara yang terpisah mencegah panggilan bersaing tanpa memaksakan keunikan referensi chat historis. Reservasi dan perubahan rapat tetap transaksional. Kehadiran kedaluwarsa setelah heartbeat terlewat, dan rapat yang berakhir mengabaikan sisa kehadiran.

## Hormati penyedia Whiteboard opsional

Pabrik kanvas browser opsional ditemukan setelah inisialisasi host, sedangkan server menyelesaikan kapabilitas Whiteboard yang dideklarasikan penyedia secara dinamis. Aktivasi memeriksa ketersediaan sebelum membuat kanvas. Tamu mengikuti pemetaan yang ada tanpa membuat kanvas. Persiapan serentak berbagi panggilan pabrik yang tertunda, percobaan ulang memakai kembali hasil yang belum dikonfirmasi, penggantian penyedia mengisolasi cache, dan percobaan jendela yang dibatalkan berhenti sebelum membuka lagi. Verifikasi keanggotaan dan pemetaan menggunakan identitas akun kanonis.

## Gunakan ulang pembersihan dan tolak pekerjaan UI usang

Penghapusan akun memperbarui daftar peserta tersimpan atau membersihkan sumber daya eksternal sebelum menghapus rapat yang tidak dapat dipakai. Keberangkatan terakhir dan pembersihan akun menggunakan penghapusan sumber daya terotorisasi pemilik yang sama. Satu katalog mencakup reservasi panggilan saat menghapus baris rapat. Jeda bersama yang dapat dibatalkan melepas pendengar saat selesai maupun dibatalkan. Polling memeriksa masa hidup mount, urutan permintaan dan identitas rapat sebelum menerapkan hasil, termasuk respons rapat berakhir atau sesi diambil alih.

## Pertahankan tampilan host dan sesi konferensi

Meetings menggunakan page composer, router, pratinjau profil, kontrol, overlay dan jendela mengambang host. Aturan keadaan tersembunyi hanya menargetkan kontrol dan permukaan milik Jitsi. Respons rapat kosong menyelesaikan keadaan pemuatan awal. Mount Whiteboard mempertahankan otorisasi keyring dan penguncian berbagi layar tersinkron. Pembersihan sesi autentikasi Jitsi mempertahankan preferensi browser lain dan mengizinkan browser yang menolak akses penyimpanan untuk tetap bergabung.

## Terbitkan satu kontrak rilis tersinkron

Modul 1.5.242 menyinkronkan versi paket dan inventaris SHA-256. Dokumentasi standar menjelaskan perilaku yang didukung saat ini dalam bahasa Jerman, Inggris, Indonesia dan Jepang. PR ini memakai satu set changelog dengan tautan implementasi gabungan. Pengujian perilaku mencakup eksekusi alur tindakan, penolakan izin, pembatalan percobaan ulang, kanvas serentak dan respons usang, selain pemeriksaan isolasi struktural.

## Pulihkan akses Whiteboard sebelum pembukaan otomatis

Bergabung ke rapat aktif memulihkan keanggotaan akun terotorisasi pada Whiteboard persisten yang terbuka sebelum mengembalikan data bergabung, terlepas dari pilihan chat. Pembukaan otomatis akun menjalankan `jitsi-meet:follow-whiteboard` untuk memverifikasi pemetaan terbuka yang tepat, memberikan keanggotaan terotorisasi pemilik dan mengonfirmasi pemetaan lagi sebelum mount. Mengikuti tidak memulai pemungutan persetujuan baru atau mengubah keadaan terbuka; papan tertutup atau diganti membatalkan proses tanpa pesan kesalahan. Tamu tautan mempertahankan akses terdelegasi, dan pemetaan tertutup tidak menjadikan penyedia opsional sebagai dependensi untuk bergabung.

## Kontrak presentasi publik

Jitsi memakai metode gateway publik `requestCanvasPage({signal})` dan `openCanvas({whiteboardId, elementId, signal})`. Provider Whiteboard memiliki ID rute, tata letak kanvas, transport dan semantik sesi. Jitsi hanya memberikan ID papan yang tepat dan target pemasangannya sendiri, lalu melepas jendela saat pembongkaran. Presentasi memerlukan Whiteboard 2.3.147 atau lebih baru. Perubahan anggota memakai kontrak keanggotaan publik milik server.

## Jelaskan kontrol Whiteboard yang tidak tersedia

Provider Whiteboard yang aktif dengan kontrak UI publik tidak lengkap tetap menampilkan kontrol nonaktif dengan tooltip penjelasan dan mencatat metode capability yang hilang. Kegagalan pemuatan provider juga dijelaskan. Provider opsional yang tidak ada tidak menampilkan kontrol. Ketersediaan avatar terpisah dari kesiapan Whiteboard; respons 404 ketersediaan profil tidak menonaktifkannya.

## Lindungi transisi rapat dan pulihkan kanvas persisten

Pemilihan rapat terkunci saat memuat, menyelesaikan keyring, menunggu autentikasi atau pengambilalihan sesi, dan selama konferensi tertanam. Permintaan bergabung berbagi operasi tertunda; pembatalan dan respons usang tidak mengganti tujuan saat ini. Pencarian aktif menyertakan rapat undangan yang diizinkan dengan kehadiran terkini meskipun autentikasi tertunda. Memulai kembali rapat persisten memulihkan kanvas tersimpan melalui kontrak keanggotaan publik yang diizinkan pemilik. Kanvas opsional yang tidak tersedia atau dihapus dicatat dan tidak mencegah pengguna bergabung.

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
