# Jitsi Meet を強化されたモジュールライフサイクルに適合

**機能ブランチ:** feature-fix-module-lifecycle-alignment

## 安全なモジュール有効化を復元

Jitsi Meet は Cognis 内部モジュールをインポートせず、明示的に公開されたグローバル Capability バスからホストのブラウザーコンテキストを取得するようになりました。これにより、強化された外部モジュール境界検証を通過できます。

## 有効化前の設定に対応

無効化時専用の制限付き API エントリーポイントは、有効化前に明示的に許可された設定エンドポイントだけを登録します。管理者は機能ルート、UI コントリビューション、フロー、Capability を有効化せずに Jitsi を設定できます。

## 設定登録を一貫して共用

有効時と無効時の API エントリーポイントは同じ設定登録層を使用し、Nextcloud Whiteboard のライフサイクルパターンと統一しました。設定の検証、認証、疎通確認、CSP オリジン登録、有効化テスト、依存関係が利用できない場合の応答は、どちらの状態でも一貫します。

## モジュール間 API アーティファクトを拒否

スタンドアロンのソース検査は、`jitsi-meet` 以外の API 名前空間を参照する配布 JavaScript を拒否するようになりました。これにより、Analytics の境界テスト用アーティファクトなどの紛れ込んだファイルが Jitsi リリースへ入り、有効化を妨げることを防ぎます。

## コミット

- [3335e1f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3335e1fe833be67ee047c2e307ef0a5780e973c6)

- [2e52a5a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2e52a5ac0a26a29a582542ac97a11f7f3139dc29)

- [ffe2d69](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ffe2d69c4cf489d3ff7c74b908113d816407084d)

- [b4de176](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b4de176d18b64ace9d0111a2de3d5fdb15b80896)
