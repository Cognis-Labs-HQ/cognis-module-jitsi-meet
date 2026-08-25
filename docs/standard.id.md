# Modul Jitsi Meet

Modul Jitsi Meet menyediakan orkestrasi rapat native Cognis dengan pemilihan peserta, penggunaan ulang URL rapat, pengambilalihan sesi, dan penggunaan ulang ruang chat dari adapter Messages.

## Contoh Penggunaan

- URL instans Jitsi dan prefiks URI opsional yang ditampilkan Cognis dari manifes dan disimpan oleh endpoint konfigurasi milik modul
- Rute aplikasi `/meetings` dan `/meeting` dengan:
    - pemeriksaan ketersediaan khusus halaman yang langsung berhenti setelah berpindah halaman
    - area rapat/overlay
    - pemilihan peserta dan drag-and-drop
    - handoff URL chat ke adapter Messages
- Persistensi rapat pada tabel milik modul
- Akses API dibatasi peserta berdasarkan username
- Otorisasi peserta fallback classroom saat `classroom_id` diisi
- Pemantauan rapat aktif di Administrasi → Meetings
- Dependensi berbasis UUID pada gateway Social, adapter Profile, gateway Share, dan adapter Messages, serta persyaratan runtime berbasis kapabilitas `auth:requireAuth` dan `ui:profileAvatarRenderer`
- Halaman komponen Rapat yang diizinkan secara eksplisit, ditemukan melalui UUID permanen modul ini dan ID rute `module.jitsi.meet.meetings`, dengan mode overlay, layar penuh, dan gambar-dalam-gambar

## Spesifikasi Teknis

- Panggilan API memerlukan access token Cognis yang valid.
- Detail rapat hanya diberikan ke peserta yang diizinkan.
- Password rapat dibuat untuk setiap catatan rapat.
- Setiap nama rapat menyertakan slug ruang Jitsi yang dibuat. Nama unik yang sama diteruskan ke Papan Tulis, dan judul chat Messages menggabungkan nama tersebut dengan tanggal pembuatan.
- Reclaim sesi memungkinkan pengguna memutus sesi aktif sebelumnya.

### Kontrak Integrasi

- `bootstrap.js` adalah satu-satunya entrypoint modul yang dipakai platform.
- ctx bootstrap adalah satu-satunya bus integrasi modul ini (rute API, registrasi UI, kapabilitas, serta wiring CLI/DB di masa depan).
- Impor langsung dari modul lain atau internal core dilarang; integrasi wajib lewat permukaan yang diberikan ctx.
- Pemanggil halaman komponen meneruskan `meetingId` yang dapat diserialkan dalam `focusState`; mount tertanam tetap berada di root yang diberikan dan memakai composer tanpa bingkai tanpa menggandakan navigasi host.
- Deteksi berakhirnya rapat mencakup kegagalan Jitsi `conference.destroyed`, tindakan Mulai Rapat segera dipulihkan setelah keluar, dan toolbar tertanam menyembunyikan kontrol peserta, performa, serta latar belakang.
- Saat kapabilitas browser Nextcloud Whiteboard opsional `whiteboard:uiGateway` aktif, panggung rapat menyediakan jendela komponen papan tulis tersinkron yang persisten untuk rapat dengan peserta dan sementara untuk rapat tanpa peserta dan mempertahankan rapat tanpa gangguan dalam gambar-dalam-gambar sampai papan tulis ditutup.
- Ketersediaan Papan Tulis ditemukan tanpa memasang UI. Klik pengguna memanggil `component-pages:spawn` dengan ID elemen panggung rapat, lalu handle yang dikembalikan dibuang saat jendela ditutup atau halaman rapat dilepas.
- Papan Tulis yang dibuka tetap terpasang sampai rapat ditutup atau tombol Papan Tulis yang disorot dipilih lagi. Rapat dengan peserta undangan mempertahankan ID kanvas berbasis sumber daya untuk instans berikutnya, sedangkan rapat tanpa peserta tetap sementara; pemuatan penyedia dan persiapan kanvas diulang dengan aman saat navigasi SPA mengganti rapat yang dipilih.
- Jika gateway Papan Tulis tidak ada dalam katalog penyedia yang tersimpan, Meetings memaksa satu kali penyegaran katalog sebelum menyembunyikan integrasi. Pembongkaran jendela memakai handle broker atau fallback pembuangan berbasis panggung; `component-pages:discardAll` global tetap dimiliki shell SPA Cognis.
- Kesiapan penyedia dicoba ulang selama pemasangan SPA, dan setiap panggung rapat yang dirender menerima ID tujuan tahan benturan agar DOM yang diparkir atau usang tidak menangkap jendela komponen baru. Papan Tulis meminta tampilan overlay, bukan layar penuh.
- Papan Tulis yang dibuka meminta kontrak jendela komponen inti `borderless` dan tampilan tanpa bingkai. Saat inti menerapkan `app-page__main--component-borderless` untuk mengurangi margin luar dan dalam, panggung rapat beralih dari tinggi tetap dan overflow terpotong ke tinggi berbasis konten agar kanvas lengkap dapat memperluas halaman secara vertikal.
- Meetings mengaktifkan kapabilitas jendela mengambang inti Cognis sebelum memasang halaman komponen Papan Tulis, sehingga gambar-dalam-gambar tetap terlihat selama awal komponen asinkron tanpa pemosisian atau gaya milik modul.
