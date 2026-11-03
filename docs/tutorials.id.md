# Tutorial terpandu

Modul ini mengikat panduan pengantarnya pada halamannya melalui `ui:tutorials`. Kunjungan pertama yang diizinkan memulainya otomatis; SVG tanda tanya di samping judul halaman memutar ulang panduan. Host harus menyediakan kontrak tutorial terikat halaman versi satu.

## Contoh Penggunaan

Alur memperkenalkan rapat dan peserta yang disiapkan tanpa bergabung atau membuat rapat. Sesi online terautentikasi diperlukan.

## Spesifikasi Teknis

Host mengelola petunjuk, panah, sorotan, aksesibilitas, dan menu aksi mengambang bersama. Sesi pertama selalu menyediakan Berikutnya, tanpa Batal atau Lewati. Pemutaran ulang menyediakan Batal dengan `btn-cancel`. Penyelesaian disimpan di browser per akun. Navigasi, hilangnya akses, atau pelepasan penyedia mengakhiri sesi; pemasangan gagal membatalkan registrasi.

Panduan hanya memberi informasi dan tidak menjalankan aksi berizin khusus. Target yang hilang dapat dilewati dengan Berikutnya pada sesi pertama, atau dicoba lagi maupun dibatalkan saat pemutaran ulang.

Pengujian penyedia memeriksa kontrak publik, keempat terjemahan, aturan ketersediaan, pembersihan saat gagal, dan penolakan versi host yang tidak didukung.

Cakupan meliputi persiapan pertemuan, kontrol panggilan, chat, dan berbagi, serta pemeriksaan dan tinjauan pengakhiran atau penghapusan khusus administrator.
