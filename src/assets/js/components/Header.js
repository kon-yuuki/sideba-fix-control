import gsap from 'gsap';
import { isBackfaceFixed } from './backfaceFixed'; // isBackfaceFixed関数をインポート

class Header {
  constructor() {
    if (innerWidth > 1023) {
      this.header = document.querySelector('.l-header')
      this.headerHeight = this.header.offsetHeight
      this.nav = document.querySelector('.l-header__nav')
      this.megaMenu()
      this.fixControl()
    }
  }
  megaMenu() {
    // ドロップダウンを持つ要素を全て取得
    const dropdownElements = this.nav.querySelectorAll('.has-megamenu');
    
    // 各要素に対してイベントリスナーを設定
    dropdownElements.forEach((li, index) => {
      // ドロップダウンメニュー本体を取得
      const dropdown = li.querySelector('.l-header__megamenu');
      // ドロップダウンの最初のリンクを取得 (主要なナビゲーションリンク)
      const mainLink = li.querySelector('a');
      
      // ARIA属性を設定
      if (dropdown && mainLink) {
        // ユニークなIDを生成
        const dropdownId = `dropdown-menu-${index}`;
        dropdown.id = dropdownId;
        
        // メインリンクにARIA属性を設定
        mainLink.setAttribute('aria-haspopup', 'true');
        mainLink.setAttribute('aria-expanded', 'false');
        mainLink.setAttribute('aria-controls', dropdownId);
        
        // ドロップダウンメニューにロール設定
        dropdown.setAttribute('role', 'menu');
        
        // ドロップダウン内のリンクにロール設定
        const dropdownLinks = dropdown.querySelectorAll('a');
        dropdownLinks.forEach(link => {
          link.setAttribute('role', 'menuitem');
        });
      }
      
      // マウスが入った時のイベントハンドラー
      li.addEventListener('mouseenter', () => {
        document.documentElement.classList.add('mega-open');
        li.classList.add('is-open');
        // aria-expanded状態を更新
        if (mainLink) {
          mainLink.setAttribute('aria-expanded', 'true');
        }
        // マウス操作ではフォーカスは移動させない（視覚的なユーザーのため）
      });
      
      // マウスが離れた時のイベントハンドラー
      li.addEventListener('mouseleave', (e) => {
        document.documentElement.classList.remove('mega-open');
        li.classList.remove('is-open');
        // aria-expanded状態を更新
        if (mainLink) {
          mainLink.setAttribute('aria-expanded', 'false');
        }
      });
      
      // キーボードフォーカスのサポート
      if (mainLink) {
        // キーボードでフォーカスされた時
        mainLink.addEventListener('focus', () => {
          document.documentElement.classList.add('mega-open');
          li.classList.add('is-open');
          mainLink.setAttribute('aria-expanded', 'true');
        });
        
        // Enterキーまたはスペースキーでドロップダウンを開いて最初の項目にフォーカス
        mainLink.addEventListener('keydown', (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !li.classList.contains('is-open')) {
            e.preventDefault(); // デフォルトの動作を防止
            document.documentElement.classList.add('mega-open');
            li.classList.add('is-open');
            mainLink.setAttribute('aria-expanded', 'true');
            
            // ドロップダウン内の最初のリンクにフォーカスを移動
            const firstDropdownLink = dropdown.querySelector('a');
            if (firstDropdownLink) {
              setTimeout(() => {
                firstDropdownLink.focus();
              }, 10); // 少し遅延させてDOMの更新を確実にする
            }
          }
        });
        
        // キーボードでフォーカスが外れた時（次の要素にフォーカスが移った時）
        mainLink.addEventListener('blur', (e) => {
          // フォーカスが同じドロップダウン内の要素に移ったかチェック
          const relatedTarget = e.relatedTarget;
          if (!li.contains(relatedTarget)) {
            document.documentElement.classList.remove('mega-open');
            li.classList.remove('is-open');
            mainLink.setAttribute('aria-expanded', 'false');
          }
        });
        
        // Escape キーでドロップダウンを閉じる機能を追加
        mainLink.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && li.classList.contains('is-open')) {
            document.documentElement.classList.remove('mega-open');
            li.classList.remove('is-open');
            mainLink.setAttribute('aria-expanded', 'false');
            // フォーカスをメインリンクに戻す
            mainLink.focus();
          }
        });
      }
      
      // ドロップダウン内のすべてのリンクにblur、keydownイベントを設定
      if (dropdown) {
        const dropdownLinks = dropdown.querySelectorAll('a');
        
        // キーボードナビゲーションのサポート
        dropdownLinks.forEach((link, linkIndex) => {
          // 上下キーでのナビゲーション対応
          link.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              const nextLink = dropdownLinks[linkIndex + 1] || dropdownLinks[0];
              nextLink.focus();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              const prevLink = dropdownLinks[linkIndex - 1] || dropdownLinks[dropdownLinks.length - 1];
              prevLink.focus();
            } else if (e.key === 'Home') {
              e.preventDefault();
              dropdownLinks[0].focus();
            } else if (e.key === 'End') {
              e.preventDefault();
              dropdownLinks[dropdownLinks.length - 1].focus();
            }
          });
        });
        
        dropdownLinks.forEach(link => {
          // blurイベント
          link.addEventListener('blur', (e) => {
            // フォーカスが同じドロップダウン内の要素に移ったかチェック
            const relatedTarget = e.relatedTarget;
            if (!li.contains(relatedTarget)) {
              document.documentElement.classList.remove('mega-open');
              li.classList.remove('is-open');
              if (mainLink) {
                mainLink.setAttribute('aria-expanded', 'false');
              }
            }
          });
          
          // Escapeキーのサポート
          link.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              document.documentElement.classList.remove('mega-open');
              li.classList.remove('is-open');
              if (mainLink) {
                mainLink.setAttribute('aria-expanded', 'false');
                // フォーカスをメインリンクに戻す
                mainLink.focus();
              }
            }
          });
        });
      }
    });
  }

  fixControl() {
    const adjustNum = 200;//ヘッダーすぎてからのスクロール量
    window.addEventListener("scroll", () => {
      // backfaceFixedの状態を確認（関数を実行して結果を取得）
      const isBodyFixed = isBackfaceFixed();
      
      if (isBodyFixed) {
        // ドロワー/モーダルが開いている場合は何もしない
        console.log('bodyが固定中のため、ヘッダー状態を変更しません');
        return;
      }
      
      if (scrollY > this.headerHeight + adjustNum) {
        this.header.classList.add('is-fixed')
      } 
      else {
        this.header.classList.remove('is-fixed')
     }
   })
  }
}

export default Header;