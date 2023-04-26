import { defineConfig } from "vite";
import path from "path";
import copy from "rollup-plugin-copy";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "index.html",
      formats: ["es"],
    },
    rollupOptions: {
      // external: /^lit/,
      plugins: [
        // Copy Shoelace assets to dist/shoelace
        copy({
          copyOnce: true,
          targets: [
            {
              src: path.resolve(
                __dirname,
                "node_modules/@shoelace-style/shoelace/dist/assets"
              ),
              dest: path.resolve(__dirname, "dist/shoelace"),
            },
          ],
        }),
      ],
    },
  },
});
