# Pembuatan Rapat

**Cabang Fitur:** fix-meeting-creation-capability

## Pembuatan Rapat Milik Penyedia

Kapabilitas browser `meetings:createMeeting({ participants, scheduledAt, signal })` mengembalikan `{ meetingId, navigationUrl }`. Penyedianya memiliki permintaan HTTP serta tujuan navigasi dan menjalankan `jitsi-meet:creation:create` melalui kontrak host `ui:scopedActions`. Konsumen menemukan kapabilitas opsional ini alih-alih menyusun endpoint modul. Autentikasi dan validasi tetap berada pada batas API yang ada. Penyedia yang dibatalkan atau dihapus tidak dapat menjalankan aksi berikutnya.

## Komit
