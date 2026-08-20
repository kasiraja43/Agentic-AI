import fs from "fs/promises";
import path from "path";

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

import { ProjectPaths } from "../../utils/ProjectPaths";

export class CoverageAgent {

    constructor(
        private readonly model: ChatOllama
    ) {}


    // ==========================================
    // Generate Coverage
    // ==========================================

    public async generateCoverage(
        testCaseFile: string,
        frameworkPlanFile: string,
        generatedTestsFolder: string
    ): Promise<string> {

        console.log("\n=======================================");
        console.log("      PLAYWRIGHT COVERAGE AGENT");
        console.log("=======================================\n");


        // ==========================================
        // Load Test Cases
        // ==========================================

        console.log("Loading Test Cases...");

        const testCases =
            await fs.readFile(
                testCaseFile,
                "utf8"
            );

        console.log("✓ Test Cases Loaded");


        // ==========================================
        // Load Framework Plan
        // ==========================================

        console.log(
            "Loading Framework Plan..."
        );

        const frameworkPlan =
            await fs.readFile(
                frameworkPlanFile,
                "utf8"
            );

        console.log(
            "✓ Framework Plan Loaded"
        );


        // ==========================================
        // Validate Generated Tests Folder
        // ==========================================

        console.log(
            "Loading Generated Test Scripts..."
        );

        try {

            await fs.access(
                generatedTestsFolder
            );

        } catch {

            throw new Error(
                `Generated tests folder not found:\n${generatedTestsFolder}`
            );

        }


        // ==========================================
        // Read Generated Tests
        // ==========================================

        const generatedTests =
            await this.readAllTests(
                generatedTestsFolder
            );

        if (
            !generatedTests.trim()
        ) {

            throw new Error(
                "No generated Playwright test files found."
            );

        }

        console.log(
            "✓ Generated Tests Loaded"
        );


        // ==========================================
        // Load Coverage Prompt
        // ==========================================

        console.log(
            "Loading Coverage Prompt..."
        );

        const promptPath =
            path.join(
                ProjectPaths.root,
                "agents",
                "coverage",
                "prompt.md"
            );


        try {

            await fs.access(
                promptPath
            );

        } catch {

            throw new Error(
                `Coverage prompt not found:\n${promptPath}`
            );

        }


        let prompt =
            await fs.readFile(
                promptPath,
                "utf8"
            );


        if (
            !prompt.trim()
        ) {

            throw new Error(
                "Coverage prompt is empty."
            );

        }

        console.log(
            "✓ Prompt Loaded"
        );


        // ==========================================
        // Replace Placeholders
        // ==========================================

        prompt =
            prompt
                .replace(
                    "{{TEST_CASES}}",
                    testCases
                )
                .replace(
                    "{{FRAMEWORK_PLAN}}",
                    frameworkPlan
                )
                .replace(
                    "{{GENERATED_TESTS}}",
                    generatedTests
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

        let response;

        try {

            response =
                await this.model.invoke([
                    new HumanMessage(prompt)
                ]);

        } catch (error) {

            console.error(
                "\n❌ Coverage Agent Ollama request failed."
            );

            console.error(error);

            throw error;
        }


        // ==========================================
        // Extract Response
        // ==========================================

        const content =
            this.extractResponseContent(
                response.content
            );


        console.log(
            "✓ Coverage Report Generated\n"
        );


        console.log(
            "========== COVERAGE RAW RESPONSE ==========\n"
        );

        console.log(
            content
        );

        console.log(
            "\n===========================================\n"
        );


        return content;
    }


    // ==========================================
    // Extract Response Content
    // ==========================================

    private extractResponseContent(
        content: unknown
    ): string {

        // ==========================================
        // Normal String
        // ==========================================

        if (
            typeof content === "string"
        ) {

            return content.trim();
        }


        // ==========================================
        // Structured LangChain Content
        // ==========================================

        if (
            Array.isArray(content)
        ) {

            return content
                .map(
                    item => {

                        if (
                            typeof item === "string"
                        ) {

                            return item;
                        }


                        if (
                            item &&
                            typeof item === "object" &&
                            "text" in item
                        ) {

                            const text =
                                (
                                    item as {
                                        text?: unknown
                                    }
                                ).text;


                            return typeof text === "string"
                                ? text
                                : "";
                        }


                        return "";

                    }
                )
                .join("")
                .trim();
        }


        // ==========================================
        // Fallback
        // ==========================================

        return String(
            content
        ).trim();
    }


    // ==========================================
    // Read Generated Tests
    // ==========================================

    private async readAllTests(
        folder: string
    ): Promise<string> {

        const files =
            await fs.readdir(
                folder,
                {
                    withFileTypes: true
                }
            );


        let content = "";


        for (
            const file of files
        ) {

            // ==========================================
            // Ignore directories
            // ==========================================

            if (
                !file.isFile()
            ) {

                continue;
            }


            // ==========================================
            // Only Playwright Tests
            // ==========================================

            if (
                !file.name.endsWith(
                    ".spec.ts"
                )
            ) {

                continue;
            }


            const filePath =
                path.join(
                    folder,
                    file.name
                );


            const fileContent =
                await fs.readFile(
                    filePath,
                    "utf8"
                );


            content +=
                `\n===== FILE: ${file.name} =====\n`;


            content +=
                fileContent;


            content +=
                "\n";
        }


        return content;
    }
}