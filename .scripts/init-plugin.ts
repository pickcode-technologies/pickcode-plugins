#!/usr/bin/env ts-node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";

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

// Per npm package name rules
const isValidPackageName = (name: string): boolean => {
    const packageNamePattern = /^(?![0-9])[a-z0-9-_]+$/;
    return (
        packageNamePattern.test(name) && name.length >= 1 && name.length <= 214
    );
};

const copyDirectory = (source: string, destination: string) => {
    const cmd = `cp -r ${source} ${destination}`;
    try {
        execSync(cmd, { stdio: "inherit" });
    } catch (error) {
        console.error(`Error copying directory: ${error}`);
        process.exit(1);
    }
};

const initializePlugin = async () => {
    let pluginName = await promptUser("Enter the new plugin's name: ");
    while (!isValidPackageName(pluginName)) {
        console.log(`${pluginName} is not a valid name`);
        pluginName = await promptUser("Enter the new plugin's name: ");
    }

    const pluginDir = pluginName.trim().replace(/\W+/g, "-").toLowerCase();

    const newPluginDir = path.resolve(
        process.cwd(),
        `src/plugins/${pluginDir}`
    );
    if (fs.existsSync(newPluginDir)) {
        console.error(`A directory named "${pluginDir}" already exists.`);
        process.exit(1);
    }

    const templateDir = path.resolve(process.cwd(), "template");

    copyDirectory(templateDir, newPluginDir);

    console.log(
        `Plugin "${pluginName}" initialized successfully at "${newPluginDir}".`
    );
};

void initializePlugin().catch((e) => {
    console.error(e);
});
