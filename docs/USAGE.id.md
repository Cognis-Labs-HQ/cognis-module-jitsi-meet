# Penggunaan

Ikuti atau selenggarakan rapat video dari Cognis.

## Prasyarat

Administrator harus mengonfigurasi server Jitsi yang dapat dijangkau dan mengaktifkan Meetings. Izinkan kamera serta mikrofon bila diperlukan. Tautan berbagi mengikuti aturan akses dan kata sandinya.

## Contoh

Buka Meetings, pilih peserta bila diperlukan, lalu tunggu pemeriksaan koneksi. Pilih Start untuk masuk, kemudian gunakan kontrol berbagi untuk mengundang orang lain.

- Di Administrasi → Modul, konfigurasikan URL instans Jitsi HTTP(S), jalankan uji aktivasi dan aktifkan Jitsi Meet. Administrasi → Meetings menampilkan rapat aktif dan mendatang.
- Buka Meetings, pilih peserta dan mulai atau gabung ke ruang. Operasi yang bergantung profil memerlukan nama profil yang terlihat. Keanggotaan aktif yang ada tetap dapat ditemukan melalui identitas akun terautentikasi jika nama profil tidak tersedia.
- Tarik peserta yang tersedia ke rapat berjalan untuk meminta persetujuan Share. Penolakan mengembalikan peserta ke daftar tersedia dan menampilkan toast.
- Pilih Whiteboard untuk membuka kanvas rapat, atau Tutup Whiteboard untuk menutupnya. Berbagi layar menonaktifkan kontrol dengan tooltip penjelasan. Tamu tautan mengikuti keadaan penyelenggara tanpa kontrol terlihat.

Pemanggil browser memperoleh integrasi VoIP dari konteks yang telah diinisialisasi host:

```js
const startCall = uiCtx.capabilities.get("voip:startCall");
const action = await startCall({
    source: "messages",
    room: { id: roomId, kind: "group" },
    users: members,
    supportedActions: ["component"],
});
```

Tindakan yang dikembalikan menjelaskan komponen Meetings; pemanggil membukanya melalui kontrak halaman komponen host.

Alur memperkenalkan rapat dan peserta yang disiapkan tanpa bergabung atau membuat rapat. Sesi online terautentikasi diperlukan.

## Hasil yang Diharapkan

Persiapan yang berhasil membuka rapat. Direktori peserta kosong tetap memungkinkan rapat mandiri jika pemeriksaan koneksi berhasil.

## Pemecahan Masalah

Jika persiapan gagal, periksa alamat Jitsi, jaringan, dan izin peramban. Tanyakan tautan yang ditolak kepada pemilik rapat; memilih peserta tidak memperbaiki pemeriksaan server yang gagal.
