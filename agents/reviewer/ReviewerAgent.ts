import fs from "fs/promises";
import path from "path";

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

import { ProjectPaths } from "../../utils/ProjectPaths";

export class ReviewerAgent {

    constructor(
        private readonly model: ChatOllama
    ) {}


    public async reviewFramework(
        frameworkFolder: string,
        testFolder: string,
        coverageFile: string
    ): Promise<string> {

        console.log("\n=======================================");
        console.log("       PLAYWRIGHT REVIEWER AGENT");
        console.log("=======================================\n");


        // ==========================================
        // Validate Framework
        // ==========================================

        console.log("Loading Framework...");

        await this.validateFolder(
            frameworkFolder,
            "Framework"
        );

        const framework =
            await this.readFiles(
                frameworkFolder
            );

        console.log("✓ Framework Loaded");


        // ==========================================
        // Validate Tests
        // ==========================================

        console.log(
            "Loading Test Scripts..."
        );

        await this.validateFolder(
            testFolder,
            "Generated Tests"
        );

        const tests =
            await this.readTestFiles(
                testFolder
            );

        if (!tests.trim()) {
            throw new Error(
                "No generated Playwright test files found."
            );
        }

        console.log(
            "✓ Test Scripts Loaded"
        );


        // ==========================================
        // Load Coverage Report
        // ==========================================

        console.log(
            "Loading Coverage Report..."
        );

        const coverage =
            await fs.readFile(
                coverageFile,
                "utf8"
            );

        console.log(
            "✓ Coverage Report Loaded"
        );


        // ==========================================
        // Load Reviewer Prompt
        // ==========================================

        console.log(
            "Loading Reviewer Prompt..."
        );

        const promptPath =
            path.join(
                ProjectPaths.root,
                "agents",
                "reviewer",
                "prompt.md"
            );

        let prompt =
            await fs.readFile(
                promptPath,
                "utf8"
            );

        console.log(
            "✓ Prompt Loaded"
        );


        // ==========================================
        // Replace Prompt Placeholders
        // ==========================================

        prompt =
            prompt
                .replace(
                    "{{FRAMEWORK}}",
                    framework
                )
                .replace(
                    "{{TESTS}}",
                    tests
                )
                .replace(
                    "{{COVERAGE}}",
                    coverage
                );


        console.log(
            `\nPrompt Size : ${prompt.length}`
        );

        console.log(
            "\nSending Request To Ollama...\n"
        );


        // ==========================================
        // Call Ollama
        // ==========================================

        const response =
            await this.model.invoke([
                new HumanMessage(prompt)
            ]);


        console.log(
            "✓ Review Completed\n"
        );


        return response.content.toString();
    }


    // ==========================================
    // Validate Folder
    // ==========================================

    private async validateFolder(
        folder: string,
        name: string
    ): Promise<void> {

        try {

            await fs.access(folder);

        } catch {

            throw new Error(
                `${name} folder not found:\n${folder}`
            );
        }
    }


    // ==========================================
    // Read Framework Files
    // ==========================================

    private async readFiles(
        folder: string
    ): Promise<string> {

        return await this.scanFolder(
            folder
        );
    }


    private async scanFolder(
        folder: string
    ): Promise<string> {

        let content = "";

        const entries =
            await fs.readdir(
                folder,
                {
                    withFileTypes: true
                }
            );


        for (const entry of entries) {

            const fullPath =
                path.join(
                    folder,
                    entry.name
                );


            if (entry.isDirectory()) {

                content +=
                    await this.scanFolder(
                        fullPath
                    );

                continue;
            }


            const fileContent =
                await fs.readFile(
                    fullPath,
                    "utf8"
                );


            const relativePath =
                path.relative(
                    ProjectPaths.root,
                    fullPath
                );


            content +=
                `\n===== FILE: ${relativePath}\n`;

            content += fileContent;

            content += "\n";
        }


        return content;
    }


    // ==========================================
    // Read Only Playwright Tests
    // ==========================================

    private async readTestFiles(
        folder: string
    ): Promise<string> {

        let content = "";

        const entries =
            await fs.readdir(
                folder,
                {
                    withFileTypes: true
                }
            );


        for (const entry of entries) {

            if (!entry.isFile()) {
                continue;
            }


            if (
                !entry.name.endsWith(
                    ".spec.ts"
                )
            ) {
                continue;
            }


            const fullPath =
                path.join(
                    folder,
                    entry.name
                );


            const fileContent =
                await fs.readFile(
                    fullPath,
                    "utf8"
                );


            const relativePath =
                path.relative(
                    ProjectPaths.root,
                    fullPath
                );


            content +=
                `\n===== FILE: ${relativePath}\n`;

            content += fileContent;

            content += "\n";
        }


        return content;
    }
}