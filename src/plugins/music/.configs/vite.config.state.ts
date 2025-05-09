import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    [
                        "@babel/plugin-proposal-decorators",
                        {
                            version: "2023-05",
                        },
                    ],
                ],
            },
        }),
    ],
    build: {
        outDir: "dist/state",
        lib: {
            entry: "src/state.ts",
            name: "state",
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
    define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
});
