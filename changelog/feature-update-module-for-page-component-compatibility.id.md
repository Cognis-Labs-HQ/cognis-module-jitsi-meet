# Memperbarui modul untuk kompatibilitas halaman komponen

Rute SPA Rapat kini secara eksplisit mengizinkan penggunaan sebagai halaman komponen Cognis. Komponen lain dapat menemukannya melalui UUID modul Jitsi Meet dan ID rute stabil untuk tampilan overlay, layar penuh, atau gambar-dalam-gambar.

Pemanggil tertanam dapat memberikan pengenal rapat yang dapat diserialkan melalui `focusState`. Halaman dipasang di dalam root yang diberikan dengan composer tanpa bingkai sehingga navigasi host, footer, dan kontrol tema tidak digandakan.

Pengenal rute halaman komponen menggunakan nama yang dipisahkan titik agar pemanggil dapat menemukannya sesuai konvensi ID rute kanonis platform.

Siklus hidup rapat kini memperlakukan kegagalan Jitsi `conference.destroyed` sebagai rapat yang ditutup dan segera memulihkan tindakan Mulai Rapat setelah keluar. Fungsi peserta, performa, dan latar belakang dihapus dari toolbar Jitsi tertanam.

Saat kapabilitas ctx Nextcloud Whiteboard opsional tersedia, tombol Papan Tulis membuat kanvas sementara dan membuka jendela komponennya yang tersinkron di panggung rapat. Rapat langsung berpindah ke gambar-dalam-gambar tanpa memutus koneksi, dan menutup papan tulis memulihkan tampilan rapat biasa.
