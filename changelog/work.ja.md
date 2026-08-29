# 共有ゲストの Whiteboard アクセス

**機能ブランチ:** work

## ミーティングに限定されたゲスト状態を認可

Whiteboard 状態の更新では、共有リンクのゲストを要求対象のミーティングに対して Share ゲートウェイで検証し、合意投票にミーティング在席と同じ安定した合成 ID を使用するようになりました。

## ホストが作成した Whiteboard を再利用

共有リンクのゲストはミーティングの既存 Whiteboard 関連付けを使用し、関連付けがない場合は認可済みアカウントまたはホストによる作成を待つようになりました。

## 汎用 Share 委任を使用

Jitsi Meet は Whiteboard 固有の Capability を公開せず、`resolve-share-delegated-access` を拡張するようになりました。アクティブなミーティングとボードの完全一致する関係を証明し、`meeting:join` をソース権限として宣言します。ゲストトークンは Share が独立して検証します。

## 肥大化したモジュールを分割

スキーマ作成と認証情報のバックフィルを専用のストアスキーマモジュールへ移し、UI 回帰テストをまとまりのある2つのファイルへ分割し、宣言とメソッド間の通常の空白を復元しました。

## 安全なゲスト用 Whiteboard コントロール

共有ビューでも Whiteboard コントロールを組み込み、スコープ付きゲストトークンで状態リクエストを認証するようになりました。API はゲストに対し、ミーティングに完全一致して関連付けられたキャンバスの開閉だけを許可し、関連付けの作成や置換を拒否します。ゲストのオーケストレーションではアカウント専用のキャンバスファクトリが不要になり、リモートのオープン状態がコンポーネントの起動に到達して、ミーティングをフローティングのピクチャーインピクチャー表示へ移すことも検証します。コンポーネントウィンドウの起動には、より長い上限付き指数バックオフを使用し、招待参加者が主催者側のプロバイダーウィンドウの準備前にボードを開いた場合でも主催者が復旧できるようにしました。制限付きゲストマウントはルーティングされた Share トークンを ID 解決へ渡し、アカウントプロフィールと参加者検索のリクエストを省略するため、アカウント専用プロフィールの 404 応答がミーティング参加を妨げません。ゲストのキーリング解決は、ミーティングパスワード、チャット、Whiteboard で引き続き利用できます。実際のフリーズ原因は無制限のマイクロタスクループでした。関連付けのないゲストのキャンバス準備が即座に完了し、その完了処理が同じ準備を再帰的にスケジュールしていました。ゲストはキャンバス作成をスケジュールせず、同期されたミーティング状態から関連付け済みボードが届くのを待つようになりました。

## コミット

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
- [88e72f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/88e72f2b8ceb38fd137d22d97ab2749bc4a1e2bb)
- [c0f05fb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c0f05fb22382b2f18b2ecbacee654a6007944b78)
- [3583bce](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3583bce288b495d3d44f1efe049063f267c82ad3)
- [18fb935](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18fb935e94e6819bc4884599f80f7a07a9d24fc7)
- [91c689d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/91c689df7e719ec03fc207c82d283510362d69c8)
- [54caf84](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/54caf840c8578bca200e7d9c897bc62413547cff)
- [2512c1f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2512c1fcb45ffe494b0c6945edea7031d303b5b8)
- [78f8ba7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/78f8ba77509b5f104ae076d7d98840865791a312)
- [53a9f98](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/53a9f9870c3a8a0ca546e8da6e33b9dc4f861db7)
- [ce6c974](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ce6c9744f96ea5613e11efbcd12fe771ca49afd3)
- [39a4794](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/39a4794771a7c673ee9c92fba37e9fdf9ba9a449)
