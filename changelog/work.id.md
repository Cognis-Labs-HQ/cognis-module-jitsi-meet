# Stabilkan daftar rapat, integrasi Whiteboard, dan pembersihan akun

**Cabang Fitur:** work

## Selesaikan perenderan awal daftar rapat

Respons kosong yang berhasil untuk rapat aktif dan tersimpan kini menggantikan tampilan pemuatannya, sehingga akun tanpa rapat segera melihat keadaan kosong yang benar.

## Hormati ketersediaan Whiteboard opsional

Bilah alat rapat kini tetap tersembunyi ketika pabrik kanvas Whiteboard peramban tidak tersedia. Verifikasi sisi server tetap memakai kapabilitas `whiteboard:` stabil yang diterbitkan modul Nextcloud Whiteboard terbaru, sehingga penyedia yang tidak tersedia tidak mencapai sinkronisasi status.

## Bersihkan sumber daya sebelum menghapus rapat

Deprovisi akun kini menghapus Whiteboard yang dipetakan, ruang obrolan Messages, dan pembagian rapat sebelum menghapus rapat yang tidak dapat digunakan dari penyimpanan, dengan pencatatan kegagalan terstruktur dan pemanggilan kapabilitas yang diotorisasi pemilik.

## Dokumentasikan integrasi tercakup siklus hidup

Semua dokumentasi yang didukung kini menjelaskan penyelesaian kapabilitas Whiteboard secara eksklusif melalui konteks modul yang tercakup dalam siklus hidup.

## Aktifkan Whiteboard sebelum menyiapkan kanvas

Kontrol Whiteboard kini menjadi interaktif segera setelah penyedia peramban dan jendela komponennya siap. Pembuatan kanvas baru dimulai setelah aktivasi, dan kanvas yang belum dipetakan digunakan kembali saat percobaan ulang atau pemasangan ulang sehingga kegagalan sinkronisasi status tidak membuat duplikat.

## Commit

- [9894d9e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
- [1d99048](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1d990487c733d1d4e9db03b9e2ec54d0f04632d1)
