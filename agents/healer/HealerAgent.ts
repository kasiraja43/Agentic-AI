import fs from "fs/promises";
import path from "path";

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

import { ProjectPaths } from "../../utils/ProjectPaths";

export class HealerAgent {

    constructor(
        private readonly model: ChatOllama
    ) {}


    // ==========================================
    // Main Healing Method
    // ==========================================

    public async heal(
        executionFile: string,
        failedTestFile: string,
        pageObjectFile: string
    ): Promise<string> {

        console.log("\n=======================================");
        console.log("        PLAYWRIGHT HEALER AGENT");
        console.log("=======================================\n");


        // ==========================================
        // Validate Files
        // ==========================================

        await this.validateFile(
            executionFile,
            "Execution report"
        );

        await this.validateFile(
            failedTestFile,
            "Failed test"
        );

        await this.validateFile(
            pageObjectFile,
            "Page Object"
        );


        // ==========================================
        // Load Execution Report
        // ==========================================

        console.log(
            "Loading execution report..."
        );

        const executionRaw =
            await fs.readFile(
                executionFile,
                "utf8"
            );

        console.log(
            "✓ Execution Report Loaded"
        );


        // ==========================================
        // Extract Only Useful Failure Information
        // ==========================================

        const execution =
            this.extractFailureInformation(
                executionRaw
            );


        console.log(
            "✓ Failure Information Extracted"
        );


        // ==========================================
        // Load Failed Test
        // ==========================================

        console.log(
            "Loading Failed Test..."
        );

        const failedTest =
            await fs.readFile(
                failedTestFile,
                "utf8"
            );

        console.log(
            "✓ Failed Test Loaded"
        );


        // ==========================================
        // Load Page Object
        // ==========================================

        console.log(
            "Loading Page Object..."
        );

        const pageObject =
            await fs.readFile(
                pageObjectFile,
                "utf8"
            );

        console.log(
            "✓ Page Object Loaded"
        );


        // ==========================================
        // Load Healer Prompt
        // ==========================================

        console.log(
            "Loading Healer Prompt..."
        );

        const promptPath =
            path.join(
                ProjectPaths.root,
                "agents",
                "healer",
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
        // Replace Placeholders
        // ==========================================

        prompt =
            prompt
                .replace(
                    "{{EXECUTION}}",
                    execution
                )
                .replace(
                    "{{FAILED_TEST}}",
                    failedTest
                )
                .replace(
                    "{{PAGE_OBJECT}}",
                    pageObject
                );


        // ==========================================
        // Add Strong JSON Instructions
        // ==========================================

        prompt += `

IMPORTANT OUTPUT RULES:

You are a Playwright test healing agent.

Analyze the failure and identify the most likely root cause.

Return ONLY valid JSON.

Do NOT return:
- Markdown
- Code fences
- Explanations outside JSON
- "Here is the JSON"
- Empty suggestions

Use exactly this structure:

{
  "success": true,
  "suggestions": [
    {
      "file": "failed test file name",
      "problem": "description of the failure",
      "oldCode": "existing problematic code",
      "newCode": "corrected code",
      "reason": "why this correction should fix the failure"
    }
  ],
  "summary": "short summary of the healing action"
}

If the failure cannot be confidently healed, return:

{
  "success": false,
  "suggestions": [],
  "summary": "Unable to determine a safe automatic healing."
}

Do not invent application behavior.

Prefer corrections based on:
1. The actual Playwright error
2. The failed test
3. The Page Object
4. Existing locators and methods
5. Existing framework conventions

The response MUST be valid JSON.
`;


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
                    new HumanMessage(
                        prompt
                    )
                ]);

        } catch (error) {

            console.error(
                "\n❌ Ollama Healing Request Failed"
            );

            console.error(
                error
            );


            return JSON.stringify({

                success: false,

                suggestions: [],

                summary:
                    "Ollama healing request failed."

            });
        }


        // ==========================================
        // Get Raw Response
        // ==========================================

        const rawResponse =
            response.content
                ?.toString()
                ?.trim() ?? "";


        console.log(
            "\n========== HEALER RAW RESPONSE ==========\n"
        );

        console.log(
            rawResponse
        );

        console.log(
            "\n==========================================\n"
        );


        // ==========================================
        // Empty Response Protection
        // ==========================================

        if (
            !rawResponse
        ) {

            console.warn(
                "⚠️ Ollama returned an empty healing response."
            );


            return JSON.stringify({

                success: false,

                suggestions: [],

                summary:
                    "Ollama returned an empty response."

            });
        }


        // ==========================================
        // Clean JSON Response
        // ==========================================

        const cleanedResponse =
            this.cleanJsonResponse(
                rawResponse
            );


        // ==========================================
        // Validate JSON
        // ==========================================

        try {

            const parsed =
                JSON.parse(
                    cleanedResponse
                );


            // ==========================================
            // Validate Suggestions
            // ==========================================

            if (
                !Array.isArray(
                    parsed.suggestions
                )
            ) {

                parsed.suggestions = [];
            }


            if (
                typeof parsed.summary !== "string"
            ) {

                parsed.summary =
                    "Healing analysis completed.";
            }


            if (
                typeof parsed.success !== "boolean"
            ) {

                parsed.success =
                    parsed.suggestions.length > 0;
            }


            console.log(
                "\n✓ Healing Suggestion Generated"
            );


            console.log(
                `Suggestions: ${parsed.suggestions.length}`
            );


            return JSON.stringify(
                parsed
            );


        } catch {

            console.warn(
                "\n⚠️ Ollama returned invalid JSON."
            );


            console.warn(
                "Creating safe fallback healing report."
            );


            return JSON.stringify({

                success: false,

                suggestions: [],

                summary:
                    "Ollama returned a response that could not be parsed as JSON."

            });
        }
    }


    // ==========================================
    // Extract Failure Information
    // ==========================================

    private extractFailureInformation(
        rawExecution: string
    ): string {

        try {

            const data =
                JSON.parse(
                    rawExecution
                );


            const failures: any[] = [];


            // ==========================================
            // Existing Failed Tests
            // ==========================================

            if (
                Array.isArray(
                    data.failedTests
                )
            ) {

                failures.push(
                    ...data.failedTests
                );
            }


            // ==========================================
            // Playwright Errors
            // ==========================================

            if (
                Array.isArray(
                    data.errors
                )
            ) {

                failures.push(
                    ...data.errors
                );
            }


            // ==========================================
            // Extract Suites
            // ==========================================

            this.extractSuiteFailures(
                data.suites,
                failures
            );


            // ==========================================
            // Return Compact JSON
            // ==========================================

            if (
                failures.length > 0
            ) {

                return JSON.stringify(
                    {
                        success:
                            data.success,

                        exitCode:
                            data.exitCode,

                        totalTests:
                            data.totalTests,

                        failures
                    },
                    null,
                    2
                );
            }


            return JSON.stringify(
                {
                    success:
                        data.success,

                    exitCode:
                        data.exitCode,

                    totalTests:
                        data.totalTests,

                    error:
                        data.error ??
                        "No detailed failure information found."
                },
                null,
                2
            );


        } catch {

            // ==========================================
            // Fallback
            // ==========================================

            return rawExecution.substring(
                0,
                15000
            );
        }
    }


    // ==========================================
    // Extract Suite Failures
    // ==========================================

    private extractSuiteFailures(
        suites: any,
        failures: any[]
    ): void {

        if (
            !Array.isArray(
                suites
            )
        ) {

            return;
        }


        for (
            const suite of suites
        ) {

            // ==========================================
            // Specs
            // ==========================================

            if (
                Array.isArray(
                    suite.specs
                )
            ) {

                for (
                    const spec of suite.specs
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

                        if (
                            !Array.isArray(
                                test.results
                            )
                        ) {

                            continue;
                        }


                        const failedResults =
                            test.results.filter(
                                (result: any) =>
                                    result?.status === "failed" ||
                                    result?.status === "timedOut"
                            );


                        if (
                            failedResults.length > 0
                        ) {

                            failures.push({

                                file:
                                    spec.file,

                                title:
                                    test.title,

                                results:
                                    failedResults

                            });
                        }
                    }
                }
            }


            // ==========================================
            // Nested Suites
            // ==========================================

            this.extractSuiteFailures(
                suite.suites,
                failures
            );
        }
    }


    // ==========================================
    // Clean JSON Response
    // ==========================================

    private cleanJsonResponse(
        response: string
    ): string {

        let cleaned =
            response.trim();


        // ==========================================
        // Remove Markdown Fence
        // ==========================================

        cleaned =
            cleaned
                .replace(
                    /^```json\s*/i,
                    ""
                )
                .replace(
                    /^```\s*/i,
                    ""
                )
                .replace(
                    /\s*```$/i,
                    ""
                )
                .trim();


        // ==========================================
        // Extract JSON Object
        // ==========================================

        const start =
            cleaned.indexOf(
                "{"
            );


        const end =
            cleaned.lastIndexOf(
                "}"
            );


        if (
            start !== -1 &&
            end !== -1 &&
            end > start
        ) {

            cleaned =
                cleaned.substring(
                    start,
                    end + 1
                );
        }


        return cleaned.trim();
    }


    // ==========================================
    // Validate File
    // ==========================================

    private async validateFile(
        filePath: string,
        name: string
    ): Promise<void> {

        try {

            await fs.access(
                filePath
            );

        } catch {

            throw new Error(
                `${name} not found:\n${filePath}`
            );
        }
    }
}