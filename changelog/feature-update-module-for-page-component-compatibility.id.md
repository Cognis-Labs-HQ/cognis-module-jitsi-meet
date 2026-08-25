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
