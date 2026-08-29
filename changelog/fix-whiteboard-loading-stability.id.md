# Stabilkan pemuatan Papan Tulis

- **Cabang fitur:** `fix-whiteboard-loading-stability`
- **Commit:**
    - `7141534` — Stabilkan pemuatan Papan Tulis dan sinkronisasi sesi
    - `12ad748` — Satukan catatan rilis Papan Tulis

## Perubahan

Halaman komponen Papan Tulis diminta satu kali untuk setiap mount rapat dan percobaan ulang jendela komponen tetap dibatasi. Selama permintaan keyring atau pemasangan komponen berlangsung, kontrol tetap dinonaktifkan dengan label normal dan berubah menjadi “Tutup Papan Tulis” hanya setelah pemasangan berhasil. Pemasangan lama yang dibatalkan tidak lagi menampilkan toast kegagalan, kanvas persisten hanya dibuka dari status eksplisit sesi saat ini, dan mengakhiri atau memulai ulang rapat akan menghapus status tersebut.
