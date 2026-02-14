import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isLibrary = mode === "library";

  if (isLibrary) {
    return {
      plugins: [react()],
      build: {
        outDir: "dist",
        emptyOutDir: true,
        // Keep git-pinned installs small and pre-commit-friendly (no multi-MB maps).
        sourcemap: false,
        lib: {
          entry: path.resolve(__dirname, "src/index.ts"),
          formats: ["es", "cjs"],
          fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
        },
        rollupOptions: {
          // Don't bundle deps into the UI library. This keeps the git-pinned
          // package small and avoids pre-commit rejecting large artifacts.
          external: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "@xyflow/react",
            "dagre",
            "react-markdown",
            "remark-gfm",
          ],
          output: {
            exports: "named",
          },
        },
      },
      test: {
        environment: "jsdom",
      },
    };
  }

  return {
    plugins: [react()],
    build: {
      outDir: "dist-static",
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: "app.js",
          chunkFileNames: "app.js",
          assetFileNames: "app.[ext]",
          inlineDynamicImports: true,
          manualChunks: undefined,
        },
      },
    },
    test: {
      environment: "jsdom",
    },
  };
});
