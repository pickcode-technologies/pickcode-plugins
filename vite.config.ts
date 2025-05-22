import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import ts from "typescript";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
    build: {
        outDir: "dist/site",
    },
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
        tailwindcss(),
        viteStaticCopy({
            targets: [
                {
                    src: "src/plugins/**/languages/**/*.*",
                    dest: "plugins-code",

                    rename: (
                        fileName: string,
                        extension: string,
                        fullPath: string
                    ) => {
                        const root = path.resolve(
                            process.cwd(),
                            "src",
                            "plugins"
                        );
                        let rel = path.relative(root, fullPath);
                        rel = rel.split(path.sep).join(path.posix.sep);
                        if (
                            rel.endsWith("/languages/BasicJS/implementation.ts")
                        ) {
                            // because we're compiling this .ts to .js
                            rel = rel.replace(/\.ts$/, ".js");
                        }
                        return rel;
                    },
                    transform: {
                        handler: (content, filePath) => {
                            if (
                                filePath.endsWith(
                                    "/languages/BasicJS/implementation.ts"
                                )
                            ) {
                                return ts.transpileModule(content.toString(), {
                                    compilerOptions: {
                                        module: ts.ModuleKind.ESNext,
                                        target: ts.ScriptTarget.ES2020,
                                    },
                                }).outputText;
                            }
                            return content;
                        },
                        encoding: "utf-8",
                    },
                },
                {
                    src: [
                        "src/plugins/*/languages/**/*",
                        "!src/plugins/*/languages/*/implementation.ts",
                    ],
                    dest: "plugins-code",
                },
            ],
        }),
    ],
});
