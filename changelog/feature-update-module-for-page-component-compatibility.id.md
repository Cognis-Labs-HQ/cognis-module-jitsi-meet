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
