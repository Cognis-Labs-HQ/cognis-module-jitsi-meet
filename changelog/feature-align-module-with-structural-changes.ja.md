# Jitsi Meet を Cognis の契約に整合

**機能ブランチ:** feature-align-module-with-structural-changes

## スコープ付き ctx と実行されるアクション Flow を使用

Bootstrap はライフサイクルに限定された ctx だけから外部サービスを取得し、モジュール所有のルート、Provider、Capability、フックを登録します。有効なモジュールの保存操作は、`initialize-store` と `execute-action` ステージを持つ `jitsi-meet:*` Flow を実行し、内部操作は既存のトランザクションを保持します。ルートの操作より先に認可を行い、不完全な Runner は処理を黙って省略せず失敗します。Cognis は無効なモジュールの Flow を登録しないため、無効時の設定は制限されたライフサイクルエントリポイントを使います。

## ミーティングと会話の識別を安定化

永続ミーティングは、メンバー変更や再起動を経ても、正規化された元の参加者集合、ルームの識別情報、パスワードを保持します。保存済みミーティングは Messages ルームを共有できます。使い捨て通話の独立した予約により、過去のチャット参照に一意性を要求せず競合する通話を防ぎます。予約とミーティング変更はトランザクション内で行います。Heartbeat が途絶えるとプレゼンスが期限切れになり、終了したミーティングは残留プレゼンスを無視します。

## 任意の Whiteboard Provider を尊重

ブラウザーの任意のキャンバスファクトリーはホスト初期化後に検出し、サーバーは Provider が宣言する Whiteboard Capability を動的に解決します。キャンバス作成前に有効化操作が可用性を確認します。ゲストは既存の関連付けに従い、キャンバスを作成しません。同時の準備は保留中のファクトリー呼び出しを共有し、再試行は未確認の結果を再利用します。Provider の交換でキャッシュを分離し、キャンセルされたウィンドウ再試行は次の生成前に停止します。メンバーシップと関連付けの検証には正規のアカウント識別情報を使います。

## クリーンアップを再利用して古い UI 処理を破棄

アカウント削除は保存済み参加者リストを更新するか、外部リソースを処理してから利用不能なミーティングを削除します。最後の退出とアカウントのクリーンアップは、所有者認可による共通のリソース削除を使います。ミーティング行の削除では、共通カタログによって通話予約も処理します。共通のキャンセル可能な待機は、完了時にも中止時にもリスナーを解除します。ポーリングは結果の適用前にマウントの寿命、要求順序、ミーティングの識別を確認し、終了やセッション引き継ぎの応答にも適用します。

## ホストの表示と会議セッションを保持

Meetings はホストの Page Composer、Router、プロフィールプレビュー、コントロール、オーバーレイ、フローティングウィンドウを使います。非表示規則は Jitsi 所有のコントロールと表示領域だけを対象とします。空の応答も初期ロード状態を完了します。Whiteboard のマウントは Keyring 認可と同期された画面共有ロックを維持します。Jitsi 認証セッションのクリーンアップは他のブラウザー設定を保持し、ストレージへのアクセスが拒否されても参加を続行できます。

## 同期した単一のリリース契約を公開

モジュール 1.5.242 はパッケージバージョンと SHA-256 インベントリを同期します。標準ドキュメントは、現在の対応動作をドイツ語、英語、インドネシア語、日本語で説明します。この PR は実装リンクを統合した単一の変更履歴セットを使用します。動作テストは、アクション Flow の実行、権限拒否、再試行中止、同時のキャンバス準備、古い応答を検証し、構造的な分離テストを補います。

## 自動で開く前に Whiteboard アクセスを復元

開催中のミーティングへの参加は、チャットの選択に関係なく、参加応答を返す前に認可済みアカウントの開いた永続 Whiteboard へのメンバーシップを復元します。アカウントによる自動表示は `jitsi-meet:follow-whiteboard` を実行し、正確な開いた関連付けを検証し、所有者認可によるメンバーシップを付与して、マウント前に関連付けを再確認します。追従は新たな承認投票を開始せず、開いた状態を変更しません。閉じた Board や置き換えられた Board はエラー表示なしで中止します。リンクゲストは委任されたアクセスを維持し、閉じた関連付けが任意 Provider を参加の必須条件にすることはありません。

## 公開表示契約

Jitsi は公開 Gateway メソッド `requestCanvasPage({signal})` と `openCanvas({whiteboardId, elementId, signal})` を使用します。Whiteboard Provider がルート ID、キャンバス配置、通信とセッションの意味を所有します。Jitsi は正確な Board ID と自身のマウント先だけを指定し、終了時にウィンドウを解放します。表示には Whiteboard 2.3.147 以降が必要です。メンバー変更はサーバーが所有する公開メンバーシップ契約を使用します。

## 利用できない Whiteboard ボタンの理由を説明

有効な Whiteboard Provider の公開 UI 契約が不完全な場合、説明のツールチップ付きの無効なボタンを表示し、不足する Capability メソッドを記録します。Provider の読み込み失敗も説明します。任意 Provider が存在しない場合はボタンを表示しません。Avatar の在席情報は Whiteboard の準備状態とは独立しており、プロフィール在席情報の 404 はボタンを無効化しません。

## ミーティング遷移を保護し永続キャンバスを復元

読み込み、Keyring の解決、認証やセッション引き継ぎの待機、および埋め込み会議中はミーティング選択をロックします。参加要求は保留中の処理を共有し、中止や古い応答は現在の対象を置き換えません。認証待機中も、現在の出席情報を持つ認可済み招待ミーティングをアクティブ一覧に含めます。永続ミーティングを再開すると、所有者が認可する公開メンバーシップ契約で保存済みキャンバスを復元します。任意のキャンバスが利用できないか削除されている場合は記録し、ミーティング参加を妨げません。

## 会議のコンポーネント領域を制限する

Jitsi は埋め込みコンポーネントのコンテナーを会議の表示領域に制限し、マウントしたルートを明確な大きさのグリッド行に伸ばします。サイズを封じ込めたプロバイダーの表示を維持し、固有サイズが会議ウィンドウを拡大しないようにします。Chromium 回帰テストは実際の会議マークアップを標準モードで使い、表示とサイズ変更を確認します。Whiteboard の内部描画には依存しません。

## 会議のオーバーレイを PiP に保持する

状態更新はアクティブなウィンドウからオーバーレイを取得し、ポータルに移したものをメインページへ戻しません。ボタン・メッセージ・事前確認の表示をその中で更新・再接続し、コンポーザーの更新時もフローティングフレームを有効な会議として扱います。PiP のフレームにモジュールのスタイルスコープを保持し、絶対配置したオーバーレイで覆います。PiP を閉じると元のスコープと配置を復元します。動作テストでページルート外の状態更新を、Chromium でオーバーレイの境界を確認します。

## コミット

- [7c8e3142](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [60428332](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)
- [1e557a1a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)
- [e869c668](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)
- [2432bb48](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)
- [6af5e9d4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6af5e9d449b87a30616d01a4aa3cbd06754c3d16)
- [3e99028a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3e99028a46b22727d6a74c79be66307e2cdf689f)
- [a94d0660](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a94d06602a508b05c7d5ce5a389212aa7a2a3ac8)
- [18feef04](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18feef04c15884d664bfc838e565fd4de5505129)
- [34a9e730](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34a9e730d6389aa4ba0fd49e4594f3219c47c7dd)
- [444c4155](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/444c415532dc20a285123231368cf2c30e376f1a)
- [d8c76966](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d8c769663b694a244b402304b37047c5e3bea699)
- [33a2ecdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33a2ecdb02e84101247c48c7247b527a4863077f)
- [09c93f4d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/09c93f4d5bb52cff518455cda7494ca302cb3b7f)
- [bce5f43f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/bce5f43fef2cc079f596771553e947adc2a77e28)
- [d0ed7631](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d0ed763193e09ee5807ff0ffa89718f45b65ffbb)
- [b864da0c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b864da0c1388c35000b8f21117ab7b52340f13a8)
- [c69fa5fc](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c69fa5fc53db518779c9ac7905cc2919d4911aae)
- [8e79fd7d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8e79fd7d77cc8857bb1482f245ea9aa56a7afeb7)
- [de197326](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/de19732675ee9d054088787f8710adfc96c809ce)
- [82899c91](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/82899c9148162acd33805632d5ce0d749e40ba6c)
- [9894d9ee](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
- [1d990487](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1d990487c733d1d4e9db03b9e2ec54d0f04632d1)
- [561ab35f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/561ab35f41d807651f2ec5c28b5ab43eda928305)
- [30603f26](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/30603f2679ed778ee2a3467de9d18b4932445836)
- [736abfbf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/736abfbf2a8579b7c6961755ad26cb6446a54cac)
- [04158e4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
- [e8042612](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e8042612c8e55a549db7aa32cbc8ab9e0d1cdd04)
- [6bd01f73](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6bd01f73b330f9d69169a81693325f3c89d445da)
- [b26fc491](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b26fc4912e6d48c8b31c18b474af3b2fd625b642)
- [65f51269](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/65f5126935c0e9f0ed63e89def8110589b88edde)
- [b1311b8d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1311b8d637806ae49c5b96067c4627cd6f182e5)
- [8d709449](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8d70944999fb802c5b776d1760d370d45696c427)

- [1e6f727](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e6f7271ff3b1fece3c748f71b10d502c7351aa8)
