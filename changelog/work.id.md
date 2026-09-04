# Panggilan VoIP yang lebih aman dan netral penyedia

**Cabang Fitur:** work

## Otorisasi panggilan dari keanggotaan ruang kanonis

Endpoint VoIP kini meminta penyelesai ruang Messages tepercaya untuk mengotorisasi pemohon dan memperoleh seluruh daftar peserta. Daftar anggota yang dikirim klien tidak lagi dapat memilih peserta.

## Gunakan kembali satu pemetaan ruang dengan aman

Panggilan sekali pakai kini memakai referensi ruang percakapan yang sudah ada dan dilindungi batasan skema unik. Permintaan serentak menggunakan kembali rapat yang lebih dahulu dibuat tanpa menambahkan bidang ruang sumber kedua, sementara pembersihan mempertahankan percakapan milik penyedia.

## Lokalkan dan bersihkan panggilan penyedia

Penyedia memakai istilah VoIP yang netral, menerima subjek dari konsumen, dan menggunakan subjek terlokalkan jika tidak diberikan. Penutupan komponen host kini menjalankan pembersihan kehadiran normal sebelum membuang Jitsi.

## Commit

- [6e02bef](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6e02befec71d6adcd77a18e5a56487f835ee91bd)
