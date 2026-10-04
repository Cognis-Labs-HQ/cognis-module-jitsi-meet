# ミーティング一覧、Whiteboard 連携、アカウントクリーンアップを安定化

**機能ブランチ:** work

## ミーティング一覧の初期描画を完了

アクティブおよび保存済みミーティングの空の成功応答でも読み込み表示を置き換えるようになり、ミーティングがないアカウントには正しい空の状態が直ちに表示されます。

## オプションの Whiteboard 可用性を尊重

ブラウザーの Whiteboard キャンバスファクトリーが利用できない場合、ミーティングツールバーのコントロールを表示しません。サーバー側の検証は最新の Nextcloud Whiteboard モジュールが公開する安定した `whiteboard:` Capability を引き続き使用し、利用できない Provider が状態同期まで進むことを防ぎます。

## ミーティング削除前にリソースをクリーンアップ

アカウントのプロビジョニング解除では、使用不能なミーティングをストレージから削除する前に、関連付けられた Whiteboard、Messages チャットルーム、ミーティング共有を削除するようになりました。構造化された失敗ログと所有者承認済みの Capability 呼び出しを使用します。

## ライフサイクルスコープの連携を文書化

対応するすべての文書で、Whiteboard Capability の解決はライフサイクルにスコープされたモジュールコンテキストのみを介すると説明するようになりました。

## キャンバス準備前に Whiteboard を有効化

Whiteboard コントロールは、ブラウザーとコンポーネントウィンドウの Provider が準備でき次第操作可能になります。キャンバス作成は有効化後にのみ開始され、未関連付けのキャンバスは再試行や再マウント時に再利用されるため、状態同期に失敗しても重複は作成されません。

## コミット

- [9894d9e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
- [1d99048](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1d990487c733d1d4e9db03b9e2ec54d0f04632d1)
