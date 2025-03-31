// backfaceFixed.ts
let isFixed = false;

const backfaceFixed = (fixed) => {
  if (isFixed === fixed) return; // 状態が変わらない場合は何もしない
  isFixed = fixed;

  // スクロールバーの幅を計算
  const scrollbarWidth = window.innerWidth - document.body.clientWidth;
  
  // スクロールバー対応クラスを管理
  if (fixed) {
    // 固定時：スクロールバー対応クラスを追加
    document.documentElement.classList.add('js-backface-fixed');
    // スクロールバー幅のCSSカスタムプロパティを設定
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  } else {
    // 固定解除時：スクロールバー対応クラスを削除
    document.documentElement.classList.remove('js-backface-fixed');
    // カスタムプロパティをクリア
    document.documentElement.style.removeProperty('--scrollbar-width');
  }

  const scrollingElement = () => {
    const browser = window.navigator.userAgent.toLowerCase();
    if ('scrollingElement' in document) return document.scrollingElement;
    if (browser.indexOf('webkit') > 0) return document.body;
    return document.body;
  };

  let scrollY;
  if (fixed) {
    scrollY = scrollingElement().scrollTop;
    document.body.style.top = `${scrollY * -1}px`;
  } else {
    scrollY = Math.abs(parseInt(document.body.style.top || '0'));
  }

  const styles = {
    height: '100svh',
    left: '0',
    overflow: 'hidden',
    position: 'fixed',
    width: '100vw',
  };

  if (fixed) {
    Object.keys(styles).forEach((key) => {
      document.body.style[key] = styles[key];
    });
  } else {
    Object.keys(styles).forEach((key) => {
      document.body.style[key] = '';
    });
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  }
};

// 状態を確認するための関数
const isBackfaceFixed = () => isFixed;

export { backfaceFixed, isBackfaceFixed };