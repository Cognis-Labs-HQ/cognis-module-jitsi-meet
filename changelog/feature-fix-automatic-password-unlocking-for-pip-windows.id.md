# Pulihkan pembukaan kunci rapat otomatis setelah koneksi ulang

**Cabang Fitur:** feature-fix-automatic-password-unlocking-for-pip-windows

## Gunakan kembali kata sandi tersimpan setelah proses bergabung dikonfirmasi

Koneksi ulang Jitsi kini secara otomatis mengirimkan kembali kata sandi rapat yang telah diselesaikan setelah proses bergabung ke konferensi dikonfirmasi, termasuk koneksi ulang akibat memindahkan rapat ke gambar-dalam-gambar di macOS. Permintaan berulang sebelum proses bergabung pertama tetap membuka alur koreksi keyring untuk kata sandi yang ditolak.

## Pertahankan rapat tersemat saat dipindahkan

Permintaan gambar-dalam-gambar kini meminta host mempertahankan konteks penjelajahan iframe Jitsi ketika bingkainya dipindahkan. Hal ini menangani Safari yang dapat membuat ulang konteks tersemat saat induk DOM berubah, sementara pemulihan kata sandi otomatis tetap tersedia sebagai cadangan.

## Commit

- [ec5ae21](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ec5ae213f8288e7b6fc1325493e972fb2624010b)
- [e47e3d0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e47e3d0be4d37fe1ddb119a442ccd10adf512e86)
