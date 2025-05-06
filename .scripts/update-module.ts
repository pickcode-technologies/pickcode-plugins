#!/usr/bin/env ts-node

import axios, { AxiosError } from "axios";
import fs from "fs";
import path from "path";
import readline from "readline";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface UrlsConfig {
    local: string;
    dev: string;
    prod: string;
}

interface KeysConfig {
    [organization: string]: {
        [env: string]: string;
    };
}

interface ModuleConfig {
    org: string;
    environments: {
        [env: string]: { moduleId: string };
    };
}

interface ApiData {
    name: string;
    componentJsImplementation: string;
    stateJsImplementation: string;
    specByLanguage: {
        BasicJS: {
            starterCode: {
                filename: string;
                type: string;
                open: boolean;
                contents: string;
            };
            implementation: {
                filename: string;
                type: string;
                open: boolean;
                contents: string;
            };
        };
    };
}

const readStringFile = (filePath: string) => {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
};

const readJsonFile = <T>(filePath: string): T | undefined => {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
        return undefined;
    }
};

const writeJsonFile = <T>(filePath: string, data: T): void => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        throw new Error(`Error writing to ${filePath}:`, { cause: err });
    }
};

const promptUser = (question: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

async function getKeyForOrg(orgName: string, env: string) {
    const keysPath = path.resolve(__dirname, "../.config/keys.json");
    let keys = readJsonFile<KeysConfig>(keysPath) || {};

    const config = keys[orgName] || {};

    let apiKey = config[env];
    if (!apiKey) {
        apiKey = await promptUser(
            `There is no API key saved for organization ${orgName} in the ${env} environment.\nPlease enter your API key: `
        );
        config[env] = apiKey;
        keys[orgName] = config;
        writeJsonFile(keysPath, keys);
    }
    return apiKey;
}

const encodeBasicAuth = (orgId: string, apiKey: string): string => {
    return Buffer.from(`${orgId}:${apiKey}`).toString("base64");
};

// TODO: figure out module name.... maybe from the config in the working dir, or
// from package json
const main = async (env: string, branch: string) => {
    if (branch === "main") {
        const confirm = await promptUser(
            `Warning: You are using the 'main' branch. Are you sure you want to continue? (y/n): `
        );
        if (confirm.toLowerCase() !== "y") {
            console.log("Aborting.");
            return;
        }
    }

    const urls = readJsonFile<UrlsConfig>(
        path.resolve(__dirname, "../.config/urls.json")
    );
    if (!urls) {
        console.error("Urls config not found");
        process.exit(1);
    }
    const baseUrl = urls[env as keyof typeof urls];
    if (!baseUrl) {
        console.error(`No base URL found for environment: ${env}`);
        process.exit(1);
    }

    const moduleConfigPath = path.resolve(
        process.cwd(),
        ".configs/module.config.json"
    );
    let moduleConfig = readJsonFile<ModuleConfig>(moduleConfigPath);

    const componentJsImplementation = readStringFile(
        path.resolve(process.cwd(), "dist/component/index.js")
    );
    if (!componentJsImplementation) {
        throw new Error(
            `Component file is empty; you may have forgotten to build the code.`
        );
    }
    const stateJsImplementation = readStringFile(
        path.resolve(process.cwd(), "dist/state/index.js")
    );
    if (!stateJsImplementation) {
        throw new Error(
            `State file is empty; you may have forgotten to build the code.`
        );
    }
    const basicJsImplementation = readStringFile(
        path.resolve(process.cwd(), "dist/implementation/index.js")
    );
    if (!basicJsImplementation) {
        throw new Error(
            `JS implementation file is empty; you may have forgotten to build the code.`
        );
    }

    const data: ApiData = {
        name: path.basename(process.cwd()),
        componentJsImplementation,
        stateJsImplementation,
        specByLanguage: {
            BasicJS: {
                // TODO: maybe we can read this from a starter-code directory
                // but we need the filetype conversions, and assets won't work well
                starterCode: {
                    filename: "index.js",
                    type: "Javascript",
                    open: false,
                    contents: "chat.send('hello, world!');",
                },
                implementation: {
                    filename: "index.js",
                    type: "Javascript",
                    open: false,
                    contents: basicJsImplementation,
                },
            },
        },
    };

    const moduleId = moduleConfig?.environments[env]?.moduleId;
    if (!moduleId) {
        const response = await promptUser(
            `There is no ID saved for this module in the ${env} environment. Would you like to create a new module? (y/n) `
        );
        if (response.toLowerCase() !== "y") {
            console.log("Aborting");
            return;
        }
        const orgId = await promptUser(
            `Please enter the ID of the organization creating this module: `
        );
        const apiKey = await getKeyForOrg(orgId, env);
        try {
            const createResponse = await axios.post(
                `${baseUrl}/modules/${branch}`,
                data,
                {
                    headers: {
                        Authorization: `Basic ${encodeBasicAuth(
                            orgId,
                            apiKey
                        )}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const newModuleId = createResponse.data.id;
            writeJsonFile(moduleConfigPath, {
                ...moduleConfig,
                org: orgId,
                environments: {
                    ...moduleConfig?.environments,
                    [env]: { moduleId: newModuleId },
                },
            });
            console.log(`Module created with id ${newModuleId}`);
        } catch (e) {
            if (e instanceof AxiosError) {
                throw new Error(
                    `Failed to create module: ${
                        e.response?.statusText || e.status
                    }`
                );
            }
            throw e;
        }
    } else {
        const orgId = moduleConfig.org;
        const apiKey = await getKeyForOrg(orgId, env);
        try {
            await axios.patch(
                `${baseUrl}/modules/${branch}/${moduleId}`,
                data,
                {
                    headers: {
                        Authorization: `Basic ${encodeBasicAuth(
                            orgId,
                            apiKey
                        )}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Module updated");
        } catch (e) {
            if (e instanceof AxiosError) {
                throw new Error(
                    `Failed to patch module: ${
                        e.response?.statusText || e.status
                    }`
                );
            }
            throw e;
        }
    }
};

const argv = yargs(hideBin(process.argv)).options({
    branch: { type: "string", default: "main", describe: "Branch name" },
}).argv;

const env = process.argv[2] as "local" | "dev" | "prod";
if (!["local", "dev", "prod"].includes(env)) {
    console.error('Invalid environment. Please use "local", "dev", or "prod".');
    process.exit(1);
}

async function execute() {
    const args = await argv;
    await main(env, args.branch).catch((e) => {
        console.error(e);
    });
}

void execute();
