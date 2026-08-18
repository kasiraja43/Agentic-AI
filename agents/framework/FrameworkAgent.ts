import fs from "fs/promises";
import path from "path";

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";


export class FrameworkAgent {

    constructor(
        private readonly model: ChatOllama
    ) {}


    // ==========================================
    // Generate Playwright Framework
    // ==========================================

    public async generateFramework(
        frameworkPlanFile: string
    ): Promise<string> {

        console.log(
            "\n====================================="
        );

        console.log(
            "     PLAYWRIGHT FRAMEWORK AGENT"
        );

        console.log(
            "=====================================\n"
        );


        // ==========================================
        // Framework Plan
        // ==========================================

        console.log(
            "Framework Plan:"
        );

        console.log(
            frameworkPlanFile
        );


        // ==========================================
        // Validate Framework Plan
        // ==========================================

        try {

            await fs.access(
                frameworkPlanFile
            );

        } catch {

            throw new Error(
                `Framework plan file not found:\n${frameworkPlanFile}`
            );
        }


        // ==========================================
        // Load Framework Plan
        // ==========================================

        console.log(
            "\nLoading Framework Plan..."
        );


        const frameworkPlan =
            await fs.readFile(
                frameworkPlanFile,
                "utf8"
            );


        if (
            !frameworkPlan.trim()
        ) {

            throw new Error(
                "Framework plan is empty."
            );
        }


        console.log(
            "✓ Framework Plan Loaded"
        );


        console.log(
            `Framework Plan Size: ${frameworkPlan.length} characters`
        );


        // ==========================================
        // Load Framework Prompt
        // ==========================================

        console.log(
            "\nLoading Framework Prompt..."
        );


        const promptPath =
            path.join(
                process.cwd(),
                "agents",
                "framework",
                "prompt.md"
            );


        try {

            await fs.access(
                promptPath
            );

        } catch {

            throw new Error(
                `Framework prompt not found:\n${promptPath}`
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
                "Framework prompt is empty."
            );
        }


        console.log(
            "✓ Prompt Loaded"
        );


        // ==========================================
        // Validate Placeholder
        // ==========================================

        if (
            !prompt.includes(
                "{{FRAMEWORK_PLAN}}"
            )
        ) {

            throw new Error(
                "Framework prompt does not contain {{FRAMEWORK_PLAN}} placeholder."
            );
        }


        // ==========================================
        // Replace Framework Plan
        // ==========================================

        prompt =
            prompt.replace(
                "{{FRAMEWORK_PLAN}}",
                frameworkPlan
            );


        // ==========================================
        // Prompt Information
        // ==========================================

        console.log(
            `\nPrompt Size: ${prompt.length} characters`
        );


        console.log(
            "\nSending Request To Ollama...\n"
        );


        console.log(
            "Calling Ollama..."
        );


        // ==========================================
        // Start Timer
        // ==========================================

        const start =
            Date.now();


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
                "\n❌ Ollama Framework Generation Failed"
            );

            console.error(
                error
            );

            throw error;
        }


        // ==========================================
        // End Timer
        // ==========================================

        const end =
            Date.now();


        const duration =
            (end - start) / 1000;


        console.log(
            `Ollama responded in ${duration.toFixed(2)} seconds`
        );


        // ==========================================
        // Extract Response
        // ==========================================

        const rawResponse =
            this.extractResponseContent(
                response.content
            );


        if (
            !rawResponse.trim()
        ) {

            throw new Error(
                "Ollama returned an empty framework response."
            );
        }


        // ==========================================
        // Response Information
        // ==========================================

        console.log(
            `Framework Response Size: ${rawResponse.length} characters`
        );


        console.log(
            "✓ Framework Generated\n"
        );


        // ==========================================
        // Response Preview
        // ==========================================

        console.log(
            "Framework Response Preview:"
        );


        console.log(
            rawResponse.substring(
                0,
                1000
            )
        );


        if (
            rawResponse.length > 1000
        ) {

            console.log(
                "\n... response preview truncated ..."
            );
        }


        console.log(
            ""
        );


        // ==========================================
        // Return Raw Response
        // ==========================================

        return rawResponse;
    }


    // ==========================================
    // Extract Ollama Response Content
    // ==========================================

    private extractResponseContent(
        content: unknown
    ): string {

        // ==========================================
        // String Response
        // ==========================================

        if (
            typeof content === "string"
        ) {

            return content.trim();
        }


        // ==========================================
        // Array Response
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
}