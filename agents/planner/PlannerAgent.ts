import fs from "fs/promises";
import path from "path";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

export class PlannerAgent {

    constructor(
        private readonly model: ChatOllama
    ) {}

    public async createPlan(
        testCaseFile: string
    ): Promise<string> {

        console.log("\n=====================================");
        console.log("      PLAYWRIGHT PLANNER AGENT");
        console.log("=====================================\n");

        // Load Test Cases

        console.log("Loading Test Cases...");

        const testCases = await fs.readFile(
            testCaseFile,
            "utf8"
        );

        console.log("✓ Test Cases Loaded");

        // Load Prompt

        console.log("Loading Planner Prompt...");

        const promptPath = path.join(
            process.cwd(),
            "agents",
            "planner",
            "prompt.md"
        );

        let prompt = await fs.readFile(
            promptPath,
            "utf8"
        );

        console.log("✓ Prompt Loaded");

        // Replace Placeholder

        prompt = prompt.replace(
            "{{TEST_CASES}}",
            testCases
        );

        console.log("\nSending Request To Ollama...\n");

        const response = await this.model.invoke([
            new HumanMessage(prompt)
        ]);

        console.log("✓ Planner Response Received\n");

        return response.content.toString();
    }

}