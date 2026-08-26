# Modul Jitsi Meet

Modul Jitsi Meet menyediakan orkestrasi rapat asli Cognis dengan pemilihan peserta, ruang rapat yang dapat digunakan ulang, pengambilalihan sesi, integrasi chat Messages, dan Papan Tulis bersama opsional.

## Contoh Penggunaan

- Bergabung atau mengambil alih rapat dari `/meetings` dan `/meeting` tanpa navigasi halaman penuh.
- Memilih peserta, membagikan akses rapat, dan menggunakan chat Messages milik rapat.
- Memantau rapat aktif dan mendatang dari Administration → Meetings.
- Menyematkan rute Meetings sebagai halaman komponen overlay, layar penuh, atau gambar-dalam-gambar.

## Spesifikasi Teknis

- Panggilan API memerlukan token akses Cognis yang valid; detail rapat hanya dikembalikan kepada peserta berwenang atau tamu berbagi yang terbatas.
- Kata sandi dibuat per rekaman rapat. Nama tampilan rapat berupa frasa empat kata yang unik tanpa awalan produk; nama yang sama mengidentifikasi Papan Tulis dan chat Messages tanpa tanggal. Rapat sekali pakai tanpa peserta tidak membuat chat Messages, dan chat lama yang terkait akan dihapus permanen saat rapat berakhir.
- Persistensi milik modul menyimpan konfigurasi, peserta, kehadiran, status siklus hidup, status Papan Tulis, dan suara konsensus.
- Pengambilalihan sesi memutus sesi rapat aktif pengguna sebelumnya.

### Kontrak Integrasi

- `bootstrap.js` adalah satu-satunya entrypoint platform; kapabilitas dan flow ctx merupakan satu-satunya permukaan integrasi lintas komponen.
- SPA Meetings menggunakan router dan page composer Cognis. Pemanggil tertanam meneruskan `meetingId` yang dapat diserialkan dalam `focusState`; mount tertanam tanpa bingkai dan tidak menduplikasi navigasi host.
- Utilitas browser dan seluruh katalog stylesheet umum dimuat melalui kapabilitas wajib `ui:reuse` sebelum permukaan Meetings dirender. Cognis core menyediakan tampilan kontrol standar, sedangkan CSS modul hanya memiliki tata letak khusus Jitsi.
- Integrasi Papan Tulis opsional hanya muncul ketika kapabilitas `whiteboard:uiGateway`, halaman komponen, dan jendela mengambang tersedia. Rapat dengan peserta memakai kanvas sumber daya persisten; rapat tanpa peserta memakai kanvas sekali pakai.
- Penyelenggara dapat langsung membuka Papan Tulis. Peserta lain memerlukan mayoritas mutlak peserta non-penyelenggara yang sedang hadir. Status buka disimpan agar peserta saat ini dan yang datang kemudian otomatis membuka kanvas yang sama serta memindahkan rapat ke gambar-dalam-gambar.
- Papan Tulis dibuka melalui broker halaman komponen sebagai komponen overlay tanpa bingkai dengan pengguliran milik dokumen. Cognis core memiliki penampungan jendela, status stage tanpa bingkai, pembersihan, dan posisi PiP; Meetings hanya melonggarkan pemotongan stage saat status tanpa bingkai milik broker aktif.
- Kontrol Papan Tulis adalah `<button>` standar yang sama seperti kontrol Bagikan di sebelahnya. Kontrol memakai tampilan core `btn-neutral` secara bawaan dan `btn-confirm` saat aktif. Memilih kontrol aktif akan menutupnya untuk rapat. Jika persiapan atau pemasangan gagal, Meetings mencatat kegagalan, menampilkan “Terjadi kesalahan saat memuat papan tulis”, dan menonaktifkan kontrol untuk mount browser tersebut agar polling tidak terus mencoba. Memuat ulang atau bernavigasi pergi lalu kembali membuat mount baru dan mengizinkan percobaan lain.
