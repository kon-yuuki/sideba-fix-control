import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      // エントリーポイントを指定
      entry: resolve(__dirname, "src/assets/js/components/SidebarFixControl.js"),
      name: "SidebarFixControl",
      // 出力ファイル名の設定
      fileName: (format) => `sidebar-fix-control.${format}.js`
    },
    rollupOptions: {
      // ライブラリにバンドルされるべきではない依存関係を外部化
      external: [],
      output: {
        // 外部化された依存関係のためのグローバル変数
        globals: {},
        // ソースマップを生成
        sourcemap: true,
        // コメントを保持
        preserveModules: false
      }
    },
    // minifyはtrueのままで問題ないが、出力ファイルを読みやすくするために無効化
    minify: false,
    // ソースマップを生成
    sourcemap: true
  }
});