# Akses Papan Tulis untuk Tamu Berbagi

**Cabang Fitur:** work

## Otorisasi status tamu yang tercakup pada rapat

Pembaruan status Papan Tulis kini memvalidasi tamu tautan berbagi melalui gateway Share terhadap rapat yang diminta dan memakai identitas sintetis stabil yang sama dengan kehadiran rapat untuk suara konsensus.

## Gunakan kembali Papan Tulis buatan host

Tamu tautan berbagi kini memakai pemetaan Papan Tulis rapat yang sudah ada dan menunggu akun berwenang atau host membuatnya bila pemetaan belum tersedia.

## Sediakan asosiasi Papan Tulis terdelegasi

Jitsi Meet kini menerbitkan `meetings:resolveWhiteboardAssociation`. Kapabilitas ini hanya mengembalikan rapat aktif ketika papan yang diminta sama persis dengan status rapat otoritatif dan klaim tamu Share yang nyata diotorisasi untuk rapat tersebut; asosiasi yang hilang, tidak aktif, ditutup, ambigu, dan tidak cocok ditolak.

## Pisahkan modul yang terlalu besar

Pembuatan skema dan pengisian ulang kredensial dipindahkan ke modul skema-store yang terfokus, cakupan regresi UI dibagi menjadi dua berkas pengujian yang kohesif, dan spasi normal antara deklarasi serta metode dipulihkan.

## Commit

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
- [88e72f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/88e72f2b8ceb38fd137d22d97ab2749bc4a1e2bb)
- [c0f05fb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c0f05fb22382b2f18b2ecbacee654a6007944b78)
