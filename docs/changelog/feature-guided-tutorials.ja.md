# ガイド付きチュートリアル

**Feature Branch:** feature-guided-tutorials

## 技術仕様

会議への参加や作成を行わず、会議と参加予定者を紹介します。認証済みのオンラインセッションが必要です。

モジュールは ctx 経由で手順と翻訳済みテキストを登録します。ホストが一覧、説明、矢印、強調表示、キーとポインターの制御、アクセス確認付き SPA ナビゲーション、アクセシビリティを担当します。閉じる操作、手順外への移動、権限の喪失、モジュールの無効化でセッションを終了します。プロバイダーのマウント失敗時は登録を取り消します。

プロバイダーテストでは公開契約、4 言語の翻訳、利用条件、失敗時の後処理、未対応ホストバージョンの拒否を確認します。

## ページ連動の初回ガイド

ホストは説明、矢印、強調表示、アクセシビリティ、共通のフローティング操作メニューを担当します。初回は常に「次へ」を表示し、中止とスキップは表示しません。再生時の中止には `btn-cancel` を使います。完了はブラウザー内でアカウント別に保存します。移動、アクセス喪失、プロバイダー解除でセッションを終了し、マウント失敗では登録を取り消します。

## ページのガイド

会議の準備、通話中の操作・チャット・共有と、管理者専用の会議確認・終了・削除の確認を案内します。

## 内容を表すチュートリアルのキー

チュートリアルの手順に使う翻訳キーと対象の識別子は、ガイド内の順番ではなく内容を表します。同じキーを対応する四つの言語すべてで提供します。

## 操作に役立つ説明

各ステップではページの操作項目と作業を説明し、権限やガイドが実行しない操作についての不要な説明を省きます。

## ステップごとに次へ進む強調を指定

各ステップで `highlightNext` を明示します。「次へ」や「完了」が必要な説明では有効にし、操作や待機条件で進む練習では無効にします。動きを減らす設定では静的な枠を表示します。

すべての UI コンポーネントにチュートリアルを用意します。開発ガイドラインでは、利用者の目的に沿う操作説明と、機能や UI 動作の変更に伴う既存チュートリアルの見直しを求めます。

## 具体的な対象と分岐の再開始

会議の管理操作の説明では、表示中の終了または削除ボタンを強調します。チュートリアルのセクション内で利用可能な最初の対象を選び、対象がない場合はステップを飛ばします。

## 表示されるチュートリアル対象

強調する領域と「次へ」の強調を明示します。

## 共通のフローティングメニュー待ち行列

メニューはホスト共通の待ち行列とコンポーネントの寿命に従います。

## 復旧操作の説明

対象がない画面では「次へ」と最初からやり直す操作を提供し、再実行では中止も選べます。

## ブラウザーデモを削除

独立したチュートリアル用ブラウザーデモを削除し、プロバイダーとモジュールの自動テストは維持します。

## 目的の明確なガイド

表示順に沿って異なる可視操作を説明します。共通指針は画面状態の検出、安定した例、空の状態、条件付き分岐、ライフサイクルの後処理を扱います。再実行操作と動きを減らす設定の文書をホストと一致させます。

## 操作に沿ったガイド

会議ガイドは最初に参加者パネル全体を強調し、参加者を選ぶ段階では参加可能なユーザーの欄を示します。

## 任意の会議チャット

会議チャットが利用できない場合、そのステップは手順と総数から除外します。

## 翻訳カタログの統一

モジュールのメタデータとチュートリアルの翻訳キーは、小文字の単語をピリオドで区切ります。カタログの翻訳内容は維持し、周囲の XML と字下げを揃えます。厳格な名前空間検証により、翻訳キーのハイフンとアンダースコアを拒否します。モジュール ID、UUID、ケイパビリティ、チュートリアル完了の識別子は変更しません。

## ロビーと通話中の利用条件

準備ガイドはロビーが表示され、会議の埋め込みが有効でない場合にのみ利用できます。会議への直接リンクではロビー専用の対象を案内しません。通話を退出するとロビーのガイドが再び利用可能になります。通話ガイドはモジュールのルート領域を共通の境界とし、会議の表示条件を別に確認するため、会議枠、共有操作、任意のチャットを対象にできます。無効または非表示のチャットは経路とステップ数から除外します。

## コミット

- [2ca1e32](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2ca1e3292d5c02ae229f8a5652b40929b0272219)
- [d051ae2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d051ae21ab8a123834e74ef86d24e14809d77e4b)
- [15730bd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/15730bdfee1eb85b53cc208310add93bf7a14704)
- [f9a767f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f9a767f19179e0e1b5bfbf981bd634d2e2d684f9)
- [6678445](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/66784457b47bd835d947f862890365272f5d6e16)
- [2fada40](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2fada407ffe66e9590f037ce6f500e5a5e2cd158)
- [1235d37](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1235d37629580ae9bdde13c07520a783a1c81949)
- [dcf444a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dcf444aafe4e88fc1d5b21064c6356013c8e3900)
- [e422908](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e4229088d211facd06d3464ee1e578f4eda7a8b7)
- [986caf0e7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/986caf0e74d203cb5b86092892fbdb75871853bd)
- [b7c4f6886](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b7c4f68864ea21dee0150186c1509e428df28a7b)
- [2e99cf649](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2e99cf649345992d41f19a9179c83153b6dfabd6)
- [d6f10af07](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f10af071009f75e9f52526a01d59cb6987714c)
- [8fb4477](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8fb44771d4d49011b5bb8640b655ddbe8f8af659)
