# Tutorial terpandu

Modul ini mengikat panduan pengantarnya pada halamannya melalui `ui:tutorials`. Kunjungan pertama yang diizinkan memulainya otomatis; SVG tanda tanya di samping judul halaman memutar ulang panduan. Host harus menyediakan kontrak tutorial terikat halaman versi satu.

## Contoh Penggunaan

Alur memperkenalkan rapat dan peserta yang disiapkan tanpa bergabung atau membuat rapat. Sesi online terautentikasi diperlukan.

## Spesifikasi Teknis

Pengujian penyedia memeriksa kontrak publik, keempat terjemahan, aturan ketersediaan, pembersihan saat gagal, dan penolakan versi host yang tidak didukung.

Cakupan meliputi persiapan pertemuan, kontrol panggilan, chat, dan berbagi, serta pemeriksaan dan tinjauan pengakhiran atau penghapusan khusus administrator.

Penjelasan siklus rapat menyoroti kontrol Akhiri atau Hapus yang ditampilkan. Target pertama yang dapat digunakan dipilih dalam bagian tutorial; langkah dilewati jika tidak ada kontrol yang cocok.

Host bersama menyediakan aksi mengambang melalui antreannya. Kunjungan awal menawarkan Berikutnya/Selesai tanpa Batal atau Lewati; pemutaran ulang menawarkan Lewati sebelum tahap terlihat terakhir. Mulai Ulang Tutorial muncul setelah tahap terlihat pertama. Penyelesaian tetap berlaku setelah pembaruan konten. Flag highlightNext hanya mengaktifkan animasi berdenyut untuk penjelasan; pengurangan gerakan menonaktifkannya. Setiap tahap menyorot kontrol nyata berbeda sesuai urutan UI. Panduan tetap terikat ke tampilan aktif, menangani keadaan kosong dan opsional, serta membersihkan sumber daya saat navigasi atau pelepasan pemilik.

Panduan rapat menyorot seluruh panel peserta terlebih dahulu dan bagian peserta tersedia pada tahap pemilihan peserta.

Langkah chat rapat dihilangkan dari alur dan jumlah langkah selama chat tidak tersedia.

Panduan persiapan hanya tersedia saat lobi terlihat dan sematan rapat tidak aktif. Tautan langsung ke rapat tidak menawarkan target khusus lobi. Setelah meninggalkan panggilan, panduan lobi tersedia kembali. Panduan panggilan memakai akar rute modul sebagai batas bersama dan memeriksa visibilitas rapat secara terpisah, sehingga bingkai, aksi berbagi, dan obrolan opsional tetap terjangkau. Obrolan yang dinonaktifkan atau disembunyikan dikeluarkan dari alur dan jumlah langkah.

Direktori peserta kosong tidak boleh menghalangi rapat mandiri. Pencari peserta tetap terpasang saat direktori kosong agar render berulang dapat memperbarui tombol Mulai setelah pemeriksaan awal. Pemeriksaan berhasil mengizinkan pembuatan tanpa peserta terpilih; pemeriksaan gagal tetap mencegah mulai. Panduan persiapan menjelaskan Mulai tanpa peserta dan membagikan tautan setelah bergabung.
