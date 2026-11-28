# 文書構成とホストの契約

**機能ブランチ:** feature-documentation-core-alignment

## 構造化した文書

Info、使用例、技術情報を、マニフェストで宣言する完全な多言語の文書一式にします。利用者向けの紹介、具体的な手順、現在の API と設定の契約を分けて説明します。構成、参照先、ファイル名の厳密な検証を独立したテストと CI で実行します。ソースファイルへのリンクは既定ブランチを参照し、変更履歴のコミットラベルは短い形式を使います。

## ゲートウェイの診断

実行時の診断はホストのログゲートウェイと出力方針に従います。コマンドの報告は端末出力を使い、モジュールの JavaScript では別名や動的な参照も含めてネイティブコンソールへのアクセスを検証します。プロバイダーの所有範囲、権限確認、ガイド完了の識別子を維持します。

## 画面幅に対応する会議領域

ステージとチャットの既定幅は2対1で、通常表示の最小の Composer 行に収まります。共通の中間表示により、スマートフォンとタブレットでは各領域を全幅で縦に並べ、チャットがない会議ではステージを全幅にします。既存の設定キーと保存済みの配置を保持します。

## 役割が分かるバインディング名

構文木による名前検証は、既存違反やファイル別の除外を設けず、JavaScript と TypeScript のソース、ツール、テスト、フィクスチャを走査します。実行時バインディング、シグネチャの引数名、非公開メンバー、所有する複合型名とメソッド名を検証します。`db`、`this.db`、`args`、LDAP の `dn` など、一般的な短縮形は独立した名前に使用できます。上流から引き継いだ名前も含め、複合名の測定単位以外の省略語は `DatabaseExecutor`、`KeyringDatabaseExecutor`、`createDatabaseExecutor`、`baseDistinguishedName`、`registerStaticDirectory` のように展開します。不明瞭な省略名、番号付きの仮名、無視するバインディングの値の使用は検証に失敗します。未使用かつ非公開の `_`、`id`、算術カウンター `i`・`j`・`k` は定義された役割を維持します。ジェネリック型パラメーター、依存ライブラリーやプラットフォームの正規名、公開ペイロードのキーは契約を維持します。所有する API の宣言、インポート、エクスポート、呼び出し元は同じ名前を使用し、型を含めて名前を変えるだけの別名は検証に失敗します。回帰フィクスチャで独立名と複合名の区別、およびプラットフォーム API の正規名を保護します。各言語の技術文書、貢献指針、モジュールのバージョン、ロックファイル、パッケージのハッシュを同期します。`ms`、`sec`、`px`、`rad`、`deg` などの測定単位は複合名でも短縮形を維持し、時間とピクセルの名前を `INVITE_EXPIRY_MS`、`timeoutMs`、`widthPx` などの形式に戻します。回帰フィクスチャで単位の例外を検証し、隣接する不明瞭な省略語は引き続き拒否します。

## コミット

- [891e30c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/891e30ccb141ddc0a9e9a9e05a3b5a5a76499de8)
- [5a5bbb1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5a5bbb1ec7c04c266698032145d8e6bdcca0f7bf)
- [2724795](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/27247957859220b243aa93c566031e5e266599c7)
- [8502687](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8502687768d18ffeb8e4b431e21de0fc47d802dc)
- [2c1c925](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2c1c9256df4a48b613e466d049e39e411e970940)
- [ca93a87](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ca93a87d1c4e5505d0a4a801005a6310af3379ce)
