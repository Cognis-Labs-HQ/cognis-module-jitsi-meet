# Pulihkan Keandalan Bergabung ke Rapat Jitsi

**Cabang Fitur:** feature-investigate-jitsi-meet-impact-on-cognis

## Buang sesi autentikasi Jitsi yang kedaluwarsa

Meetings kini menghapus pengenal sesi autentikasi Jitsi yang tersimpan sebelum membuat konferensi tersemat sambil mempertahankan semua preferensi Jitsi lainnya. Hal ini mencegah mulai ulang Jicofo atau sesi kedaluwarsa menyebabkan permintaan konferensi `session-invalid` berulang dan kanal bridge tertutup.

## Pertahankan akses bergabung tanpa penyimpanan

Kebijakan browser dan origin buram dapat menolak akses ke `localStorage`. Meetings kini menangkap kegagalan akses properti maupun operasi penyimpanan, mencatat fallback melalui log terstruktur, dan tetap membuat iframe Jitsi tanpa pembersihan sesi.

## Commit

- [04158e4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
- [e804261](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e8042612c8e55a549db7aa32cbc8ab9e0d1cdd04)
