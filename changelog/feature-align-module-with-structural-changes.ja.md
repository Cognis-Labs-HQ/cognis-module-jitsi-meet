# Jitsi Meet をスコープ付きモジュールランタイムに整合

**機能ブランチ:** feature-align-module-with-structural-changes

## ライフサイクルにスコープされたコンテキストを使用

Jitsi Meet は、スコープ付きモジュールコンテキストから直接 Capability を取得し、ホスト Flow を実行または拡張するようになりました。共有管理、アカウントのクリーンアップ、Whiteboard 連携、設定の有効化チェック、プロバイダーフックは非公開のシステムコンテキストに依存しなくなり、無効化と再有効化のサイクルを Cognis が完全に追跡できます。

## 現行の連携契約を宣言

マニフェストはモジュールを非特権のままにし、ライフサイクル管理された Provider カタログからブラウザー Capability を公開して、Bootstrap を唯一のランタイム連携エントリポイントとして使用するようになりました。さらに、バージョン 1.5.221 と宣言済みの全ファイルダイジェストを同期しました。構造テストでも新しい境界を検証します。

## 非アクティブなオーバーレイ操作を非表示に維持

ミーティングロビーは、モジュール画面内で HTML の非表示状態を確実に適用するようになりました。これにより、ホストのボタン表示規則が、対応するミーティング状態になる前に認証、セッション再取得、退出、残留の操作を表示することはありません。リリースバージョンと整合性ダイジェストを 1.5.221 に同期しました。

## Nextcloud Whiteboard の検出を復元

Jitsi は、現行の Nextcloud Whiteboard モジュールが公開するサーバー Capability を解決するようになりました。可用性エンドポイントが有効なプロバイダーを再び認識し、ミーティングの Whiteboard ボタン、ボード検証、メンバー更新、クリーンアップを復元します。

## 専用 UI プロバイダーを読み込む

Jitsi は `whiteboard:uiGateway` をオプションのブラウザー Capability 要件として宣言するようになりました。これにより Cognis は、Whiteboard ナビゲーションバーによるキャンバスファクトリーの初期化に依存せず、最新の Nextcloud Whiteboard 変更で導入された専用プロバイダーを Meetings のマウント前に読み込めます。

## ブラウザープロバイダー検出で表示を決定

Cognis PR #222 により外部 Capability プロバイダー登録がライフサイクル対応になったため、Meetings コントロールは読み込み済みの `whiteboard:uiGateway` を直接使用します。別のバックエンド可用性リクエストに基づいて自身を削除することはなく、バックエンドエンドポイントは診断用として残ります。

## Provider が宣言する Whiteboard 契約を使用

Jitsi は、現在の Nextcloud Whiteboard Manifest が宣言する `whiteboard:fetchBoardData`、`whiteboard:membership`、`whiteboard:deleteCanvas` Capability を解決します。宣言されていない実装ファサード `whiteboard:api` には依存せず、サーバー検証と同期されたミーティング Whiteboard を復元します。

## 公開されたブラウザーランタイムを初期化

Cognis PR #224 に従い、Meetings のブラウザーエントリは Deployment が公開するランタイムリソース `/static/reuse/ui-ctx.js` をインポートし、直接読み込みや更新でも SPA ナビゲーションと同じコンテキストを初期化します。その他のブラウザーユーティリティは引き続き `ui:reuse` で解決します。Jitsi は `voip:startCall` に `ctx.registerCapabilityProvider` を使用し、冗長な `meetings:isProviderAvailable` Capability を削除して、特権アクセスを要求しません。

## Whiteboard 連携をオプションとして維持

Jitsi は、オプションの Provider が有効な場合にのみ Whiteboard の検証、メンバーシップ、削除 Capability を解決します。これらのサーバー Capability は Jitsi の有効化を妨げず、`whiteboard:uiGateway` は引き続きブラウザー Provider 検出契約として使用されます。

## データベースランタイム依存関係を宣言

Jitsi は、無効時の設定ルート、有効化テスト、有効時のミーティングストアで必要な `db:executor` を宣言するようになりました。Cognis は `/config` の登録前にデータベース Provider を初期化できるため、設定が HTTP 503 にフォールバックせず、保存済み Jitsi URL に対して有効化検証を実行できます。

## サーバー Capability をモジュール所有の名前空間に維持

認証済みミーティングチャット Resolver を `jitsi-meet:getMeetingChat` として公開するようにしました。これにより、Jitsi が提供するすべての Capability はモジュール所有の名前空間に留まり、特権アクセスなしで Cognis の境界検証を通過します。

## アカウント削除後に保存済みミーティングを更新

Cognis がアカウントを削除すると、Jitsi は現在および元の参加者レコードからそのアカウントを削除します。再利用可能なミーティングは残りの保存済み参加者構成に合わせてキーを更新し、保存済み参加者が2人未満になったミーティングは削除します。

## オプションの Whiteboard Provider 読み込みを遅延

Meetings は、オプションのブラウザー Whiteboard Gateway をルートレベルの要件として宣言しなくなりました。直接読み込みや更新では、Jitsi が Whiteboard Provider を検出して読み込む前に Cognis が UI コンテキストを初期化でき、SPA ナビゲーションと Whiteboard コントロールは引き続き同じ Gateway 契約を使用します。

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

- [a94d066](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a94d06602a508b05c7d5ce5a389212aa7a2a3ac8)

- [18feef0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18feef04c15884d664bfc838e565fd4de5505129)

- [34a9e73](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34a9e730d6389aa4ba0fd49e4594f3219c47c7dd)

- [444c415](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/444c415532dc20a285123231368cf2c30e376f1a)

- [d8c7696](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d8c769663b694a244b402304b37047c5e3bea699)

- [33a2ecd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33a2ecdb02e84101247c48c7247b527a4863077f)

- [09c93f4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/09c93f4d5bb52cff518455cda7494ca302cb3b7f)

- [bce5f43](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/bce5f43fef2cc079f596771553e947adc2a77e28)
