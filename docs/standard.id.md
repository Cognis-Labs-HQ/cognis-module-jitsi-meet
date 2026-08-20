# Modul Jitsi Meet

## Ringkasan

Modul Jitsi Meet menyediakan orkestrasi rapat native Cognis dengan pemilihan peserta, penggunaan ulang URL rapat, pengambilalihan sesi, dan penggunaan ulang ruang chat dari adapter Messages.

## Fitur

- URL instans Jitsi dan prefix URI opsional; manifest menjelaskan kolom yang ditampilkan Cognis, sedangkan endpoint konfigurasi milik modul memvalidasi dan menyimpan pengaturan yang dipolling
- Kapabilitas pencatatan, toast, dan popup kesalahan waktu proses yang disediakan host untuk kegagalan operasional dan umpan balik pengguna
- Rute aplikasi `/meetings` dan `/meeting` dengan:
    - area rapat/overlay
    - pemilihan peserta dan drag-and-drop
    - handoff URL chat ke adapter Messages
- Persistensi rapat pada tabel milik modul
- Akses API dibatasi peserta berdasarkan username
- Otorisasi peserta fallback classroom saat `classroom_id` diisi
- Pemantauan rapat aktif di Administrasi → Meetings
- Dependensi berbasis UUID pada gateway Social, adapter Profile, gateway Share, dan adapter Messages, serta persyaratan runtime berbasis kapabilitas `auth:requireAuth` dan `ui:profileAvatarRenderer`

## Catatan Keamanan

- Panggilan API memerlukan access token Cognis yang valid.
- Detail rapat hanya diberikan ke peserta yang diizinkan.
- Password rapat dibuat untuk setiap catatan rapat.
- Reclaim sesi memungkinkan pengguna memutus sesi aktif sebelumnya.

## Kontrak Standar Emas

- `bootstrap.js` adalah satu-satunya entrypoint modul yang dipakai platform.
- ctx bootstrap adalah satu-satunya bus integrasi modul ini (rute API, registrasi UI, kapabilitas, serta wiring CLI/DB di masa depan).
- Impor langsung dari modul lain atau internal core dilarang; integrasi wajib lewat permukaan yang diberikan ctx.
