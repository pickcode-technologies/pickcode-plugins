import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "dist/component",
        lib: {
            entry: "src/Component.tsx",
            name: "component",
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            // Mark React (and react-dom) as external so they're not bundled in the plugin.
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
    },
});
