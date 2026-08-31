# Sinkronisasi status rapat yang aman

**Cabang Fitur:** work

## Batasi pembaruan status rapat yang berwenang

Kini hanya penyelenggara rapat yang dapat melaporkan status berbagi layar Jitsi, dan endpoint independen tersebut tidak lagi berada di bawah Whiteboard. Status berbagi layar diatur ulang setiap kali instans rapat dimulai atau berakhir agar instans berikutnya tidak mewarisi penguncian yang sudah kedaluwarsa.

## Lindungi pemfilteran kehadiran peserta

Pencarian peserta kini memverifikasi akses sebelum mengecualikan rapat yang diminta dari pemfilteran kehadiran aktif, sehingga pengenal rapat tanpa izin tidak dapat mengungkap perbedaan kehadiran.

## Commit

- [f6d7cdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f6d7cdb9645e336a672b7749a7aab616b74b32d9)
