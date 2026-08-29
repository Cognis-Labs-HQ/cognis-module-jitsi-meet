# Modul Jitsi Meet

Modul Jitsi Meet menyediakan orkestrasi rapat asli Cognis dengan pemilihan peserta, ruang rapat yang dapat digunakan ulang, pengambilalihan sesi, integrasi chat Messages, dan Papan Tulis bersama opsional.

## Contoh Penggunaan

- Bergabung atau mengambil alih rapat dari `/meetings` dan `/meeting` tanpa navigasi halaman penuh.
- Memilih peserta, membagikan akses rapat, dan menggunakan chat Messages milik rapat.
- Memantau rapat aktif dan mendatang dari Administration → Meetings.
- Menyematkan rute Meetings sebagai halaman komponen overlay, layar penuh, atau gambar-dalam-gambar.

## Spesifikasi Teknis

- Panggilan API memerlukan token akses Cognis yang valid; detail rapat hanya dikembalikan kepada peserta berwenang atau tamu berbagi yang terbatas.
- Kata sandi dibuat per rekaman rapat. Nama rapat berupa frasa sandi empat kata dengan kapitalisasi judul yang dibuat melalui kapabilitas host `reuse:generatePassphrase`. Nama yang sama, dipisahkan tanda hubung, disimpan sebagai nama tampilan dan slug ruang Jitsi, disertakan dalam URL rapat, serta selalu diteruskan secara eksplisit ke `JitsiMeetExternalAPI`; modul tidak pernah meminta Jitsi membuat atau melaporkan nama ruang. Nama itu juga diteruskan ke daftar rapat, chat Messages, berbagi, dan Papan Tulis. Rapat tanpa peserta menerima chat Messages beranggota tunggal saat dibuat agar tamu tautan berbagi dapat bergabung kemudian; chat tersebut dihapus permanen saat rapat sekali pakai berakhir. Endpoint konfigurasi `DELETE` terautentikasi tetap tersedia ketika modul dinonaktifkan agar administrator dapat menghapus URL Jitsi yang tidak valid.
- Persistensi milik modul menyimpan konfigurasi, peserta, kehadiran, status siklus hidup, status Papan Tulis, dan suara konsensus. Inisialisasi skema pada pemasangan baru diserialkan per eksekutor basis data agar permintaan siklus hidup dan konfigurasi yang bersamaan tidak berlomba saat membuat tabel PostgreSQL.
- Pengambilalihan sesi memutus sesi rapat aktif pengguna sebelumnya.

### Kontrak Integrasi

- `bootstrap.js` adalah satu-satunya entrypoint platform; kapabilitas dan flow ctx merupakan satu-satunya permukaan integrasi lintas komponen.
- SPA Meetings menggunakan router dan page composer Cognis. Pemanggil tertanam meneruskan `meetingId` yang dapat diserialkan dalam `focusState`; mount tertanam tanpa bingkai dan tidak menduplikasi navigasi host.
- Utilitas browser dan seluruh katalog stylesheet umum dimuat melalui kapabilitas wajib `ui:reuse` sebelum permukaan Meetings dirender. Cognis core menyediakan tampilan kontrol standar, sedangkan modul tidak memuat stylesheet milik penyedia dan membatasi setiap selektor CSS modul di bawah `.jitsi-route-root`. Gaya rapat lama yang tidak digunakan tidak dikirimkan.
- Nextcloud Whiteboard dideklarasikan sebagai dependensi modul lunak agar administrator dapat memilihnya saat pemasangan tanpa menjadikannya wajib. Integrasi opsional muncul ketika pabrik kanvas dasar `whiteboard:uiGateway`, halaman komponen, dan jendela mengambang tersedia; metode `createCanvas` dalam kontrak penyedia membuat kanvas normal dengan handle peserta undangan, sedangkan hanya rapat tanpa peserta yang memakai `createDisposableCanvas`. Meetings tidak pernah beralih dari pembuatan persisten ke sekali pakai dan menyimpan jenis pemetaan, mengganti pemetaan lama yang tidak diketahui atau tidak cocok, dan memakai kembali kanvas persisten yang telah diverifikasi hanya ketika pengguna sengaja membukanya.
- Penyelenggara dapat langsung membuka Papan Tulis. Peserta lain memerlukan mayoritas mutlak peserta non-penyelenggara yang sedang hadir. Status buka disinkronkan hanya untuk sesi rapat saat ini agar peserta yang hadir membuka kanvas yang sama dan memindahkan rapat ke gambar-dalam-gambar. Mengakhiri rapat menghapus status tersebut; pemetaan kanvas persisten tidak akan terbuka hanya karena sesi rapat baru dimulai.
- Sebelum komponen Papan Tulis dibuka, Meetings meminta akses gantungan kunci di halaman induk agar tantangan buka kunci memiliki host popup. Papan Tulis kemudian dibuka melalui broker halaman komponen sebagai komponen overlay tertanam dengan pengguliran milik dokumen. Meetings mengandalkan kelas halaman komponen dan tombol yang diimpor, bukan menambahkan kelas presentasi atau menimpa shell halaman bersama.
- Kontrol Papan Tulis adalah `<button>` standar yang sama seperti kontrol Bagikan di sebelahnya. Kontrol memakai tampilan core `btn-neutral` secara bawaan serta status `active` dan `btn-confirm` yang diimpor saat aktif, dan labelnya berubah menjadi “Tutup Papan Tulis”. Memilih kontrol aktif akan menutupnya untuk rapat. Kapabilitas penyedia, halaman komponen, dan keyring dimuat ulang serta dicoba kembali selama modulnya selesai dimuat, termasuk setelah navigasi langsung ke rapat atau pemuatan ulang halaman. Jika persiapan atau pemasangan masih gagal, Meetings mencatat kegagalan, menampilkan “Terjadi kesalahan saat memuat papan tulis”, dan tetap menyediakan kontrol yang telah disiapkan untuk percobaan ulang yang disengaja.
