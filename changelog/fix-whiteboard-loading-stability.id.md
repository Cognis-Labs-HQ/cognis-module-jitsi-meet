# Stabilkan Pemuatan Papan Tulis

Halaman komponen Papan Tulis kini diminta satu kali untuk setiap mount rapat, bukan diganti berulang kali saat jendela dibuka. Percobaan ulang jendela komponen tetap dibatasi, kanvas persisten hanya dibuka dari status eksplisit sesi saat ini, dan mengakhiri atau memulai ulang rapat akan menghapus status tersebut.
