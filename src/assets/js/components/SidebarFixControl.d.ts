/**
 * SidebarFixControlのオプション設定インターフェース
 */
export interface SidebarFixControlOptions {
  /**
   * サイドバー要素のCSSセレクタ
   * @default '#sidebar'
   */
  sidebarSelector?: string;
  
  /**
   * メインコンテンツ要素のCSSセレクタ
   * @default '#content'
   */
  contentSelector?: string;
  
  /**
   * サイドバー内で実際に固定する要素のCSSセレクタ
   * @default '#floatingBox'
   */
  floatingBoxSelector?: string;
  
  /**
   * 固定時に追加するクラス名
   * @default 'fixed'
   */
  fixedClass?: string;
  
  /**
   * フロート状態時に追加するクラス名
   * @default 'float'
   */
  floatClass?: string;
  
  /**
   * 画面上部からの余白(px)
   * @default 30
   */
  marginTop?: number;
  
  /**
   * 画面下部からの余白(px)
   * @default 30
   */
  marginBottom?: number;
  
  /**
   * 固定判定の閾値(px)
   * @default 20
   */
  detectionThreshold?: number;
  
  /**
   * 高さ変化の監視を有効化するかどうか
   * @default false
   */
  monitorHeightChanges?: boolean;
  
  /**
   * 高さ変化の検出間隔(ms)
   * @default 100
   */
  detectionInterval?: number;
  
  /**
   * デバッグモードのフラグ
   * @default false
   */
  debug?: boolean;
}

/**
 * SidebarFixControl - スクロール時のサイドバー固定動作を処理するクラス
 */
export default class SidebarFixControl {
  /**
   * コンストラクタ
   * @param options 設定オプション
   */
  constructor(options?: SidebarFixControlOptions);

  /**
   * 現在の設定オブジェクト
   */
  config: SidebarFixControlOptions;

  /**
   * サイドバー要素
   */
  sidebar: HTMLElement | null;

  /**
   * コンテンツ要素
   */
  content: HTMLElement | null;

  /**
   * 浮動要素
   */
  floatingBox: HTMLElement | null;

  /**
   * サイドバー固定機能を初期化
   */
  init(): void;

  /**
   * 手動で高さを更新し、位置を再計算するメソッド
   * monitorHeightChangesをfalseに設定している場合に便利
   * @returns 自身のインスタンス（メソッドチェーン用）
   */
  updateHeights(): this;

  /**
   * サイドバー固定機能を破棄し、イベントリスナーをクリーンアップ
   */
  destroy(): void;
}