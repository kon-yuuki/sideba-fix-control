/**
 * SidebarFixControl - スクロール時のサイドバー固定動作を処理するシンプル化したクラス
 */
class SidebarFixControl {
  constructor(options = {}) {
    // デフォルト設定
    this.config = Object.assign({
      sidebarSelector: '#sidebar',
      contentSelector: '#content',
      floatingBoxSelector: '#floatingBox',
      fixedClass: 'fixed',
      floatClass: 'float',
      marginTop: 30, // 画面上部からの余白(px)
      marginBottom: 30, // 画面下部からの余白(px)
      detectionThreshold: 20, // 固定判定の閾値(px)
      monitorHeightChanges: false, // デフォルトでは高さ変化の監視を無効化
      detectionInterval: 100, // 高さ変化の検出間隔(ms)
      debug: false // デバッグモードのフラグ
    }, options);
    
    // 要素の取得
    this.sidebar = document.querySelector(this.config.sidebarSelector);
    this.content = document.querySelector(this.config.contentSelector);
    this.floatingBox = document.querySelector(this.config.floatingBoxSelector);
    
    // 状態変数
    this.contentHeight = 0;
    this.sidebarHeight = 0;
    this.lastScrollY = 0;
    this.heightMonitor = null;
    
    // イベントハンドラをバインド
    this.scrollHandler = this._handleScroll.bind(this);
    this.resizeHandler = this._handleResize.bind(this);

    // 初期化実行
    this.init();
  }
  
  /**
   * デバッグログを出力する関数
   */
  _debug(message, data = {}) {
    if (this.config.debug) {
      console.log(`[SidebarFixControl] ${message}`, data);
    }
  }
  
  /**
   * サイドバー固定機能を初期化
   */
  init() {
    // 必要な要素が見つからない場合は処理しない
    if (!this.sidebar || !this.content || !this.floatingBox) {
      this._debug('必要な要素が見つかりません');
      return;
    }
    
    this._setupEventListeners();
    
    // 高さ変化の監視がオプションで有効な場合のみ実行
    if (this.config.monitorHeightChanges) {
      this._monitorHeightChanges();
      this._debug('高さ変化の監視を開始しました');
    } else {
      this._debug('高さ変化の監視はオフに設定されています');
      // 監視を行わない場合も、現在の高さを保存しておく
      this.contentHeight = this.content.offsetHeight;
      this.sidebarHeight = this.floatingBox.offsetHeight;
    }
    
    this._handleScroll(); // 初期表示時に一度実行
    
    this._debug('初期化完了');
  }
  
  /**
   * イベントリスナーを設定
   */
  _setupEventListeners() {
    window.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.resizeHandler);
    this._debug('イベントリスナーを設定しました');
  }
  
  /**
   * スクロールイベントハンドラ
   */
  _handleScroll() {
    // ウィンドウの高さとサイドバーの高さを取得
    const windowHeight = window.innerHeight;
    const sidebarHeight = this.floatingBox.offsetHeight;
    
    // サイドバーがウィンドウより高い場合のみ特別処理
    if (sidebarHeight > windowHeight) {
      this._handleTallSidebar(windowHeight, sidebarHeight);
    } else {
      // サイドバーがウィンドウより低い場合は中央配置
      this._centerSidebar(windowHeight, sidebarHeight);
    }
    
    // スクロール位置を記録
    this.lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  }
  
  /**
   * サイドバーがウィンドウより高い場合の処理
   */
  _handleTallSidebar(windowHeight, sidebarHeight) {
    // 設定値の取得
    const marginTop = this.config.marginTop;
    const marginBottom = this.config.marginBottom;
    const threshold = this.config.detectionThreshold;
    
    // 現在のスクロール位置と方向
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const isScrollingDown = currentScrollY > this.lastScrollY;
    const scrollAmount = Math.abs(currentScrollY - this.lastScrollY);
    
    // サイドバーの現在位置情報
    const sidebarRect = this.floatingBox.getBoundingClientRect();
    const sidebarTop = sidebarRect.top;
    const sidebarBottom = sidebarRect.bottom;
    
    // 現在のtop値（CSSで計算された実際の値）
    const currentTopValue = parseFloat(window.getComputedStyle(this.floatingBox).top) || marginTop;
    
    let newTopValue;
    
    // スクロール方向に応じた処理
    if (isScrollingDown) {
      // 下スクロール時：下端固定判定
      const shouldFixBottom = sidebarBottom <= windowHeight + threshold;
      newTopValue = shouldFixBottom
        ? windowHeight - sidebarHeight - marginBottom // 下端固定
        : currentTopValue - scrollAmount; // 通常スクロール
        
      this._debug(`下スクロール - ${shouldFixBottom ? '下端固定' : '通常移動'}`, { newTopValue });
    } else {
      // 上スクロール時：上端固定判定
      const shouldFixTop = sidebarTop >= marginTop - threshold;
      newTopValue = shouldFixTop
        ? marginTop // 上端固定
        : currentTopValue + scrollAmount; // 通常スクロール
        
      this._debug(`上スクロール - ${shouldFixTop ? '上端固定' : '通常移動'}`, { newTopValue });
    }
    
    // 値の範囲を制限（上端〜下端の間）
    newTopValue = Math.min(
      Math.max(newTopValue, windowHeight - sidebarHeight - marginBottom), // 下限値（下端固定位置）
      marginTop // 上限値（上端固定位置）
    );
    
    // サイドバーに位置を適用
    this._applySidebarPosition(newTopValue);
  }
  
  /**
   * サイドバーがウィンドウより低い場合の中央配置処理
   */
  _centerSidebar(windowHeight, sidebarHeight) {
    const centerPosition = (windowHeight - sidebarHeight) / 2;
    this.floatingBox.style.position = 'sticky';
    this.floatingBox.style.top = `${centerPosition}px`;
    this._debug('中央配置', { centerPosition });
  }
  
  /**
   * 計算した位置をサイドバーに適用
   */
  _applySidebarPosition(topValue) {
    this.floatingBox.style.position = 'sticky';
    this.floatingBox.style.top = `${topValue}px`;
  }
  
  /**
   * リサイズイベントハンドラ
   */
  _handleResize() {
    this._handleScroll();
    
    // レスポンシブ対応（モバイル向け）
    if (window.outerWidth < 768) {
      this._resetSidebar();
      this.sidebar.classList.add(this.config.floatClass);
      this._debug('モバイル表示モード');
    }
  }
  
  /**
   * サイドバーのスタイルとクラスをリセット
   */
  _resetSidebar() {
    this.sidebar.classList.remove(this.config.fixedClass, this.config.floatClass);
    this.sidebar.style.position = '';
    this.floatingBox.style.position = '';
    this.floatingBox.style.top = '';
    this.floatingBox.style.bottom = '';
  }
  
  /**
   * コンテンツとサイドバーの高さ変化を監視
   */
  _monitorHeightChanges() {
    // 既存のタイマーがあれば先にクリア
    if (this.heightMonitor) {
      clearInterval(this.heightMonitor);
    }
    
    // 新しいタイマーを設定
    this.heightMonitor = setInterval(() => {
      const newContentHeight = this.content.offsetHeight;
      const newSidebarHeight = this.floatingBox.offsetHeight;
      
      if (this.contentHeight !== newContentHeight || this.sidebarHeight !== newSidebarHeight) {
        this._debug('高さが変化しました', {
          oldContentHeight: this.contentHeight,
          newContentHeight,
          oldSidebarHeight: this.sidebarHeight,
          newSidebarHeight
        });
        
        this._handleScroll();
        this.contentHeight = newContentHeight;
        this.sidebarHeight = newSidebarHeight;
      }
    }, this.config.detectionInterval);
  }
  
  /**
   * 手動で高さを更新し、位置を再計算するメソッド
   * monitorHeightChangesをfalseに設定している場合に便利
   */
  updateHeights() {
    this.contentHeight = this.content.offsetHeight;
    this.sidebarHeight = this.floatingBox.offsetHeight;
    this._handleScroll();
    
    this._debug('高さを手動更新しました', {
      contentHeight: this.contentHeight,
      sidebarHeight: this.sidebarHeight
    });
    
    return this; // メソッドチェーン用
  }
  
  /**
   * サイドバー固定機能を破棄し、イベントリスナーをクリーンアップ
   */
  destroy() {
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.resizeHandler);
    
    // 高さ監視タイマーが存在する場合のみクリア
    if (this.heightMonitor) {
      clearInterval(this.heightMonitor);
      this.heightMonitor = null;
    }
    
    this._resetSidebar();
    this._debug('インスタンスを破棄しました');
  }
}

export default SidebarFixControl;


/*
 * ===================================================
 * SidebarFixControl の使用例
 * ===================================================
 *
 * 以下のコメントブロックには、SidebarFixControlの様々な使用例を示しています。
 * これはドキュメントとして利用するためのもので、実際には実行されません。
 */

/*
 * 基本的な初期化（デフォルト設定を使用）
 * ---------------------------------------
 * const sidebarFixer = new SidebarFixControl();
 */

/*
 * カスタム設定で初期化
 * ---------------------------------------
 * const customSidebarFixer = new SidebarFixControl({
 *   sidebarSelector: '#custom-sidebar', // カスタムセレクタ
 *   contentSelector: '#main-content',
 *   floatingBoxSelector: '#floating-content',
 *   marginTop: 50, // 上部からの余白を50pxに
 *   marginBottom: 20, // 下部からの余白を20pxに
 *   debug: true // デバッグログを有効化
 * });
 */

/*
 * 高さ監視を有効にする場合
 * ---------------------------------------
 * const monitoringSidebarFixer = new SidebarFixControl({
 *   monitorHeightChanges: true, // 高さの変化を監視
 *   detectionInterval: 200 // 監視間隔を200msに設定
 * });
 */

/*
 * モバイル向けの設定（レスポンシブ）
 * ---------------------------------------
 * const responsiveSidebarFixer = new SidebarFixControl({
 *   // モバイルではfloatクラスが自動的に追加される
 *   floatClass: 'mobile-float' // カスタムクラス名
 * });
 */

/*
 * ===================================================
 * updateHeights関数の使用例
 * ===================================================
 */

/*
 * 1. ボタンクリック時にサイドバーの高さを更新
 * ---------------------------------------
 * document.querySelector('#update-button').addEventListener('click', () => {
 *   sidebarFixer.updateHeights();
 * });
 */

/*
 * 2. アコーディオンメニューの開閉後に高さを更新
 * ---------------------------------------
 * document.querySelectorAll('.accordion-toggle').forEach(toggle => {
 *   toggle.addEventListener('click', () => {
 *     // アコーディオンの開閉処理
 *     toggle.nextElementSibling.classList.toggle('open');
 *     
 *     // コンテンツの高さが変わったので更新
 *     sidebarFixer.updateHeights();
 *   });
 * });
 */

/*
 * 3. タブ切り替え時に高さを更新
 * ---------------------------------------
 * document.querySelectorAll('.tab-button').forEach(tab => {
 *   tab.addEventListener('click', () => {
 *     // タブ関連の処理
 *     document.querySelector('.tab.active').classList.remove('active');
 *     document.getElementById(tab.dataset.target).classList.add('active');
 *     
 *     // コンテンツの高さが変わったので更新
 *     sidebarFixer.updateHeights();
 *   });
 * });
 */

/*
 * 4. Ajaxコンテンツ読み込み後の更新
 * ---------------------------------------
 * fetch('/api/content')
 *   .then(response => response.json())
 *   .then(data => {
 *     // コンテンツを更新
 *     document.querySelector('#dynamic-content').innerHTML = data.html;
 *     
 *     // 画像も含む場合、画像読み込み完了後に高さを更新
 *     const images = document.querySelectorAll('#dynamic-content img');
 *     if (images.length > 0) {
 *       let loadedImages = 0;
 *       images.forEach(img => {
 *         img.onload = () => {
 *           loadedImages++;
 *           if (loadedImages === images.length) {
 *             // すべての画像が読み込まれたら更新
 *             sidebarFixer.updateHeights();
 *           }
 *         };
 *       });
 *     } else {
 *       // 画像がない場合はすぐに更新
 *       sidebarFixer.updateHeights();
 *     }
 *   });
 */

/*
 * 5. ウィンドウのリサイズ後に手動更新（節約のため）
 * ---------------------------------------
 * let resizeTimer;
 * window.addEventListener('resize', () => {
 *   clearTimeout(resizeTimer);
 *   resizeTimer = setTimeout(() => {
 *     sidebarFixer.updateHeights();
 *   }, 250); // 250ms後に実行（連続リサイズの負荷軽減）
 * });
 */

/*
 * 6. メソッドチェーンの例
 * ---------------------------------------
 * document.querySelector('#refresh-button').addEventListener('click', () => {
 *   sidebarFixer
 *     .updateHeights()
 *     ._debug('ユーザーによる手動更新が実行されました');
 * });
 */

/*
 * 7. インスタンスの破棄（ページ遷移時やSPA切り替え時）
 * ---------------------------------------
 * function cleanupPage() {
 *   sidebarFixer.destroy(); // イベントリスナーとタイマーをクリーンアップ
 * }
 */