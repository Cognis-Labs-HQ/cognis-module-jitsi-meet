# Akses Papan Tulis untuk Tamu Berbagi

**Cabang Fitur:** work

## Otorisasi status tamu yang tercakup pada rapat

Pembaruan status Papan Tulis kini memvalidasi tamu tautan berbagi melalui gateway Share terhadap rapat yang diminta dan memakai identitas sintetis stabil yang sama dengan kehadiran rapat untuk suara konsensus.

## Gunakan kembali Papan Tulis buatan host

Tamu tautan berbagi kini memakai pemetaan Papan Tulis rapat yang sudah ada dan menunggu akun berwenang atau host membuatnya bila pemetaan belum tersedia.

## Gunakan delegasi Share generik

Jitsi Meet kini memperluas `resolve-share-delegated-access` alih-alih menerbitkan kapabilitas khusus Papan Tulis. Modul membuktikan hubungan aktif rapat-ke-papan yang tepat dan mendeklarasikan `meeting:join` sebagai izin sumber, sedangkan Share memvalidasi token tamu secara mandiri.

## Pisahkan modul yang terlalu besar

Pembuatan skema dan pengisian ulang kredensial dipindahkan ke modul skema-store yang terfokus, cakupan regresi UI dibagi menjadi dua berkas pengujian yang kohesif, dan spasi normal antara deklarasi serta metode dipulihkan.

## Aktifkan Kontrol Papan Tulis Tamu yang Aman

Tampilan berbagi kini memasang kontrol Papan Tulis dan mengautentikasi permintaan status dengan token tamu yang tercakup. API hanya mengizinkan tamu membuka atau menutup kanvas yang dipetakan secara tepat ke rapat mereka serta menolak pembuatan atau penggantian pemetaan. Orkestrasi tamu tidak lagi memerlukan pabrik kanvas khusus akun, sehingga status buka jarak jauh mencapai pemunculan komponen dan memindahkan rapat ke tampilan gambar-dalam-gambar mengambang. Pemasangan jendela komponen kini memakai percobaan ulang backoff eksponensial terbatas yang lebih panjang agar penyelenggara dapat pulih ketika peserta undangan membuka papan sebelum jendela penyedia penyelenggara siap. Mount tamu terbatas kini meneruskan token Share yang dirutekan ke resolusi identitas dan melewati permintaan profil akun serta pencarian peserta, sehingga respons 404 profil khusus akun tidak menghalangi proses bergabung ke rapat.

## Commit

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
- [88e72f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/88e72f2b8ceb38fd137d22d97ab2749bc4a1e2bb)
- [c0f05fb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c0f05fb22382b2f18b2ecbacee654a6007944b78)
- [3583bce](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3583bce288b495d3d44f1efe049063f267c82ad3)
- [18fb935](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18fb935e94e6819bc4884599f80f7a07a9d24fc7)
- [91c689d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/91c689df7e719ec03fc207c82d283510362d69c8)
- [54caf84](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/54caf840c8578bca200e7d9c897bc62413547cff)
- [2512c1f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2512c1fcb45ffe494b0c6945edea7031d303b5b8)
- [78f8ba7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/78f8ba77509b5f104ae076d7d98840865791a312)
- [53a9f98](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/53a9f9870c3a8a0ca546e8da6e33b9dc4f861db7)
