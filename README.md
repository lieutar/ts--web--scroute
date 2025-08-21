# scroute

Script Chain Router for web apps.

  -  現状は  [bun](https://bun.sh)  を前提として開発中
  
  -  たとえば、`/path/to/the/resource` へのリクエストに対して
     
     1.  `<document root>/path/to/the/resource\<suffix>` がデフォルトリクエストハンドラとして選択される
     
     2.  デフォルトリクエストハンドラの実行までに
         
         -  `<document root>/.action.ts`
         
         -  `<document root>/path/.action.ts`
         
         -  `<document root>/path/to/.action.ts`
         
         -  `<document root>/path/to/the/.action.ts`
         
         -  `<document root>/path/to/the/resource.action.ts`
         
         が存在すれば、それらが順番に実行される。これらスクリプトは最終的なリクエストハンドラが用いる環境を設定したり、
         認証などを元に別のリクエストハンドラを選択したりすることができる。
  
  -  組込みのリクエストハンドラとしてはデフォルトで `*.builder.ts` に紐づけられたハンドラで、
     これは TypeScript モジュールに直接レスポンスの構築方法が記述されたもの。
     
     もうひとつの組込みハンドラは空文字列のサフィクスに紐づけられたハンドラであり、
     これは静的ファイル配信に用いることができる。
  
## Installation

Now time, this project is supported for development on my  [workspace](https://github.com/lieutar/looper-ts) , and
this don't provide regular way to install.

