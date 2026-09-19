# Jitsi Meet をスコープ付きモジュールランタイムに整合

**機能ブランチ:** feature-align-module-with-structural-changes

## ライフサイクルにスコープされたコンテキストを使用

Jitsi Meet は、スコープ付きモジュールコンテキストから直接 Capability を取得し、ホスト Flow を実行または拡張するようになりました。共有管理、アカウントのクリーンアップ、Whiteboard 連携、設定の有効化チェック、プロバイダーフックは非公開のシステムコンテキストに依存しなくなり、無効化と再有効化のサイクルを Cognis が完全に追跡できます。

## 現行の連携契約を宣言

マニフェストは、ホスト所有のミーティング Capability と Flow に必要な信頼済み特権連携を明示し、Bootstrap を唯一のランタイム連携エントリポイントとして使用するようになりました。さらに、バージョン 1.5.216 と宣言済みの全ファイルダイジェストを同期しました。構造テストでも新しい境界を検証します。

## 非アクティブなオーバーレイ操作を非表示に維持

ミーティングロビーは、モジュール画面内で HTML の非表示状態を確実に適用するようになりました。これにより、ホストのボタン表示規則が、対応するミーティング状態になる前に認証、セッション再取得、退出、残留の操作を表示することはありません。リリースバージョンと整合性ダイジェストを 1.5.216 に同期しました。

## Nextcloud Whiteboard の検出を復元

Jitsi は、現行の Nextcloud Whiteboard モジュールが公開するサーバー Capability を解決するようになりました。可用性エンドポイントが有効なプロバイダーを再び認識し、ミーティングの Whiteboard ボタン、ボード検証、メンバー更新、クリーンアップを復元します。

## 専用 UI プロバイダーを読み込む

Jitsi は `whiteboard:uiGateway` をオプションのブラウザー Capability 要件として宣言するようになりました。これにより Cognis は、Whiteboard ナビゲーションバーによるキャンバスファクトリーの初期化に依存せず、最新の Nextcloud Whiteboard 変更で導入された専用プロバイダーを Meetings のマウント前に読み込めます。

## ブラウザープロバイダー検出で表示を決定

Cognis PR #222 により外部 Capability プロバイダー登録がライフサイクル対応になったため、Meetings コントロールは読み込み済みの `whiteboard:uiGateway` を直接使用します。別のバックエンド可用性リクエストに基づいて自身を削除することはなく、バックエンドエンドポイントは診断用として残ります。

## 統一された Whiteboard Provider ファサードを使用

Jitsi は現在の Nextcloud Whiteboard モジュールが提供する公開 `whiteboard:api` ファサードを解決し、そのボード取得、メンバーシップ、削除メソッドを使用します。サーバー検証、委任アクセス、参加者同期、クリーンアップでは、個別 Capability の登録を前提とせず、直接 Whiteboard と同じ Provider オブジェクトを使用します。

## 直接読み込み時にホスト UI コンテキストを初期化

`/meetings` の直接読み込みとブラウザー更新では、`ui:reuse` やオプションの Capability Provider にアクセスする前に Cognis の公開 UI コンテキスト Bootstrap をインポートするようになりました。Dashboard Shell が UI コンテキストをすでに作成済みであることを前提にしません。

## Whiteboard 連携をオプションとして維持

Jitsi は、オプションの Provider が有効な場合にのみ Whiteboard の検証、メンバーシップ、削除 Capability を解決します。これらのサーバー Capability は Jitsi の有効化を妨げず、`whiteboard:uiGateway` は引き続きブラウザー Provider 検出契約として使用されます。

## コミット

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)

- [1e557a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)

- [e869c66](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)

- [2432bb4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)

- [6af5e9d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6af5e9d449b87a30616d01a4aa3cbd06754c3d16)

- [3e99028](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3e99028a46b22727d6a74c79be66307e2cdf689f)
