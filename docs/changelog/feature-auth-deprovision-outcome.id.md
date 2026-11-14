# Otorisasi pembersihan akun Jitsi

**Cabang fitur:** feature-auth-deprovision-outcome

## Wajibkan hasil penghapusan milik Auth

Jitsi 1.6.16 mengambil protokol v1 `auth:deprovisionOutcome` melalui konteks tahap aktif dan `system:contracts`. Hanya penghapusan yang sudah selesai dan dikonfirmasi penyedia yang mengizinkan pembersihan akun asli. Masukan yang berubah dan hasil persistensi publik tidak dapat memberikan atau mengalihkan izin tersebut. Kontrak yang hilang atau tidak kompatibel menghentikan pembersihan. Kepemilikan rapat, urutan penghapusan sumber daya, penanganan kesalahan, dan siklus hidup modul tetap dipertahankan.

## Koordinasikan rilis host dan modul

Pendamping ini memerlukan kontrak hasil kandidat Auth 2.2.12 dan referensi tahap flow yang tidak dapat diubah dari Core 0.6.6. Keduanya merupakan dependensi rilis terkoordinasi, bukan klaim dukungan host yang sudah dirilis. Instal host yang sesuai sebelum mengaktifkan modul ini dan perbarui konsumen Jitsi lama sebelum menganggap pembersihannya terlindungi. Pertahankan perubahan penerimaan tamu terverifikasi dari [PR #33](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/pull/33). Tidak tersedia jalur cadangan untuk host lama.

## Uji pembersihan melalui flow terdaftar

Pengujian sintetis menjalankan bootstrap yang diekspor serta flow pembersihan dan penyimpanan terdaftar. Cakupannya meliputi hasil palsu, target yang berubah, pengikatan pemanggilan, masa aktif penyedia, kesalahan sumber daya, Whiteboard opsional, penonaktifan/pengaktifan ulang, dan pencopotan modul. Perubahan khusus server ini tidak menambahkan kontrol atau langkah tutorial. Validasi tidak mengubah akun, rapat, atau sumber daya eksternal nyata.

## Komit
