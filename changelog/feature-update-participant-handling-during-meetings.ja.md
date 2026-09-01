# 進行中のミーティングに参加者を招待

**機能ブランチ:** feature-update-participant-handling-during-meetings

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

## アクティブなミーティングのオーバーレイをライブウィンドウに維持

既存のミーティングへ参加した後、参加者の再描画によってロビーまたはプリフライトオーバーレイが復帰しないようにしました。オーバーレイ配置はローカルの解放コールバックだけに依存せず、ミーティングフレームの実際のフローティング親要素を検出します。参加者のドラッグも移動済みオーバーレイを直接使用するため、緑色のドロップゾーンが Whiteboard の PiP に追従します。

## PiP の参加者ドロップゾーンを正しく関連付けて解除

参加者ターゲットは Cognis の実際の `floating-window` クラスを検出し、各遷移の前に現在のオーバーレイと Jitsi フレームをライブ DOM から解決するため、Whiteboard ステージではなく PiP 要素へ関連付けられます。ドキュメント全体のドラッグ終了とドロップのクリーンアップに加え、Escape とウィンドウのフォーカス喪失の処理によって、ドラッグを中止した際にターゲットが消去されます。

## ミーティングターゲットを再利用し、Core の読み込みと Whiteboard のアクティベーションを明確化

アクティブなミーティングへの参加者ドラッグでは、追加の破線ポップアップを使わず、既存のミーティングオーバーレイと緑色のターゲットデザインを再利用します。ミーティング開始時は「ミーティングを開始」のクリックから Jitsi への参加試行が完了するまで、Cognis core の共有ページ読み込みホイールを維持します。報告された Whiteboard エラーは Cognis のコンポーネントページ生成認可が原因でした。現在のブラウザアクティベーションがないアカウントの自動マウントは、認可されない生成を `whiteboard_component_window_unavailable` になるまで再試行せず、一度だけ操作を促して延期します。

## 画面共有ロックを説明し、Whiteboard を再開してアクティブ招待を承認

画面共有がミーティング領域を使用している間、無効な Whiteboard 操作にローカライズ済みのホバー説明を表示します。Cognis のユーザーアクティベーション要件に達した同期済みアカウントボードは、中止に安全な入力リスナーを設定し、Whiteboard 固有のクリックを求めず次のアクティベーションで自動再開します。アクティブな参加者招待は変更前に Share の任意承認 Capability で合意を求め、明示的な拒否を適用し、承認基盤が利用できない場合は構造化ログを残してフェイルオープンします。

## ドロップ時に合意を開始し、拒否を戻してミーティング切り替えをロック

アクティブな参加者のドロップでは参加者プールを一時的に更新し、承認付き API 要求を直ちに送信します。投票で拒否された場合、提案した参加者を利用可能一覧へ戻し、招待者に専用のローカライズ済み拒否トーストを表示します。ローカルユーザーがミーティングへ参加中は、アクティブなミーティングのグリッドと操作を常に無効にします。

## 実際の Share 承認フローを使用し、重複する PiP ハンドルを削除

直接の Share 承認 Capability がない場合、アクティブな参加者追加は既存の Share トークン生成承認ステージを実行して結果を待ち、一時トークンを直ちに失効させます。これにより現在の環境でも合意を省略しません。Whiteboard の PiP は Cognis のフローティングウィンドウツールバーに加えてミーティングステージヘッダーを移動コントローラーとして関連付けません。

## アクティブなミーティングへの招待に Share の最終承認を必須化

アクティブなミーティングへの参加者追加は、宣言済みの `share:requestApproval` Capability を直接必須とします。明示的な最終承認だけが参加者を受け入れ、拒否、保留、または不正な判断では参加者を利用可能リストへ戻します。実行時エラーは引き続きログを残してフェイルオープンとし、作成後に取り消す旧互換経路は使用しません。

## ミーティング破棄を復元し、不要な Whiteboard アクセス拡張を防止

カンファレンスの退出または終了時に 1 回だけ即座に破棄処理を行い、ミーティングオーバーレイを復元して参加者選択を消去し、アクティブなミーティングと利用可能な参加者の更新完了を待ちます。Whiteboard アクセス同期は初期メンバー構成を承認済みとして扱い、参加者が変わった場合だけ拡張プロバイダーを呼ぶため、ポーリング中の所有者専用要求の繰り返しを防ぎます。

## 終了オーバーレイが次のクリックに反応しないようにする

ミーティング終了処理では、Whiteboard コントロールを同期する前にアクティブなミーティングをクリアするようになりました。これにより、遅延中の Whiteboard 自動オープン処理が終了中に再登録され、次のクリックで「ミーティング終了」または「ミーティング退出」オーバーレイを非表示にすることがなくなります。

## クリーンアップ後にミーティングステージ全体を復元

オーバーレイ復元処理は、コンポーネントのクリーンアップによって切り離されたミーティングフレームラッパー全体を保持して復元するようになりました。参加者一覧とアクティブミーティング一覧の再描画後も、ステージとともに「ミーティング終了」または「ミーティング退出」の表示が戻ります。

## 進行中のミーティングリソースを同期

永続 Whiteboard は初回同期時に全参加者のアクセスを確認するようになり、ミーティング開始後に招待された参加者も既存のキャンバスを開けます。Messages の更新では、ユーザーの追加や削除に応じてメンバーを変更しながら既存のミーティングチャットルームを維持し、ミニチャットを同じルームから再描画します。テストでは、生成されたミーティング名と URL がメンバー変更後も保存済みの非破棄ミーティングエンティティに保持されることも保証します。

## PiP 上の参加者ドロップ先を復元

進行中参加者のドロップ先は、フローティング Jitsi フレーム内へ移動すると、通常のステージグリッド配置から絶対配置のインセットへ切り替わります。利用可能な参加者をドラッグすると、招待先が再び PiP ミーティングウィンドウ全体を覆います。

## チャット再利用時の参加者追加エラーを防止

参加者追加 API は、完全一致メンバーの解決処理に既存ルームの返却を求めて新規作成された別ルームを拒否するのではなく、保存済みの Messages ミーティングルームを直接再利用します。ブラウザーはホストの Messages クライアントを通じてメンバーを更新し、既存のミニチャットを再描画します。チャットメンバーを変更できない場合は、構造化された診断情報とローカライズ済みエラーを報告します。

## ミーティング識別情報、チャット、Whiteboard メンバーを整合

ミーティングモジュールは、対応する参加者変更を保存する前に、目的が明確なサーバー側 Messages のメンバー追加または削除操作を呼び出します。保存済みチャットルーム ID は変更されず、クライアントはそのルームだけを再描画し、Whiteboard のアクセス拡張にも同じ保存済み参加者構成を渡します。スキーマ初期化による保存済みミーティング名、スラッグ、URL の再生成を廃止し、Jitsi、Messages、Whiteboard リソース間の識別情報のずれを解消しました。

## 目的を限定した Messages メンバー操作を使用

ミーティング参加者の変更では、保存済みミーティングルームに対して単純な `social:messages:addRoomMember` または `social:messages:removeRoomMember` capability を呼び出します。ルーム作成は独立した一度限りの操作のまま、ミーティングがルーム関連付けを所有し、集約同期 capability は不要です。

## 正規の Messages メンバーシップ capability を使用

進行中のミーティングへの招待と参加者の削除で、正規の実行者アカウント ID とユーザーアカウント ID を指定する統一された `social:messages:membership` capability を使用し、現在の Cognis Messages 統合契約に準拠しました。

## 再参加時にチャットアクセスを復元

認証済みユーザーがミーティングへ参加するたびに、チャットを読み込む前に冪等な Messages メンバーシップ操作を再適用します。以前ミーティングチャットを退出またはアーカイブした参加者も、ミーティングへ再参加するとチャットを再び表示できます。

## 正規の Whiteboard メンバーシップ操作を使用

進行中の参加者を追加または削除するときは、ミーティング参加者一覧を保存する前に、正規の主催者および参加者アカウント ID を指定して `whiteboard:membership` で永続キャンバスを更新します。従来のブラウザー側の一括アクセス拡張は使用しません。

## 参加者が 1 人の場合は招待を自動承認

実際に参加中のユーザーが 1 人以下の場合、退出済みユーザーの合意を待たずに新しい参加者の追加を直ちに承認します。複数の参加者が実際に参加中のミーティングでは、引き続き Share の承認結果を使用します。

## 通知からの参加と進行中ミーティングのロックを安定化

通知から受け取って処理したミーティングパラメーターを参加前に URL から削除し、通知経由を含めてミーティングを選択した時点で進行中ミーティング欄をロックします。ミーティング終了通知には操作 URL もメール内のミーティングリンクも含めません。

## ハンドル正規化を Profile identity に委譲

サーバー側のハンドル正規化はすべて公開 capability `social:profile:identity` を使用します。ミーティングストア、アクセス確認、参加者検索、Share オーケストレーション、Whiteboard ルート、ライフサイクル処理では、モジュール独自の正規化規則を保持または import しません。

## ディレクトリ由来の参加者照合を維持

ディレクトリ由来の参加者識別子を比較するときも正規の Profile identity 正規化を適用し、モジュール独自の正規化を再導入せずに、プロフィールハンドル変更後のミーティングアクセスを維持します。

## プロファイル競合なしで進行中ミーティングをポーリング

認証済みアカウントから使用可能なプロファイルハンドルをまだ解決できない場合、進行中ミーティングの受動的な検索は成功した空の一覧を返すようになりました。解決エラーは構造化されたコンテキストとともに記録し、プロファイル依存のミーティング操作では引き続きプロファイルを必須とすることで、定期更新による 409 競合の繰り返しを防ぎます。

## 参加者の進行中ミーティングを確実に検出

現在のプロファイル解決でハンドルを取得できない場合も、進行中ミーティングの検索は認証済みアカウント ID で認可を続行するようになりました。これにより、以前のプロファイルハンドルが保存されているミーティングを含め、保存済み参加者にそのアカウントが属するすべての Cognis 進行中ミーティングが表示され続けます。

## 進行中ミーティングの検索へ Profile ID を正しく渡す

進行中ミーティングの検索では、正規ハンドル解決へ `social:profile:identity` Capability を明示的に渡すようになりました。これにより、`admin`、`firehawk`、`test` などの通常アカウントを、正規化エラーを繰り返さず再び解決できます。

## 実際の Whiteboard 所有者で招待を完了

合意成立後の参加者招待では、関連付けられた永続キャンバスの実際の所有者を読み取り、その所有者の正規アカウント ID を解決して `whiteboard:membership` に使用するようになりました。別の承認済み参加者が開いたキャンバスも更新でき、503 応答で招待が中断されません。

## 退出後のチャットポーリングを停止

ローカルユーザーがキックされた場合、またはミーティングが別の理由で破棄される場合、Meetings は最初にチャットのポーリングタイマーを停止し、現在および最後に使用したルーム ID とキャッシュ済みルームキーを消去するようになりました。その後の再描画で退出済みミーティングルームが再び有効になったり、認可されていないメッセージ要求が送信されたりすることはありません。

## 永続ミーティング ID を再利用

ミーティング作成時に、保存済み参加者行から正規化済みの全参加者セットも解決するようになりました。これにより、永続ミーティングはサーバー再起動後や進行中のメンバー変更後も、同じ ID、名前、URL、Messages ルームで再利用されます。参加者のいないミーティングは再利用せず毎回新しい ID を受け取り、その新規レコードへチャットを関連付けます。終了時は引き続き、ミーティングレコードを削除する前にチャットを完全に削除します。

## 参加者検索と初期ミーティングオーバーレイを修正

「参加者を検索」では Cognis core が対応する `user` 結果フィルターを渡し、ユーザー結果だけを表示するようになりました。ドラッグ中でないフォーカス変更ではミーティングオーバーレイを変更しません。進行中ミーティングは参加者ペインから初期オーバーレイの「ミーティングを開始」ボタン直上にある調和したカードへ移動し、ミーティングを選択または参加すると非表示になります。進行中ミーティングで追加した参加者は永続参加者レコードに引き続き保持され、再利用するミーティング ID を決定します。

## 参加者ワークスペースに永続ミーティングを表示

参加者ワークスペースの左側約30%を、縦スクロール可能な既知ユーザー選択に使用し、右側約70%を、現在のアカウントが参加する永続ミーティングの横スクロールギャラリーに使用するようになりました。各ショートカードは安定したミーティング名を上部中央に置き、標準プロファイルアバターを最大10人まで軽く重なるように配置します。Cognis が進行中と判断したミーティングではアプリグリーンの光が縁を周回し、参加者のいない破棄可能ミーティングはギャラリーから除外します。

## 以前のミーティングを再利用または退出

参加者ペインでは、コンパクトなカードを「以前のミーティング」と表示します。カードをクリックするとメンバーをステージへ復元して「ミーティングを開始」までスクロールします。3秒間長押しするとハイライトが緑から赤へ変わり、退出の確認を表示します。最後のメンバーが退出すると、保存済みミーティング、Messages チャット、関連付けられた Whiteboard を削除します。残り1人のミーティングも、そのメンバーがクリーンアップを完了できるよう一覧に残ります。

## 以前のミーティングカードのフィードバックを改善

「以前のミーティング」カードはアバターを実際のコンテンツ高で折り返して横方向ギャラリーの上端に揃え、不要な縦方向オーバーフローを解消しました。進行中のミーティングは、境界だけを移動するマスク済みのアプリグリーン区間で示します。削除の長押しでは一定の不透明度を保った滑らかな緑から赤へのグラデーションを直ちに開始します。ポップアップの「削除」はキャンセル表示、「キャンセル」は中立表示となり、削除成功は情報トーストで通知します。

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
- [6a1e873](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6a1e873ff9454735dcbbcc0ed3290d7a446ac8b6)
- [cef74a0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cef74a09b02dfc3f50523dcadaf497488f9822ef)
- [812a79e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/812a79eb9960118a6addc5d17147e565db413639)
- [402045d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/402045d752ae3dcfd03497565a0c6bf70328ab66)
- [3b50f6d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3b50f6d1707d136ad222a615771e7a43d0289481)
- [cc022ac](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cc022ace92fafd44941961ea8282b3f051c94f5e)
- [e65d307](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e65d3078012ebca12c5a0c5cda15235a8c216c96)
- [2a9cc59](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2a9cc59e8ad051da54ca7919de34fde15256fde9)
- [2d72282](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d722820c4bd77d0c7ef6dd8991ec63c8ed11b52)
- [f6d7cdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f6d7cdb9645e336a672b7749a7aab616b74b32d9)
- [b064315](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b0643159333c67f4117d5afc6fdbdcad9ba1b1ec)
- [c373996](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c37399694fa2c71da5ddda3f26133eebf5e985f2)
- [b8d6adb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b8d6adbd9c3aec0cf7e34e60233f804445f0baa5)
- [3c87494](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3c87494d228a96afa177602e3a3c7ae8e40d5c01)
- [8019153](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8019153c46dd027cc05b849a272327e3114a1c63)
- [d105cf3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d105cf394e47fefc26c894d8ba0278e97b7f09b2)
- [0e5340a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0e5340abd33d63446a5d6bf557748040c1e49fc7)
- [8c26ddf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8c26ddf4ca40c8964c36e15ad43ef055a31c627b)
- [d18e4d2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d18e4d21b84c5f88898873bd83d74f3a74840e10)
- [6eb02e6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6eb02e68d05d3bb907945a891232023f45908e89)
- [8454f05](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8454f05f4aab00b90e83f46c039a1a31a0b2ff72)
- [a243551](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a24355173a41a0c442dc624f54b7e22fd88b1313)
- [4514fab](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4514fab46af476bda59562f58440bb0f19003ccf)
- [b778ee7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b778ee7b3dd80dd15582ac7e982a1b435869236a)
- [3b6bda6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3b6bda658696fdf143e042b6b14d8ff96d36b0dd)
- [e0e916f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e0e916f59892bc0c812451a359ca2b36e6864cff)
- [93727a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/93727a180bc1bdede576460b6d3bdf54dcae3604)
- [f7d14b3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f7d14b3ccaef984bf26b51d4e82a96fe80d3077b)
- [d6f689a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f689a8d46f17897c4d1abf65f93673e99b4b30)

- [8665186](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86651863fcf6af7736904af8c01f7cc89d5a45de)

- [59c24f4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/59c24f423c6f965dc02c97444c955c334cf4c7c5)
- [5675466](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/56754666a4937045764a6ab61dff35010e5c64f1)
- [3d93676](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3d93676af78496cbcd33ad943e7a62ca11553745)
- [a3e1cf2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a3e1cf2ccc718579c47d66551fe480a1727981b2)
- [483e085](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/483e0858f5afc6861ee502a816a770fa7f393290)
- [6c42f79](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6c42f79e0872703d785ac3b8e1143cd0fd68d077)
- [05be888](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/05be8883b9154da291ebf195c09d5048067ac026)
- [5288d1d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5288d1d9cb3343ca92529ef66f35e55d6fb77c22)
- [d6fa13f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6fa13fe33cc5e764127f0d83721ac0a549568cb)
- [ab6210b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ab6210b46afc7d0abb5c7063419744075e21c460)
- [e555c2b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e555c2bc1f4c262bde5c29e988cd0aea91937ffa)
- [03f9098](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/03f909850369d744334ef22885a246acc75709a5)
- [d41ae6e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d41ae6e3d090201a450f9622efc615adb5c0d56f)
- [c2f39a9](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c2f39a9b76a7ae0075d6523f5e6b5cc65cdbd516)
- [ff2e3ec](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ff2e3ec1b8e3b2fc51e6574b4145319986f30a07)
- [d4978cd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d4978cd490af8a9f8de9aae965f0d5ffdb1f4c53)
