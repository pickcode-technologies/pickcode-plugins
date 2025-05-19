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
    environments: Partial<{
        [env: string]: { owner: string };
    }>;
}

interface ApiData {
    name: string;
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
    const keysPath = path.resolve(process.cwd(), ".config/keys.json");
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

const main = async (pluginName: string, env: string) => {
    const urls = readJsonFile<UrlsConfig>(
        path.resolve(process.cwd(), ".config/urls.json")
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

    const basicJsImplementation = readStringFile(
        path.resolve(
            process.cwd(),
            `dist/implementations/plugins/${pluginName}/implementation.js`
        )
    );
    if (!basicJsImplementation) {
        throw new Error(
            `JS implementation file is empty; you may have forgotten to build the code.`
        );
    }

    let moduleNotYetCreated = false;
    const moduleConfigPath = `src/plugins/${pluginName}/.config.json`;
    const moduleConfig = readJsonFile<ModuleConfig>(
        path.resolve(process.cwd(), moduleConfigPath)
    );
    let orgName: string | undefined = undefined;
    if (moduleConfig) {
        orgName = moduleConfig[env]?.owner;
    }
    if (!orgName) {
        orgName = await promptUser(
            "No owner organization is stored for this module in this environment yet. Please enter the organization ID to create this module under: "
        );
        moduleNotYetCreated = true;
        writeJsonFile(moduleConfigPath, {
            ...moduleConfig,
            environments: {
                ...moduleConfig?.environments,
                [env]: {
                    ...moduleConfig?.environments?.[env],
                    owner: orgName,
                },
            },
        });
    }

    const data: ApiData = {
        name: pluginName,
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

    const apiKey = await getKeyForOrg(orgName, env);
    try {
        await axios.patch(`${baseUrl}/plugins/main/${pluginName}`, data, {
            headers: {
                Authorization: `Basic ${encodeBasicAuth(orgName, apiKey)}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`Module ${moduleNotYetCreated ? "created" : "updated"}`);
    } catch (e) {
        if (e instanceof AxiosError) {
            throw new Error(
                `Failed to ${
                    moduleNotYetCreated ? "create" : "update"
                } module: ${e.response?.statusText || e.status}`
            );
        }
        throw e;
    }
};

const argv = yargs(hideBin(process.argv))
    .demandCommand(2, 2, "plugin name and environment must be provided")
    .parseSync();

const pluginName = argv._[0]?.toString();
if (!pluginName) {
    console.error("Usage: update-plugin <pluginName> <environment>");
    process.exit(1);
}
if (["local", "dev", "prod"].includes(pluginName)) {
    console.warn(
        `Got a plugin name of ${pluginName} -- the plugin name should go before the environment`
    );
    process.exit(1);
}

const env = argv._[1]?.toString();
if (!env) {
    console.error("Usage: update-plugin <pluginName> <environment>");
    process.exit(1);
}
if (!["local", "dev", "prod"].includes(env)) {
    console.error('Invalid environment. Please use "local", "dev", or "prod".');
    process.exit(1);
}

async function execute() {
    await main(pluginName, env).catch((e) => {
        console.error(e);
    });
}

void execute();
