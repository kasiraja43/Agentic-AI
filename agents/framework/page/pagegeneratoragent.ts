import fs from "fs/promises";
import path from "path";

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

export class PageGeneratorAgent {

    constructor(
        private readonly model: ChatOllama
    ) {}

    public async generatePages(
        frameworkPlanFile: string
    ): Promise<string> {

        console.log("\n=====================================");
        console.log("     PLAYWRIGHT PAGE GENERATOR");
        console.log("=====================================\n");

        // Load Framework Plan
        console.log("Loading Framework Plan...");

        const frameworkPlan = await fs.readFile(
            frameworkPlanFile,
            "utf8"
        );

        console.log("✓ Framework Plan Loaded");

        // Load Prompt
        console.log("Loading Page Generator Prompt...");

        const promptPath = path.join(
            process.cwd(),
            "agents",
            "framework",
            "page",
            "prompt.md"
        );

        let prompt = await fs.readFile(
            promptPath,
            "utf8"
        );

        console.log("✓ Prompt Loaded");

        // Inject Framework Plan
        prompt = prompt.replace(
            "{{FRAMEWORK_PLAN}}",
            frameworkPlan
        );

        console.log("\nSending Request To Ollama...\n");

        const response = await this.model.invoke([
            new HumanMessage(prompt)
        ]);

        console.log("✓ Page Objects Generated");

        return response.content.toString();
    }
}