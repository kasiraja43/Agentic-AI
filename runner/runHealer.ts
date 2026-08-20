import fs from "fs/promises";
import path from "path";

import { ChatOllama } from "@langchain/ollama";

import { createOllamaModel } from "../utils/OllamaConfig";

import { HealerAgent } from "../agents/healer/HealerAgent";
import { HealerParser } from "../agents/healer/parser";

import { ProjectPaths } from "../utils/ProjectPaths";


// ==========================================
// Healer Runner
// ==========================================

export async function runHealer(
    model?: ChatOllama
): Promise<void> {

    console.log("\n=======================================");
    console.log("        PLAYWRIGHT HEALER AGENT");
    console.log("=======================================\n");


    // ==========================================
    // Execution Report
    // ==========================================

    const executionReport =
        ProjectPaths.execution;


    console.log(
        "Execution Report:"
    );

    console.log(
        executionReport
    );


    // ==========================================
    // Find Failed Test
    // ==========================================

    console.log(
        "\nFinding Failed Test..."
    );


    const failedTest =
        await findFailedTest(
            executionReport,
            ProjectPaths.tests
        );


    // ==========================================
    // No Failed Test
    // ==========================================

    if (!failedTest) {

        console.log(
            "\n✓ No failed test available for healing."
        );

        console.log(
            "✓ Healer skipped."
        );

        return;
    }


    console.log(
        "\n✓ Failed Test Found"
    );

    console.log(
        failedTest
    );


    // ==========================================
    // Find Page Object
    // ==========================================

    console.log(
        "\nFinding Page Object..."
    );


    const pageObject =
        await findPageObject(
            failedTest,
            ProjectPaths.framework
        );


    console.log(
        "✓ Page Object Found"
    );

    console.log(
        pageObject
    );


    // ==========================================
    // Initialize Ollama
    // ==========================================

    const ollamaModel =
        model ||
        createOllamaModel();


    // ==========================================
    // Create Healer Agent
    // ==========================================

    const healer =
        new HealerAgent(
            ollamaModel
        );


    // ==========================================
    // Generate Healing Suggestions
    // ==========================================

    console.log(
        "\nGenerating Healing Suggestions..."
    );


    const rawResponse =
        await healer.heal(

            executionReport,

            failedTest,

            pageObject

        );


    // ==========================================
    // Parse Healing Report
    // ==========================================

    const parser =
        new HealerParser();


    const report =
        parser.parse(
            rawResponse
        );


    // ==========================================
    // Ensure Output Directory
    // ==========================================

    await fs.mkdir(
        ProjectPaths.output,
        {
            recursive: true
        }
    );


    // ==========================================
    // Save Healing Report
    // ==========================================

    const healingReport =
        ProjectPaths.healingReport;


    await fs.writeFile(

        healingReport,

        JSON.stringify(
            report,
            null,
            2
        ),

        "utf8"

    );


    console.log(
        "\n✅ Healing Report Saved"
    );


    console.log(
        `Healing Report: ${healingReport}`
    );
}


// ==========================================
// Find Failed Test
// ==========================================

async function findFailedTest(
    executionFile: string,
    testsFolder: string
): Promise<string | null> {


    // ==========================================
    // Check Execution Report Exists
    // ==========================================

    try {

        await fs.access(
            executionFile
        );

    } catch {

        console.warn(
            "\n⚠️ Execution report not found."
        );

        console.warn(
            executionFile
        );

        return null;
    }


    // ==========================================
    // Read Execution Report
    // ==========================================

    const executionContent =
        await fs.readFile(
            executionFile,
            "utf8"
        );


    // ==========================================
    // Validate Empty Report
    // ==========================================

    if (
        !executionContent ||
        !executionContent.trim()
    ) {

        console.warn(
            "\n⚠️ Execution report is empty."
        );

        return null;
    }


    // ==========================================
    // Parse JSON Safely
    // ==========================================

    let execution: any;


    try {

        execution =
            JSON.parse(
                executionContent
            );

    } catch (error) {

        console.error(
            "\n❌ Execution report is NOT valid JSON."
        );

        console.error(
            "\nExecution Report Preview:"
        );

        console.error(
            executionContent.substring(
                0,
                3000
            )
        );

        console.error(
            "\nJSON Parse Error:"
        );

        console.error(
            error
        );

        console.warn(
            "\n⚠️ Healer cannot determine the failed test."
        );

        console.warn(
            "⚠️ Skipping Healer instead of crashing the pipeline."
        );

        return null;
    }


    // ==========================================
    // Validate JSON Object
    // ==========================================

    if (
        typeof execution !== "object" ||
        execution === null
    ) {

        console.warn(
            "\n⚠️ Execution report contains invalid JSON structure."
        );

        return null;
    }


    // ==========================================
    // Extract Test File From Playwright Report
    // ==========================================

    const testFile =
        findFailedTestFile(
            execution
        );


    // ==========================================
    // Failed Test File Found
    // ==========================================

    if (testFile) {

        const normalizedPath =
            testFile
                .replace(
                    /\\/g,
                    "/"
                );


        const fileName =
            path.basename(
                normalizedPath
            );


        const fullPath =
            path.join(
                testsFolder,
                fileName
            );


        // ==========================================
        // Check Direct Path
        // ==========================================

        try {

            await fs.access(
                fullPath
            );

            return fullPath;

        } catch {

            // Continue with recursive search
        }


        // ==========================================
        // Recursive Search
        // ==========================================

        const allSpecFiles =
            await findSpecFiles(
                testsFolder
            );


        const matchingFile =
            allSpecFiles.find(
                file =>
                    path.basename(file) === fileName
            );


        if (matchingFile) {

            return matchingFile;
        }
    }


    // ==========================================
    // Fallback: Search Generated Tests
    // ==========================================

    const files =
        await findSpecFiles(
            testsFolder
        );


    if (
        files.length === 0
    ) {

        console.warn(
            `\n⚠️ No Playwright test files found in:\n${testsFolder}`
        );

        return null;
    }


    // ==========================================
    // Return First Test
    // ==========================================

    console.warn(
        "\n⚠️ Failed test file could not be identified."
    );

    console.warn(
        "⚠️ Falling back to first generated test file."
    );


    return files[0];
}


// ==========================================
// Extract Failed Test File
// ==========================================

function findFailedTestFile(
    data: any
): string | null {


    if (!data) {

        return null;
    }


    // ==========================================
    // Playwright JSON Reporter Structure
    // ==========================================

    if (
        Array.isArray(
            data.suites
        )
    ) {

        for (
            const suite of data.suites
        ) {

            const result =
                findFailedTestFile(
                    suite
                );


            if (result) {

                return result;
            }
        }
    }


    // ==========================================
    // Playwright Spec Structure
    // ==========================================

    if (
        Array.isArray(
            data.specs
        )
    ) {

        for (
            const spec of data.specs
        ) {

            if (
                !Array.isArray(
                    spec.tests
                )
            ) {

                continue;
            }


            for (
                const test of spec.tests
            ) {

                const failed =
                    Array.isArray(
                        test.results
                    )
                    &&
                    test.results.some(
                        (result: any) =>
                            result.status === "failed" ||
                            result.status === "timedOut"
                    );


                if (
                    failed &&
                    spec.file
                ) {

                    return spec.file;
                }
            }
        }
    }


    // ==========================================
    // Alternative Playwright Structure
    // ==========================================

    if (
        Array.isArray(
            data.tests
        )
    ) {

        for (
            const test of data.tests
        ) {

            const failed =
                test.status === "failed" ||
                test.status === "timedOut" ||
                test.results?.some?.(
                    (result: any) =>
                        result.status === "failed" ||
                        result.status === "timedOut"
                );


            if (
                failed &&
                test.file
            ) {

                return test.file;
            }
        }
    }


    return null;
}


// ==========================================
// Find All Playwright Spec Files
// ==========================================

async function findSpecFiles(
    folder: string
): Promise<string[]> {

    const result: string[] = [];


    let entries;


    try {

        entries =
            await fs.readdir(
                folder,
                {
                    withFileTypes: true
                }
            );

    } catch {

        return result;
    }


    for (
        const entry of entries
    ) {

        const fullPath =
            path.join(
                folder,
                entry.name
            );


        // ==========================================
        // Directory
        // ==========================================

        if (
            entry.isDirectory()
        ) {

            const nestedFiles =
                await findSpecFiles(
                    fullPath
                );


            result.push(
                ...nestedFiles
            );


            continue;
        }


        // ==========================================
        // Playwright Spec
        // ==========================================

        if (
            entry.name.endsWith(
                ".spec.ts"
            )
        ) {

            result.push(
                fullPath
            );
        }
    }


    return result;
}


// ==========================================
// Find Page Object From Test
// ==========================================

async function findPageObject(
    testFile: string,
    frameworkFolder: string
): Promise<string> {

    const testContent =
        await fs.readFile(
            testFile,
            "utf8"
        );


    // ==========================================
    // Look for Page Object Imports
    // ==========================================

    const importMatches =
        [
            ...testContent.matchAll(
                /from\s+["']([^"']*framework\/pages\/[^"']+)["']/g
            )
        ];


    for (
        const match of importMatches
    ) {

        const importPath =
            match[1];


        const pageFileName =
            path.basename(
                importPath
            );


        if (
            !pageFileName.endsWith(
                ".ts"
            )
        ) {

            continue;
        }


        const pageName =
            pageFileName.replace(
                /\.ts$/,
                ""
            );


        const pageObject =
            await findFileByName(
                frameworkFolder,
                pageFileName
            );


        if (pageObject) {

            return pageObject;
        }


        // ==========================================
        // Try Page Object Name
        // ==========================================

        const alternativeName =
            `${pageName}.ts`;


        const alternative =
            await findFileByName(
                frameworkFolder,
                alternativeName
            );


        if (alternative) {

            return alternative;
        }
    }


    // ==========================================
    // Fallback: Search Pages Folder
    // ==========================================

    const pagesFolder =
        path.join(
            frameworkFolder,
            "pages"
        );


    try {

        await fs.access(
            pagesFolder
        );

    } catch {

        throw new Error(
            `Framework pages folder not found:\n${pagesFolder}`
        );
    }


    const pageFiles =
        await findSpecOrTsFiles(
            pagesFolder
        );


    if (
        pageFiles.length === 0
    ) {

        throw new Error(
            `No Page Object files found in:\n${pagesFolder}`
        );
    }


    // ==========================================
    // Prefer Non-BasePage
    // ==========================================

    const pageObject =
        pageFiles.find(
            file =>
                !path.basename(
                    file
                ).startsWith(
                    "BasePage"
                )
        );


    return pageObject ??
        pageFiles[0];
}


// ==========================================
// Find File By Name
// ==========================================

async function findFileByName(
    folder: string,
    fileName: string
): Promise<string | null> {

    let entries;


    try {

        entries =
            await fs.readdir(
                folder,
                {
                    withFileTypes: true
                }
            );

    } catch {

        return null;
    }


    for (
        const entry of entries
    ) {

        const fullPath =
            path.join(
                folder,
                entry.name
            );


        if (
            entry.isDirectory()
        ) {

            const result =
                await findFileByName(
                    fullPath,
                    fileName
                );


            if (result) {

                return result;
            }


            continue;
        }


        if (
            entry.name === fileName
        ) {

            return fullPath;
        }
    }


    return null;
}


// ==========================================
// Find TypeScript Files
// ==========================================

async function findSpecOrTsFiles(
    folder: string
): Promise<string[]> {

    const result: string[] = [];


    let entries;


    try {

        entries =
            await fs.readdir(
                folder,
                {
                    withFileTypes: true
                }
            );

    } catch {

        return result;
    }


    for (
        const entry of entries
    ) {

        const fullPath =
            path.join(
                folder,
                entry.name
            );


        if (
            entry.isDirectory()
        ) {

            const nested =
                await findSpecOrTsFiles(
                    fullPath
                );


            result.push(
                ...nested
            );


            continue;
        }


        if (
            entry.name.endsWith(
                ".ts"
            )
        ) {

            result.push(
                fullPath
            );
        }
    }


    return result;
}


// ==========================================
// Direct Runner
// ==========================================

