# Memperbarui modul untuk kompatibilitas halaman komponen

Rute SPA Rapat kini secara eksplisit mengizinkan penggunaan sebagai halaman komponen Cognis. Komponen lain dapat menemukannya melalui UUID modul Jitsi Meet dan ID rute stabil untuk tampilan overlay, layar penuh, atau gambar-dalam-gambar.

Pemanggil tertanam dapat memberikan pengenal rapat yang dapat diserialkan melalui `focusState`. Halaman dipasang di dalam root yang diberikan dengan composer tanpa bingkai sehingga navigasi host, footer, dan kontrol tema tidak digandakan.

Pengenal rute halaman komponen menggunakan nama yang dipisahkan titik agar pemanggil dapat menemukannya sesuai konvensi ID rute kanonis platform.
