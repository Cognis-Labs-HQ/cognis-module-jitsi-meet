# Modul Jitsi Meet

Modul Jitsi Meet menyediakan orkestrasi rapat asli Cognis dengan pemilihan peserta, ruang rapat yang dapat digunakan ulang, pengambilalihan sesi, integrasi chat Messages, dan Papan Tulis bersama opsional.

## Contoh Penggunaan

- Bergabung atau mengambil alih rapat dari `/meetings` dan `/meeting` tanpa navigasi halaman penuh.
- Memilih peserta, membagikan akses rapat, dan menggunakan chat Messages milik rapat.
- Memantau rapat aktif dan mendatang dari Administration → Meetings.
- Menyematkan rute Meetings sebagai halaman komponen overlay, layar penuh, atau gambar-dalam-gambar.

## Spesifikasi Teknis

- Panggilan API memerlukan token akses Cognis yang valid; detail rapat hanya dikembalikan kepada peserta berwenang atau tamu berbagi yang terbatas.
- Kata sandi dan pengenal ruang Jitsi yang tidak ditampilkan dibuat per rekaman rapat dengan Node Crypto. Setiap rapat dibuat dengan URL Jitsi yang konkret dan unik sebelum API iframe dipanggil; API iframe tidak pernah dibuka dengan nama ruang kosong. Permukaan pengguna dan chat grup menggunakan “Cognis Classroom” ketika menampilkan pengenal ruang tersebut tidak bermanfaat. Rapat sekali pakai tanpa peserta tidak membuat chat Messages, dan chat lama yang terkait akan dihapus permanen saat rapat berakhir. Endpoint konfigurasi `DELETE` yang diautentikasi tetap tersedia saat modul dinonaktifkan agar administrator dapat menghapus URL Jitsi yang tidak valid.
- Persistensi milik modul menyimpan konfigurasi, peserta, kehadiran, status siklus hidup, status Papan Tulis, dan suara konsensus. Inisialisasi skema pada pemasangan baru diserialkan per eksekutor basis data agar permintaan siklus hidup dan konfigurasi yang bersamaan tidak berlomba saat membuat tabel PostgreSQL.
- Pengambilalihan sesi memutus sesi rapat aktif pengguna sebelumnya.

### Kontrak Integrasi

- `bootstrap.js` adalah satu-satunya entrypoint platform; kapabilitas dan flow ctx merupakan satu-satunya permukaan integrasi lintas komponen.
- SPA Meetings menggunakan router dan page composer Cognis. Pemanggil tertanam meneruskan `meetingId` yang dapat diserialkan dalam `focusState`; mount tertanam tanpa bingkai dan tidak menduplikasi navigasi host.
- Utilitas browser dan seluruh katalog stylesheet umum dimuat melalui kapabilitas wajib `ui:reuse` sebelum permukaan Meetings dirender. Cognis core menyediakan tampilan kontrol standar, sedangkan modul tidak memuat stylesheet milik penyedia dan membatasi setiap selektor CSS modul di bawah `.jitsi-route-root`. Gaya rapat lama yang tidak digunakan tidak dikirimkan.
- Nextcloud Whiteboard dideklarasikan sebagai dependensi modul lunak agar administrator dapat memilihnya saat pemasangan tanpa menjadikannya wajib. Integrasi opsional muncul ketika pabrik kanvas dasar `whiteboard:uiGateway`, halaman komponen, dan jendela mengambang tersedia; metode `createCanvas` dalam kontrak penyedia membuat kanvas normal dengan handle peserta undangan, sedangkan hanya rapat tanpa peserta yang memakai `createDisposableCanvas`. Meetings tidak pernah beralih dari pembuatan persisten ke sekali pakai dan menyimpan jenis pemetaan, mengganti pemetaan lama yang tidak diketahui atau tidak cocok, dan membuka kanvas persisten yang telah diverifikasi secara otomatis saat rapat dimuat.
- Penyelenggara dapat langsung membuka Papan Tulis. Peserta lain memerlukan mayoritas mutlak peserta non-penyelenggara yang sedang hadir. Status buka disimpan agar peserta saat ini dan yang datang kemudian otomatis membuka kanvas yang sama serta memindahkan rapat ke gambar-dalam-gambar.
- Sebelum komponen Papan Tulis dibuka, Meetings meminta akses gantungan kunci di halaman induk agar tantangan buka kunci memiliki host popup. Papan Tulis kemudian dibuka melalui broker halaman komponen sebagai komponen overlay tertanam dengan pengguliran milik dokumen. Meetings mengandalkan kelas halaman komponen dan tombol yang diimpor, bukan menambahkan kelas presentasi atau menimpa shell halaman bersama.
- Kontrol Papan Tulis adalah `<button>` standar yang sama seperti kontrol Bagikan di sebelahnya. Kontrol memakai tampilan core `btn-neutral` secara bawaan serta status `active` dan `btn-confirm` yang diimpor saat aktif, dan labelnya berubah menjadi “Tutup Papan Tulis”. Memilih kontrol aktif akan menutupnya untuk rapat. Jika persiapan atau pemasangan gagal, Meetings mencatat kegagalan, menampilkan “Terjadi kesalahan saat memuat papan tulis”, dan menonaktifkan kontrol untuk mount browser tersebut agar polling tidak terus mencoba. Memuat ulang atau bernavigasi pergi lalu kembali membuat mount baru dan mengizinkan percobaan lain.
