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

ミーティング PiP の基本最小サイズを従来より 25% 大きい 400 × 225 ピクセルにしました。進行中の参加者が3人目になると両方の寸法を一度だけ 25% 増やし、Cognis のフローティングウィンドウ更新機能で上限付き最小サイズを直ちに適用します。

## Whiteboard 拡張契約を検証

Meetings は Nextcloud Whiteboard PR 24 が提供する `whiteboard:uiGateway.expandCanvasAccess` の正確な契約を検証するようになりました。更新を同期済みとして記録する前に、成功応答は要求したキャンバスを識別し、要求した全参加者を拡張後のアクセス一覧として返す必要があります。

## 未認可の Whiteboard 拡張再試行を停止

所有者認可のキャンバス拡張 Capability はミーティング主催者だけが呼び出すようになりました。招待参加者は拡張要求を送信せず、所有者の失敗した要求は同じキャンバスと参加者集合について記録されるため、ポーリングや埋め込みライフサイクル更新で同じ禁止要求を繰り返し送信しません。

## PiP 内にオーバーレイを保ち、自動 Whiteboard を復旧

単独参加者への確認を含むミーティングオーバーレイは、Whiteboard PiP の有効中にフローティング Jitsi フレーム内へ移動し、閉じるとステージへ戻るようになりました。Whiteboard の自動オープンは、一時的な動的モジュール読み込み失敗で最初に停止せず、上限付きバックオフ全体を通じて再試行します。

## PiP の拡大を3人で上限設定

ミーティング PiP の最小サイズは、進行中の参加者が2人までは 400 × 225 ピクセル、3人以上は 500 × 282 ピクセルの2段階だけになりました。大規模なミーティングでも最小サイズが増え続けて画面を占有することはありません。

## Whiteboard コントローラーの解析を復旧

ミーティングフレームとオーバーレイの DOM 参照は、Whiteboard Capability ペイロードから再宣言せず Meetings サーフェス内のローカル参照として保持するようになりました。ブラウザがコントローラーを再び解析して読み込めるようになり、直接の JavaScript 構文回帰チェックでエントリポイントを保護します。

## 進行中ミーティングのドロップ先を PiP 内に保持

参加者のドラッグ開始時に、現在アクティブなミーティングウィンドウのオーバーレイ親要素を再確認するようになりました。Whiteboard PiP が開いている場合、緑色の参加者ドロップ先はフローティング Jitsi フレーム上に表示され、それ以外では通常のミーティングステージ上に残ります。

## Jitsi 画面共有を優先し Whiteboard 表示を統一

Jitsi のローカルおよびリモート画面共有参加者のリアルタイムイベントにより、同期 Whiteboard を全員に対して閉じ、共有終了まで再オープンを無効にして、通常領域を会議へ戻すようになりました。バックエンド Capability チェックを共通の Whiteboard 表示判断とし、ブラウザプロバイダー初期化中は全アカウントが同じ無効コントロールを表示し、プロバイダーが利用不可なら非表示にします。

## Whiteboard 自動失敗ループを停止し診断情報を表示

アカウントの自動オープンは、ユーザー操作なしでブラウザに制限されるキーリング解除を試みず、すでに解除済みになるまで待つようになりました。操作が必要な場合は Whiteboard の選択を求める警告を1回表示し、自動マウント失敗を同じボードで再試行しません。実際の失敗ではトーストに失敗段階を表示し、構造化 ID、エラーメッセージ、完全な Error オブジェクトをホストログとブラウザコンソールの両方へ書き込みます。

## コミット

- [736ed26](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/736ed2651843b76e095f075a58b0ee7823128942)

- [b95fb10](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b95fb1027087f679a699ea807295f7b1286bb8b0)

- [0523439](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/05234396cd0e1bfc99075aecd9575291df1fab54)

- [ff60844](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ff6084469d7c8c18c631d6c59bac0b65fdf04b44)

- [0afee2e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0afee2e9720010b6a2b5c8de256310dd77efd947)

- [3aa0da6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3aa0da6b54b2bf66dd36e760630cf7c50d7a55b3)

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
