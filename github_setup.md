## GitHubリポジトリ設定手順

### 1. GitHubでリポジトリを作成

1. [GitHub](https://github.com/)にアクセスし、ログインする
2. 右上の「+」アイコン→「New repository」をクリック
3. 以下の情報を入力:
   - リポジトリ名: `neon-breaker`
   - 説明: `ネオン風デザインのブロック崩しゲーム`
   - 公開設定: `Public`
   - READMEファイル: チェックを外す（既に作成済み）
4. 「Create repository」をクリック

### 2. ローカルリポジトリをGitHubにプッシュ

作成したGitHubリポジトリのURLをコピーし、以下のコマンドをターミナルで実行:

```powershell
# リモートリポジトリを追加
git remote add origin https://github.com/あなたのユーザー名/neon-breaker.git

# mainブランチをプッシュ
git push -u origin master
```

### 3. GitHub Pagesの設定 (オプション)

1. GitHubのリポジトリページで「Settings」タブをクリック
2. 左側のメニューから「Pages」をクリック
3. 「Source」セクションで「Deploy from a branch」を選択
4. 「Branch」ドロップダウンから「master」を選択し、「/(root)」フォルダを指定
5. 「Save」をクリック

デプロイ完了後、以下のURLでゲームがプレイ可能になります:
```
https://あなたのユーザー名.github.io/neon-breaker/
```

### 4. 今後の更新方法

ファイルを変更した後は、以下のコマンドでGitHubに反映:

```powershell
git add .
git commit -m "更新内容の説明"
git push origin master
```
