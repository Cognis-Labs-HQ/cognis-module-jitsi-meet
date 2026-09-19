# Jitsi Meet をスコープ付きモジュールランタイムに整合

**機能ブランチ:** feature-align-module-with-structural-changes

## ライフサイクルにスコープされたコンテキストを使用

Jitsi Meet は、スコープ付きモジュールコンテキストから直接 Capability を取得し、ホスト Flow を実行または拡張するようになりました。共有管理、アカウントのクリーンアップ、Whiteboard 連携、設定の有効化チェック、プロバイダーフックは非公開のシステムコンテキストに依存しなくなり、無効化と再有効化のサイクルを Cognis が完全に追跡できます。

## 現行の連携契約を宣言

マニフェストは、ホスト所有のミーティング Capability と Flow に必要な信頼済み特権連携を明示し、Bootstrap を唯一のランタイム連携エントリポイントとして使用するようになりました。さらに、バージョン 1.5.209 と宣言済みの全ファイルダイジェストを同期しました。構造テストでも新しい境界を検証します。

## 非アクティブなオーバーレイ操作を非表示に維持

ミーティングロビーは、モジュール画面内で HTML の非表示状態を確実に適用するようになりました。これにより、ホストのボタン表示規則が、対応するミーティング状態になる前に認証、セッション再取得、退出、残留の操作を表示することはありません。リリースバージョンと整合性ダイジェストを 1.5.209 に同期しました。

## Nextcloud Whiteboard の検出を復元

Jitsi は、現行の Nextcloud Whiteboard モジュールが公開する名前空間付きサーバー Capability を解決するようになりました。可用性エンドポイントが有効なプロバイダーを再び認識し、ミーティングの Whiteboard ボタン、ボード検証、メンバー更新、クリーンアップを復元します。

## プロバイダーの有効化を待機

Meetings クライアントは、バックエンドの Whiteboard 可用性判定を上限付き指数バックオフで再試行するようになりました。ページのマウント中に Capability 登録を完了するプロバイダーでも Whiteboard コントロールを追加でき、その領域が空のまま残りません。

## 専用 UI プロバイダーを読み込む

Jitsi は `whiteboard:uiGateway` をオプションのブラウザー Capability 要件として宣言するようになりました。これにより Cognis は、Whiteboard ナビゲーションバーによるキャンバスファクトリーの初期化に依存せず、最新の Nextcloud Whiteboard 変更で導入された専用プロバイダーを Meetings のマウント前に読み込めます。

## コミット

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
