# Umpan Balik Host

## Pencatatan dan umpan balik

Kegagalan browser kini menggunakan kapabilitas Cognis `ui:log`, pemberitahuan sementara menggunakan `ui:showToast`, dan kegagalan fatal saat memasang halaman membuka popup laporan kesalahan host melalui `ui:openErrorPopup`. Jalur fallback server kini menggunakan fungsi `ctx.log` yang dicakup untuk modul.
