const emptyGuidance = [
    /^Available actions are shown on /m,
    /^Open \[the feature\]/m,
    /^The example uses the documented interface of /m,
    /^This component does not declare a standalone command-line entry point\./m,
    /^This topic is reference material and does not expose an independent endpoint\./m,
    /^This documentation topic has no runtime configuration of its own\./m,
    /^Reading documentation does not grant permission to execute its examples\./m,
    /^Das Beispiel verwendet die dokumentierte Schnittstelle von /m,
    /^Diese Komponente deklariert keinen eigenständigen Befehlszeileneinstieg\./m,
    /^Dieses Thema ist eine Referenz und stellt keinen eigenen Endpunkt bereit\./m,
    /^Dieses Dokumentationsthema hat keine eigene Laufzeitkonfiguration\./m,
    /^Contoh ini memakai antarmuka .+ yang didokumentasikan\./m,
    /^Komponen ini tidak menyatakan titik masuk baris perintah mandiri\./m,
    /^Topik ini merupakan referensi dan tidak menyediakan titik akhir mandiri\./m,
    /^Topik dokumentasi ini tidak memiliki konfigurasi waktu jalan sendiri\./m,
    /^この例は .+ の公開されたインターフェースを使います。/m,
    /^このコンポーネントには独立したコマンドラインのエントリーは宣言されていません。/m,
    /^このトピックは参考情報であり、独立したエンドポイントを提供しません。/m,
    /^このドキュメント自体には実行時の設定はありません。/m,
    /^Der Zugriff auf .+ unterliegt dem Aufrufer und dem zuständigen Funktionsdienst\./m,
    /^Akses .+ diatur oleh pemanggil dan gerbang pemilik\./m,
    /^.+ へのアクセスは呼び出し元と担当のゲートウェイが管理します。/m,
];

export function contentIssues(prose) {
    const issues = emptyGuidance.some((pattern) => pattern.test(prose))
        ? ["Replace generic guidance with component-specific documentation"]
        : [];
    if (
        /\b(?:now (?:use|uses|means|record|accept|supports?|traverse|issues?|carry|validates?|register|return|reveals?|evaluates?|show|scroll|applies|rejects?|share|produce|separates?|expose|retain|provide|render|stops?|occupy|shares|begin|keep|opens?|commits?|enforce|fills?)|no longer|older .+ still work|previous(?:ly)? (?:used|returned|supported))\b/i.test(
            prose,
        )
    ) {
        issues.push(
            "Describe the current contract without release comparisons",
        );
    }
    if (
        /\b(?:retain|keep|preserve)s? (?:the )?same (?:topic )?(?:slugs|URLs|filenames)\b|\b(?:after|before) (?:this|the) (?:change|rename|refactor|fix)\b/i.test(
            prose,
        )
    ) {
        issues.push(
            "State the concrete document identity contract without rename history",
        );
    }
    if (
        /\b(?:jetzt|nun) (?:verwendet|nutzt|bedeutet|unterstützt|liefert|stellt|enthalten|gilt|wertet|zeigen|öffnet|prüft|übernimmt)\b|\b(?:kini|sekarang) (?:menggunakan|memakai|mendukung|memiliki)\b|ようになりました|変更前と同じ/i.test(
            prose,
        )
    ) {
        issues.push("Keep localized references free of release chronology");
    }
    return issues;
}
