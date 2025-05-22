import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import chokidar from "chokidar";
import fs from "fs/promises";
import path from "path";
import ts from "typescript";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

type Manifest = {
    [pluginName: string]: {
        [language: string]: {
            implUrl: string;
            // TODO: compile starter code?
        };
    };
};

async function buildManifest() {
    const pluginsDir = path.resolve(__dirname, "src/plugins");
    const manifest: Manifest = {};

    for (const pluginName of await fs.readdir(pluginsDir)) {
        const pluginPath = path.join(pluginsDir, pluginName);
        const stat = await fs.stat(pluginPath);
        if (!stat.isDirectory()) continue;

        const languagesDir = path.join(pluginPath, "languages");
        manifest[pluginName] = {};

        for (const lang of await fs.readdir(languagesDir)) {
            const langPath = path.join(languagesDir, lang);
            if (!(await fs.stat(langPath)).isDirectory()) continue;

            manifest[pluginName][lang] = {
                implUrl: `/plugins-code/${pluginName}/languages/${lang}/implementation.js`,
            };
        }
    }

    return manifest;
}

function watchManifestVitePlugin() {
    return {
        name: "generate-plugins-manifest",
        async buildStart() {
            const manifest = await buildManifest();
            this.emitFile({
                type: "asset",
                fileName: "plugins-manifest.json",
                source: JSON.stringify(manifest, null, 2),
            });
        },
        configureServer(server) {
            const out = path.resolve(
                __dirname,
                "public",
                "plugins-manifest.json"
            );

            async function regenerate() {
                const manifest = await buildManifest();
                await fs.writeFile(out, JSON.stringify(manifest, null, 2));
            }

            regenerate();
            chokidar
                .watch(path.resolve(__dirname, "src", "plugins"), {
                    ignoreInitial: true,
                })
                .on("all", regenerate);
        },
    };
}

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
        watchManifestVitePlugin(),
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
