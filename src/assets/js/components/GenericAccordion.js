/**
* 拡張された柔軟なアコーディオンクラス（子アコーディオン自動閉鎖機能付き）
* ネストされたアコーディオンとシンプルなアコーディオンの両方に対応し、
* 親アコーディオンを閉じる際に子アコーディオンも自動的に閉じます
* デバッグ用ログ追加版
*/
class GenericAccordion {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.log('GenericAccordion: コンストラクタが呼び出されました');
    this.options = {
      accordionSelector: '.js-accordion-parent-key',
      contentSelector: '.js-accordion-parent-content',
      buttonSelector: '.js-accordion-parent-label',  // 追加：ボタン要素のセレクター
      nestedAccordionSelector: '.js-accordion-child-key',
      nestedContentSelector: '.js-accordion-child-content',
      nestedButtonSelector: '.js-accordion-child-item-label',  // 追加：子アコーディオンのボタン要素のセレクター
      openClass: 'is-open',
      animationDuration: 300,
      easing: 'cubic-bezier(0.55, 0.05, 0.22, 0.99)',
      transitionProperty: 'height,opacity,padding',
      debug: this.debug,
      ...options
    };
    this.debug = this.options.debug;
    this.log('GenericAccordion: オプション設定完了', this.options);
    
    this.isAnimating = false;
    this.accordionElements = document.querySelectorAll(this.options.accordionSelector);
    this.log(`GenericAccordion: ${this.accordionElements.length}個のアコーディオン要素を取得しました`);
    
    this.init();
  }

  /**
   * デバッグログを出力するユーティリティメソッド
   */
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  /**
   * 警告ログを出力するユーティリティメソッド
   */
  warn(...args) {
    if (this.debug) {
      console.warn(...args);
    }
  }

  init() {
    this.log('GenericAccordion: init() メソッドが呼び出されました');
    
    if (this.accordionElements.length === 0) {
      this.warn('GenericAccordion: アコーディオン要素が見つかりません');
      return;
    }
    
    this.accordionElements.forEach((accordionEl, index) => {
      this.log(`GenericAccordion: アコーディオン[${index}]の初期化を開始`);
      
      const contentEl = accordionEl.querySelector(this.options.contentSelector);
      const buttonEl = accordionEl.querySelector(this.options.buttonSelector);
      
      if (!contentEl) {
        this.warn(`GenericAccordion: アコーディオン[${index}]のコンテンツ要素が見つかりません`);
      }
      
      if (!buttonEl) {
        this.warn(`GenericAccordion: アコーディオン[${index}]のボタン要素が見つかりません`);
      }
      
      if (!contentEl || !buttonEl) return;

      // 初期状態のaria-expandedを設定
      const isOpen = accordionEl.classList.contains(this.options.openClass);
      this.log(`GenericAccordion: アコーディオン[${index}]の初期状態: ${isOpen ? '開' : '閉'}`);
      
      buttonEl.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      if (isOpen) {
        this.log(`GenericAccordion: アコーディオン[${index}]は初期状態で開いています`);
        this.show(contentEl);
      }

      accordionEl.addEventListener('click', (e) => {
        this.log(`GenericAccordion: アコーディオン[${index}]がクリックされました`);
        
        // if (e.target.closest('a, button')) {
        //   this.log('GenericAccordion: aまたはbutton要素がクリックされたため、処理をスキップします');
        //   return;
        // }

        if (e.target === accordionEl || e.target.closest(this.options.accordionSelector) === accordionEl) {
          e.preventDefault();
          this.log(`GenericAccordion: アコーディオン[${index}]のトグル処理を実行します`);
          this.toggleAccordion(accordionEl, contentEl, buttonEl);
        }
      });

      // キーボードイベントの処理を追加
      buttonEl.addEventListener('keydown', (e) => {
        this.log(`GenericAccordion: アコーディオン[${index}]のボタンでキーが押されました: ${e.key}`);
        
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.log(`GenericAccordion: アコーディオン[${index}]のトグル処理をキーボードイベントから実行します`);
          this.toggleAccordion(accordionEl, contentEl, buttonEl);
        }
      });

      // ネストされたアコーディオンの処理
      const nestedAccordionElements = contentEl.querySelectorAll(this.options.nestedAccordionSelector);
      this.log(`GenericAccordion: アコーディオン[${index}]内に${nestedAccordionElements.length}個の子アコーディオンが見つかりました`);
      
      nestedAccordionElements.forEach((nestedAccordionEl, nestedIndex) => {
        this.log(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]の初期化を開始`);
        
        const nestedContentEl = nestedAccordionEl.querySelector(this.options.nestedContentSelector);
        const nestedButtonEl = nestedAccordionEl.querySelector(this.options.nestedButtonSelector);
        
        if (!nestedContentEl) {
          this.warn(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]のコンテンツ要素が見つかりません`);
        }
        
        if (!nestedButtonEl) {
          this.warn(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]のボタン要素が見つかりません`);
        }
        
        if (!nestedContentEl || !nestedButtonEl) return;

        // ネストされたアコーディオンの初期状態を設定
        const isNestedOpen = nestedAccordionEl.classList.contains(this.options.openClass);
        this.log(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]の初期状態: ${isNestedOpen ? '開' : '閉'}`);
        
        nestedButtonEl.setAttribute('aria-expanded', isNestedOpen ? 'true' : 'false');

        if (isNestedOpen) {
          this.log(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]は初期状態で開いています`);
          this.show(nestedContentEl);
        }

        nestedAccordionEl.addEventListener('click', (e) => {
          this.log(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]がクリックされました`);
          
          // if (e.target.closest('a, button')) {
          //   this.log('GenericAccordion: aまたはbutton要素がクリックされたため、処理をスキップします');
          //   return;
          // }

          e.stopPropagation();
          e.preventDefault();
          this.log(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]のトグル処理を実行します`);
          this.toggleAccordion(nestedAccordionEl, nestedContentEl, nestedButtonEl);
        });

        // ネストされたアコーディオンのキーボードイベントを追加
        nestedButtonEl.addEventListener('keydown', (e) => {
          this.log(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]のボタンでキーが押されました: ${e.key}`);
          
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            this.log(`GenericAccordion: 子アコーディオン[${index}-${nestedIndex}]のトグル処理をキーボードイベントから実行します`);
            this.toggleAccordion(nestedAccordionEl, nestedContentEl, nestedButtonEl);
          }
        });
      });
    });
  }

  toggleAccordion(accordionEl, contentEl, buttonEl) {
    this.log('GenericAccordion: toggleAccordion() メソッドが呼び出されました');
    
    if (this.isAnimating) {
      this.log('GenericAccordion: アニメーション実行中のため、トグル処理をスキップします');
      return;
    }
    
    const isExpanding = !accordionEl.classList.contains(this.options.openClass);
    this.log(`GenericAccordion: アコーディオンの状態変更: ${isExpanding ? '閉→開' : '開→閉'}`);

    if (isExpanding) {
      this.log('GenericAccordion: アコーディオンを開きます');
      this.show(contentEl);
      accordionEl.classList.add(this.options.openClass);
      buttonEl.setAttribute('aria-expanded', 'true');
    } else {
      this.log('GenericAccordion: アコーディオンを閉じます');
      this.hide(contentEl, true);
      accordionEl.classList.remove(this.options.openClass);
      buttonEl.setAttribute('aria-expanded', 'false');

      // 親アコーディオンを閉じる際に、子アコーディオンのaria-expandedも更新
      const nestedButtons = contentEl.querySelectorAll(this.options.nestedButtonSelector);
      this.log(`GenericAccordion: ${nestedButtons.length}個の子アコーディオンボタンのaria-expandedを更新します`);
      
      nestedButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    }
  }
  
  /**
   * アコーディオンを表示するメソッド
   */
  show(el) {
    this.log('GenericAccordion: show() メソッドが呼び出されました');
    this.log('GenericAccordion: 対象要素:', el);
    
    this.isAnimating = true;
    this.log('GenericAccordion: isAnimating = true に設定');
    
    const handleTransitionEnd = (e) => {
      this.log(`GenericAccordion: トランジション終了イベント発生 - プロパティ: ${e.propertyName}`);
      
      if (e.propertyName === 'height') {
        this.log('GenericAccordion: height プロパティのトランジション完了を検出');
        this.log('GenericAccordion: 高さを auto に設定します');
        el.style.height = 'auto';
        el.style.overflow = '';
        
        this.log('GenericAccordion: ネストされたアコーディオンの高さを復元します');
        this.log('GenericAccordion: nestedAccordionStates:', nestedAccordionStates);
        
        nestedAccordionStates.forEach(state => {
          this.log(`GenericAccordion: 子要素の高さを ${state.height} に設定`);
          state.el.style.height = state.height;
        });
        
        this.isAnimating = false;
        this.log('GenericAccordion: isAnimating = false に設定');
        
        this.log('GenericAccordion: トランジション終了イベントリスナーを削除');
        el.removeEventListener('transitionend', handleTransitionEnd);
      }
    };

    const nestedAccordions = Array.from(el.querySelectorAll(this.options.nestedContentSelector));
    this.log(`GenericAccordion: ${nestedAccordions.length}個のネストされたコンテンツ要素を検出`);
    
    const nestedAccordionStates = nestedAccordions.map(acc => {
      const state = { el: acc, height: acc.style.height };
      this.log(`GenericAccordion: ネストされた要素の元の高さ: ${state.height}`);
      return state;
    });
 
    this.log('GenericAccordion: ネストされた要素の高さを0に設定');
    nestedAccordions.forEach(acc => acc.style.height = '0');
 
    this.log('GenericAccordion: 要素の高さを一時的に auto に設定して高さを計算');
    el.style.height = 'auto';
    const height = el.offsetHeight;
    this.log(`GenericAccordion: 計算された高さ: ${height}px`);
    
    this.log('GenericAccordion: 要素の高さを0に戻してアニメーションの準備');
    el.style.height = '0';
    el.offsetHeight; // 強制的なリフロー
    this.log('GenericAccordion: 強制リフロー完了');
    el.style.overflow = 'hidden';
    el.style.transition = `${this.options.animationDuration}ms ${this.options.easing}`;
    el.style.transitionProperty = this.options.transitionProperty;
    console.log(`GenericAccordion: トランジション設定 - duration: ${this.options.animationDuration}ms, easing: ${this.options.easing}, properties: ${this.options.transitionProperty}`);
    
    console.log(`GenericAccordion: 要素の高さを ${height}px に設定してアニメーション開始`);
    el.style.height = `${height}px`;
    el.setAttribute('aria-hidden', 'false');

    console.log('GenericAccordion: トランジション終了イベントリスナーを追加');
    el.addEventListener('transitionend', handleTransitionEnd);
    
    // 追加: トランジションが発火しない場合のフォールバック
    console.log('GenericAccordion: トランジションタイムアウトを設定 (フォールバック)');
    setTimeout(() => {
      console.log(`GenericAccordion: トランジションタイムアウト発生 (${this.options.animationDuration + 50}ms後)`);
      
      if (this.isAnimating) {
        console.log('GenericAccordion: アニメーションがまだ完了していないため、フォールバック処理を実行');
        el.style.height = 'auto';
        el.style.overflow = '';
        
        nestedAccordionStates.forEach(state => {
          state.el.style.height = state.height;
        });
        
        this.isAnimating = false;
        el.removeEventListener('transitionend', handleTransitionEnd);
      }
    }, this.options.animationDuration + 50);
  }
 
  /**
   * アコーディオンを非表示にするメソッド
   */
  hide(el, closeNested = false) {
    console.log('GenericAccordion: hide() メソッドが呼び出されました');
    console.log(`GenericAccordion: 対象要素: ${el}, ネストを閉じる: ${closeNested}`);
    
    this.isAnimating = true;
    console.log('GenericAccordion: isAnimating = true に設定');
    
    const handleTransitionEnd = (e) => {
      console.log(`GenericAccordion: トランジション終了イベント発生 - プロパティ: ${e.propertyName}`);
      
      if (e.propertyName === 'height') {
        console.log('GenericAccordion: height プロパティのトランジション完了を検出');
        el.style.overflow = '';
        console.log('GenericAccordion: トランジション終了イベントリスナーを削除');
        el.removeEventListener('transitionend', handleTransitionEnd);
        this.isAnimating = false;
        console.log('GenericAccordion: isAnimating = false に設定');
      }
    };

    if (closeNested) {
      const nestedOpenAccordions = el.querySelectorAll(`${this.options.nestedAccordionSelector}.${this.options.openClass}`);
      console.log(`GenericAccordion: ${nestedOpenAccordions.length}個の開いているネストされたアコーディオンを検出`);
      
      nestedOpenAccordions.forEach((nestedAccordion, index) => {
        console.log(`GenericAccordion: ネストされたアコーディオン[${index}]を閉じます`);
        const nestedContent = nestedAccordion.querySelector(this.options.nestedContentSelector);
        
        if (nestedContent) {
          console.log(`GenericAccordion: ネストされたアコーディオン[${index}]のコンテンツを非表示にします`);
          this.hide(nestedContent);
          nestedAccordion.classList.remove(this.options.openClass);
        } else {
          console.warn(`GenericAccordion: ネストされたアコーディオン[${index}]のコンテンツ要素が見つかりません`);
        }
      });
    }
 
    console.log(`GenericAccordion: 現在の要素の高さ: ${el.offsetHeight}px`);
    el.style.height = `${el.offsetHeight}px`;
    el.offsetHeight; // 強制的なリフロー
    console.log('GenericAccordion: 強制リフロー完了');
    
    console.log('GenericAccordion: トランジションプロパティを設定');
    el.style.overflow = 'hidden';
    el.style.transition = `${this.options.animationDuration}ms ${this.options.easing}`;
    el.style.transitionProperty = this.options.transitionProperty;
    console.log(`GenericAccordion: トランジション設定 - duration: ${this.options.animationDuration}ms, easing: ${this.options.easing}, properties: ${this.options.transitionProperty}`);
    
    console.log('GenericAccordion: 要素の高さを0に設定してアニメーション開始');
    el.style.height = '0';
    el.setAttribute('aria-hidden', 'true');
    
    console.log('GenericAccordion: トランジション終了イベントリスナーを追加');
    el.addEventListener('transitionend', handleTransitionEnd);
    
    // 追加: トランジションが発火しない場合のフォールバック
    console.log('GenericAccordion: トランジションタイムアウトを設定 (フォールバック)');
    setTimeout(() => {
      console.log(`GenericAccordion: トランジションタイムアウト発生 (${this.options.animationDuration + 50}ms後)`);
      
      if (this.isAnimating) {
        console.log('GenericAccordion: アニメーションがまだ完了していないため、フォールバック処理を実行');
        el.style.overflow = '';
        el.removeEventListener('transitionend', handleTransitionEnd);
        this.isAnimating = false;
      }
    }, this.options.animationDuration + 50);
  }
}
 
export default GenericAccordion;