# 進行中のミーティングに参加者を招待

**機能ブランチ:** work

## 破棄されない進行中のミーティングを拡張

招待者がいる状態で開始した進行中のミーティングへ、参加者をドラッグして追加できるようになりました。ミーティングの参加者情報と暗号化された Messages チャットが更新され、新しい参加者に招待が送られ、参加時にミーティングパスワードを取得できます。ステージに移動した参加者は、ミーティング開始後に利用可能なユーザー一覧へ戻りません。

## 進行中のミーティング画面を利用可能な状態に維持

参加者情報の更新時に、参加済みのミーティング上でロビーオーバーレイが再表示されなくなり、通知や進行中リストから参加した場合も操作を続けられます。利用可能な参加者の列が空の場合は「利用可能な参加者はいません。」と表示されます。

## 進行中の参加者ドロップ先を表示

利用可能な参加者をドラッグすると、対象となる進行中のミーティングウィンドウ上にローカライズされたドロップ先が一時的に表示されます。ドロップすると参加者が招待され、ドラッグを終了すると中断のないミーティング表示に戻ります。

## ドロップ先を Jitsi 埋め込みの前面に配置

有効な参加者のドラッグ時に、アバターのドラッグイベントからドロップ先が直接有効になります。ドロップ先は埋め込み Jitsi ウィンドウと完全に一致し、ドラッグ中は iframe の前面へ移動し、参加者のドロップまたはドラッグ終了後は背面へ戻ります。

## 緑色のドラッグガイドを常に表示

進行中の参加者ドロップ先では、ドラッグ中を通して同じ緑色のアウトラインを維持し、緑色の内側エッジと破線のドロップ先を表示します。ガイドはドラッグ終了時または参加者のドロップ時にのみ解除されます。

## 削除された参加者のアクセスを失効

ミーティングクライアントが、ローカルの Jitsi キックイベントとエラーを認識するようになりました。削除されたアカウントユーザーは保存済みメンバーから外れ、再度招待可能なユーザーとして表示されます。削除されたゲストについては、そのセッションで使用した Share リンクだけが失効し、在席状態も無効になります。

## アンマウント時に永続ルートを解放

ルーティング、共有、埋め込みの Meetings マウントは、すでに中止されたルートを取得せず、ライフサイクルシグナルの中止時に `.jitsi-route-root` を削除するようになりました。非同期初期化は後続の表示処理を作成する前に停止し、既存のクリーンアップは Observer、ハンドラー、タイマー、チャット処理、Whiteboard、Jitsi 埋め込みを引き続き破棄します。

## 参加者キーの衝突を防ぎ、割り当て済みユーザーを非表示

進行中のメンバー変更ではミーティング固有の参加者キーを使用するようになり、変更後の参加者一覧が別のミーティングと一致しても PostgreSQL の一意性エラーが発生しません。参加者検索では別のミーティングに実際に参加中のユーザーを表示せず、進行中の招待 API でも同じ利用可能性ルールを適用しますが、予定済みの招待だけでは非表示にしません。

## ライブ参加者連携を更新

利用可能な参加者と進行中のミーティングを5秒ごとに更新し、SPA ナビゲーション後にアバターの在席プロバイダーを初期化し、拡張された参加者と新着メッセージをミーティングチャットへ再読み込みし、進行中の招待成功をトーストで通知します。既存の永続 Whiteboard は任意のプロバイダー capability を通じて参加者アクセスを拡張します。参加者なしの文言を進行中ミーティングなしの表示に合わせ、退出時の文言を短縮し、ピクチャーインピクチャーの通知最小サイズを 320 × 180 ピクセルにしました。

## Whiteboard 操作を区別

Whiteboard ボタンはボードを開くときに確認スタイルを使用し、「Whiteboard を閉じる」の表示中はキャンセルスタイルへ切り替わります。

## ミーティング PiP の最小サイズを拡大

ミーティング PiP の基本最小サイズを従来より 25% 大きい 400 × 225 ピクセルにしました。進行中の参加者が3人目以降になると、参加者ごとに両方の寸法をさらに 25% 増やし、Cognis のフローティングウィンドウ最小サイズ更新機能で直ちに適用します。

## Whiteboard 拡張契約を検証

Meetings は Nextcloud Whiteboard PR 24 が提供する `whiteboard:uiGateway.expandCanvasAccess` の正確な契約を検証するようになりました。更新を同期済みとして記録する前に、成功応答は要求したキャンバスを識別し、要求した全参加者を拡張後のアクセス一覧として返す必要があります。

## 未認可の Whiteboard 拡張再試行を停止

所有者認可のキャンバス拡張 Capability はミーティング主催者だけが呼び出すようになりました。招待参加者は拡張要求を送信せず、所有者の失敗した要求は同じキャンバスと参加者集合について記録されるため、ポーリングや埋め込みライフサイクル更新で同じ禁止要求を繰り返し送信しません。

## コミット

- [a854724](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a8547244e698f6e3ef1c4b93d31531891a8edae2)

- [12de19a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12de19a4fcf312a67e238efd23c0beb0ffe03d2e)

- [a47b5b4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a47b5b48340e023192dc88a1cbbc6f2c4ecb4587)

- [790401f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/790401f6d0c6714179d977e0d9384c59bc91f30c)

- [28774f3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/28774f3df4a49adabc7e5470442e4cc087555e87)

- [4c26402](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4c26402d1005c86a6f28eecc78883e447bb97c11)
- [206b29f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/206b29f70af70eab3d63d8dae871f182dc97f40a)
- [5f7683b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5f7683b1c03719763333174cd6802bf4d33d37e9)
- [33eddd2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33eddd2c63b80998f6d8e9ee44b6152c0080628f)
- [1386015](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1386015409eeb5bd252208dcdff27b809e4db00e)
- [eb8aef2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/eb8aef223aa633bcd302ee27dd934a63e92bcf78)
- [2d07b3b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d07b3b6d0bd57563c83706f37c5dffcbf01f59f)
- [b88f6db](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b88f6db738e3bfad4ea1fd84ffecd2afe8bcb91f)
