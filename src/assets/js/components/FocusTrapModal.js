//モーダル開閉制御用クラス
//モーダル開閉機能を両方もったボタンには、js-modal-open-close-btnクラスを付与
//モーダルを開く機能のみのボタンには、js-modal-open-btnクラスを付与
//モーダルを閉じる機能のみのボタンには、js-modal-close-btnクラスを付与
//モーダル内のフォーカス可能な要素には、js-modal-focusableクラスを付与
//モーダルの開閉ボタンには、data-open-class属性を設定して、モーダルが開いたときにhtml要素に付与するクラスを指定
//モーダルの開閉ボタンには、aria-controls属性を設定して、対応するモーダルのIDを指定

import { backfaceFixed } from "./backfaceFixed";

class FocusTrapModal {
  constructor() {
    // モーダルの開閉ボタンすべてを取得
    this.openCloseButtons = document.querySelectorAll(
      ".js-modal-open-close-btn"
    );
    this.header = document.querySelector('.l-header');
    // 開くボタンと閉じるボタンが別々の場合の対応
    this.openButtons = document.querySelectorAll(".js-modal-open-btn");
    this.closeButtons = document.querySelectorAll(".js-modal-close-btn");
    // イベントリスナーの重複登録を防ぐためのマップ
    this.registeredListeners = new Map();
    this.init()
  }

  init() {
    // 1. 開閉が同じボタンの場合の処理
    this.initToggleButtons();

    // 2. 開くと閉じるが別々のボタンの場合の処理
    this.initSeparateButtons();
  }

  // 表示されているフォーカス可能な要素のみを取得する関数
  getVisibleFocusableElements(container) {
    // すべてのフォーカス可能な要素を取得
    const allElements = container.querySelectorAll(
      "a, .js-modal-focusable, button"
    );

    // 表示されている要素のみをフィルタリング
    const visibleElements = [];

    allElements.forEach((element) => {
      // 要素自体とその親要素がすべて表示されているかチェック
      let currentElement = element;
      let isVisible = true;

      while (currentElement && currentElement !== document) {
        const style = window.getComputedStyle(currentElement);
        if (style.display === "none") {
          isVisible = false;
          break;
        }
        currentElement = currentElement.parentElement;
      }

      if (isVisible) {
        visibleElements.push(element);
      }
    });

    return visibleElements;
  }

  //開くボタンと閉じるボタンが同じ時
  initToggleButtons() {
    this.openCloseButtons.forEach((button) => {
      // ボタンに対応するコンテンツを取得
      const contentId = button.getAttribute("aria-controls");
      const content = document.getElementById(contentId);

      if (!content) {
        console.error(`Modal content with id "${contentId}" not found`);
        return;
      }

      // 初期状態では、モーダルコンテンツがフォーカスを受け取らないようにする
      if (!content.hasAttribute("tabindex")) {
        content.setAttribute("tabindex", "-1");
      }

      // 初期状態では、モーダルコンテンツをスクリーンリーダーから隠す
      content.setAttribute("aria-hidden", "true");

      // フォーカス可能な要素を取得
      // const focusableElements = content.querySelectorAll('a, .js-modal-focusable, button');
      const focusableElements = this.getVisibleFocusableElements(content);
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];

      // 閉じるボタンを探す
      const closeButtons = content.querySelectorAll(".js-modal-close-btn");
      let closeButton = null;
      if (closeButtons.length > 0) {
        closeButton = closeButtons[0];

        // 閉じるボタンのdata-open-class属性を設定（ない場合）
        const openClass = button.getAttribute("data-open-class");
        if (openClass && !closeButton.hasAttribute("data-open-class")) {
          closeButton.setAttribute("data-open-class", openClass);
        }
      }

      // モーダル情報を設定
      const modalInfo = {
        id: contentId, // 識別子として使用
        triggerButton: button,
        closeButton,
        content,
        focusableElements,
        firstFocusableElement,
        lastFocusableElement,
      };

      // 既に登録済みかチェック
      if (this.registeredListeners.has(contentId)) {
        return;
      }
      this.registeredListeners.set(contentId, true);

      // クリックイベントの設定
      const toggleHandler = () => {
        this.toggleModal(modalInfo);
      };
      button.addEventListener("click", toggleHandler);

      // Enterキーでの開閉
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.toggleModal(modalInfo);
        }
      });

      this.setupCommonEventListeners(modalInfo);
    });
  }

  //開くボタンと閉じるボタンが別の時
  initSeparateButtons() {
    // 開くボタンごとに処理
    this.openButtons.forEach((openButton) => {
      const contentId = openButton.getAttribute("aria-controls");
      const content = document.getElementById(contentId);

      if (!content) {
        console.error(`Modal content with id "${contentId}" not found`);
        return;
      }

      // 初期状態では、モーダルコンテンツがフォーカスを受け取らないようにする
      if (!content.hasAttribute("tabindex")) {
        content.setAttribute("tabindex", "-1");
      }

      // 初期状態では、モーダルコンテンツをスクリーンリーダーから隠す
      content.setAttribute("aria-hidden", "true");

      // 対応する閉じるボタンを探す
      const closeButton = Array.from(this.closeButtons).find(
        (btn) => btn.getAttribute("aria-controls") === contentId
      );

      // data-open-class属性の値を閉じるボタンにも引き継ぐ
      const openClass = openButton.getAttribute("data-open-class");
      if (
        openClass &&
        closeButton &&
        !closeButton.hasAttribute("data-open-class")
      ) {
        closeButton.setAttribute("data-open-class", openClass);
      }

      if (!closeButton) {
        console.warn(`No close button found for modal "${contentId}"`);
      }

      // フォーカス可能な要素を取得
      const focusableElements = content.querySelectorAll(
        "a, .js-modal-focusable, button"
      );
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];

      // モーダル情報を設定
      const modalInfo = {
        id: contentId, // 識別子として使用
        triggerButton: openButton, // 開くボタン
        closeButton, // 閉じるボタン
        content,
        focusableElements,
        firstFocusableElement,
        lastFocusableElement,
      };

      // 既に登録済みかチェック
      if (this.registeredListeners.has(contentId)) {
        return;
      }
      this.registeredListeners.set(contentId, true);

      // 開くボタンのクリックイベント
      openButton.addEventListener("click", () => this.openModal(modalInfo));

      // 開くボタンのEnterキーイベント
      openButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.openModal(modalInfo);
        }
      });

      // 閉じるボタンがある場合、そのイベントを設定
      if (closeButton) {
        closeButton.addEventListener("click", () => this.closeModal(modalInfo));
        closeButton.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.closeModal(modalInfo);
          }
        });
      }

      this.setupCommonEventListeners(modalInfo);
    });
  }

  setupCommonEventListeners(modalInfo) {
    const {
      content,
      triggerButton,
      focusableElements,
      firstFocusableElement,
      lastFocusableElement,
      closeButton,
    } = modalInfo;

    // モーダルが開いているときのキーボードナビゲーション
    content.addEventListener("keydown", (e) => {
      const isModalOpen = content.classList.contains("is-open");
      if (!isModalOpen) return;

      this.handleModalKeyboardNavigation(e, modalInfo);
    });

    // トリガーボタンのキーボードイベント
    triggerButton.addEventListener("keydown", (e) => {
      const isModalOpen = content.classList.contains("is-open");
      if (!isModalOpen) return;

      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          lastFocusableElement.focus();
        } else {
          console.log(firstFocusableElement);
          firstFocusableElement.focus();
        }
      }
    });

    // 閉じるボタンがある場合のEnterキー対応
    if (closeButton && closeButton !== triggerButton) {
      closeButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.closeModal(modalInfo);
        }
      });
    }

    // ESCキーでモーダルを閉じる - イベント委譲で一度だけ登録
    if (!this.escapeKeyRegistered) {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          // 開いているモーダルを探して閉じる
          const openModalContent = document.querySelector(
            ".js-modal-content.is-open"
          );
          if (openModalContent) {
            const modalId = openModalContent.id;
            if (this.registeredListeners.has(modalId)) {
              // 対応するボタンを探す
              const button = document.querySelector(
                `[aria-controls="${modalId}"]`
              );
              if (button) {
                // モーダル情報を再構築
                const tempModalInfo = {
                  triggerButton: button,
                  content: openModalContent,
                };
                this.closeModal(tempModalInfo);
              }
            }
          }
        }
      });
      this.escapeKeyRegistered = true;
    }

    // モーダル外のクリック - イベント委譲で一度だけ登録
    if (!this.outsideClickRegistered) {
      document.addEventListener("click", (e) => {
        const openModalContent = document.querySelector(
          ".js-modal-content.is-open"
        );
        if (!openModalContent) return;

        const modalId = openModalContent.id;
        const button = document.querySelector(`[aria-controls="${modalId}"]`);
        const closeBtn = openModalContent.querySelector(".js-modal-close-btn");

        const clickedOutside =
          !openModalContent.contains(e.target) &&
          !button.contains(e.target) &&
          !(closeBtn && closeBtn.contains(e.target));

        if (clickedOutside) {
          // モーダル情報を再構築
          const tempModalInfo = {
            triggerButton: button,
            content: openModalContent,
            closeButton: closeBtn,
          };
          this.closeModal(tempModalInfo);
        }
      });
      this.outsideClickRegistered = true;
    }
  }

  toggleModal(modalInfo) {
    const { triggerButton } = modalInfo;
    // aria-expanded属性が未設定の場合はfalseとみなす
    const isExpanded = triggerButton.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      this.closeModal(modalInfo);
    } else {
      this.openModal(modalInfo);
    }
  }

  //モーダルを開く
  openModal(modalInfo) {
    backfaceFixed(true);
    const { triggerButton, content, firstFocusableElement, closeButton } =
      modalInfo;

    // 開くボタンのaria-expanded属性を更新
    triggerButton.setAttribute("aria-expanded", "true");

    // 閉じるボタンがある場合、そちらも更新
    if (closeButton) {
      closeButton.setAttribute("aria-expanded", "true");
    }

    content.classList.add("is-open");

    // モーダルが開いたら、フォーカスを受け取れるようにする
    content.removeAttribute("tabindex");

    // モーダルが開いたら、スクリーンリーダーに表示する
    content.setAttribute("aria-hidden", "false");

    // data-open-class属性が設定されている場合、そのクラスを追加
    const openClass = triggerButton.getAttribute("data-open-class");
    if (openClass) {
      document.documentElement.classList.add(openClass);
    }

    // 最初のフォーカス可能な要素にフォーカス
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
  }

  //モーダルを閉じる
  closeModal(modalInfo) {
    backfaceFixed(false);
    const { triggerButton, content, closeButton } = modalInfo;

    // 開くボタンのaria-expanded属性を更新
    triggerButton.setAttribute("aria-expanded", "false");

    // 閉じるボタンがある場合、そちらも更新
    if (closeButton) {
      closeButton.setAttribute("aria-expanded", "false");
    }

    content.classList.remove("is-open");

    // モーダルが閉じたら、再びフォーカスを受け取らないようにする
    content.setAttribute("tabindex", "-1");

    // モーダルが閉じたら、スクリーンリーダーから隠す
    content.setAttribute("aria-hidden", "true");

    // data-open-class属性が設定されている場合、そのクラスを削除
    const openClass = triggerButton.getAttribute("data-open-class");
    if (openClass) {
      document.documentElement.classList.remove(openClass);
    }

    // 最後にフォーカスを元に戻す（通常は開くボタン）
    triggerButton.focus();
  }

  handleModalKeyboardNavigation(e, modalInfo) {
    const {
      triggerButton,
      content,
      focusableElements,
      firstFocusableElement,
      lastFocusableElement,
    } = modalInfo;
    const currentElement = e.target;
    const currentIndex = Array.from(focusableElements).indexOf(currentElement);

    // 現在の要素がfocusableElementsに含まれない場合は処理しない
    if (currentIndex === -1) return;

    switch (e.key) {
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + Tab
          if (currentElement === firstFocusableElement) {
            triggerButton.focus();
          } else {
            focusableElements[currentIndex - 1].focus();
          }
        } else {
          // Tab
          if (currentElement === lastFocusableElement) {
            triggerButton.focus();
          } else {
            focusableElements[currentIndex + 1].focus();
          }
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        const nextElement =
          focusableElements[currentIndex + 1] || firstFocusableElement;
        nextElement.focus();
        break;

      case "ArrowUp":
        e.preventDefault();
        const prevElement =
          focusableElements[currentIndex - 1] || lastFocusableElement;
        prevElement.focus();
        break;
    }
  }
}

export default FocusTrapModal;