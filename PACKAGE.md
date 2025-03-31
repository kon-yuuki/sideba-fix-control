# SidebarFixControl

スクロール時のサイドバー固定動作を処理するシンプル化したJavaScriptクラスです。ユーザーがページをスクロールする際に、サイドバーの位置を適切に調整し、快適なUXを提供します。

## 特徴

- 長いサイドバーの滑らかなスクロール制御
- ウィンドウサイズ変更に対応
- 高さ変化の監視オプション
- 詳細なデバッグモード
- 軽量で依存関係なし

## インストール

```bash
npm install sidebar-fix-control
```

## 基本的な使い方

```javascript
import SidebarFixControl from 'sidebar-fix-control';

// デフォルト設定で初期化
const sidebarFixer = new SidebarFixControl();

// または、カスタム設定で初期化
const customSidebarFixer = new SidebarFixControl({
  sidebarSelector: '#custom-sidebar',
  contentSelector: '#main-content',
  floatingBoxSelector: '#floating-content',
  marginTop: 50,
  marginBottom: 20,
  debug: true
});
```

## HTML構造

```html
<div class="section__body">
  <div class="section__body--inner">
    <!-- メインコンテンツエリア -->
    <main class="c-main" id="content">
      <!-- コンテンツ -->
    </main>
    
    <!-- サイドバーエリア -->
    <aside class="c-aside" id="sidebar">
      <div class="c-aside-inner" id="floatingBox">
        <!-- サイドバーの内容 -->
      </div>
    </aside>
  </div>
</div>
```

## オプション設定

| オプション | 型 | デフォルト値 | 説明 |
|------------|------|--------------|------|
| sidebarSelector | string | '#sidebar' | サイドバー要素のCSSセレクタ |
| contentSelector | string | '#content' | メインコンテンツ要素のCSSセレクタ |
| floatingBoxSelector | string | '#floatingBox' | サイドバー内で実際に固定する要素のCSSセレクタ |
| fixedClass | string | 'fixed' | 固定時に追加するクラス名 |
| floatClass | string | 'float' | フロート状態時に追加するクラス名 |
| marginTop | number | 30 | 画面上部からの余白(px) |
| marginBottom | number | 30 | 画面下部からの余白(px) |
| detectionThreshold | number | 20 | 固定判定の閾値(px) |
| monitorHeightChanges | boolean | false | 高さ変化の監視を有効化するかどうか |
| detectionInterval | number | 100 | 高さ変化の検出間隔(ms) |
| debug | boolean | false | デバッグモードのフラグ |

## メソッド

### updateHeights()

コンテンツやサイドバーの高さを手動で更新し、位置を再計算します。モニタリングがOFFの場合に便利です。

```javascript
// 高さの変更後に手動で更新
sidebarFixer.updateHeights();
```

### destroy()

サイドバー固定機能を破棄し、イベントリスナーをクリーンアップします。

```javascript
// コンポーネントのアンマウント時などに呼び出す
sidebarFixer.destroy();
```

## 使用例

### アコーディオンメニューの開閉後に高さを更新

```javascript
document.querySelectorAll('.accordion-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    // アコーディオンの開閉処理
    toggle.nextElementSibling.classList.toggle('open');
    
    // コンテンツの高さが変わったので更新
    sidebarFixer.updateHeights();
  });
});
```

### タブ切り替え時に高さを更新

```javascript
document.querySelectorAll('.tab-button').forEach(tab => {
  tab.addEventListener('click', () => {
    // タブ関連の処理
    document.querySelector('.tab.active').classList.remove('active');
    document.getElementById(tab.dataset.target).classList.add('active');
    
    // コンテンツの高さが変わったので更新
    sidebarFixer.updateHeights();
  });
});
```

### Ajaxコンテンツ読み込み後の更新

```javascript
fetch('/api/content')
  .then(response => response.json())
  .then(data => {
    // コンテンツを更新
    document.querySelector('#dynamic-content').innerHTML = data.html;
    
    // 高さを更新
    sidebarFixer.updateHeights();
  });
```

## ライセンス

MIT