# Lokalisasi UI Ketat

**Cabang Fitur:** `feature-enforce-localized-ui-strings`

## Wajibkan kunci bahasa tanpa teks pengganti literal

Instruksi AI melarang teks bahasa Inggris yang ditanam langsung untuk pengguna dalam setiap alur. Nilai yang tidak tersedia dalam bahasa pilihan dapat menggunakan kunci yang sama dari sumber daya XML bahasa Inggris. Nilai pengganti bahasa Inggris yang hilang atau kosong harus menimbulkan kegagalan eksplisit, bukan menampilkan teks Inggris literal, kunci mentah, atau teks kosong. Kesalahan terjemahan yang hilang tidak boleh disembunyikan.

## Komit
