
import fs from "fs/promises";

import { ChatOllama } from "@langchain/ollama";

import { createOllamaModel } from "../utils/OllamaConfig";

import { Agent1FileFinder } from "../utils/Agent1FileFinder";
import { ProjectPaths } from "../utils/ProjectPaths";

import { PlannerAgent } from "../agents/planner/PlannerAgent";
import { PlannerParser } from "../agents/planner/PlannerParser";


// ==========================================
// Planner Runner
// ==========================================

export async function runPlanner(
    model?: ChatOllama
): Promise<void> {

    console.log("\n====================================");
    console.log("        PLAYWRIGHT AI PLANNER");
    console.log("====================================\n");


    // ==========================================
    // Get latest Agent 2 input
    // ==========================================

    const testCasePath =
        await Agent1FileFinder.getLatestAgent2Input();


    console.log("\nTest Case Input:");
    console.log(testCasePath);


    // ==========================================
    // Initialize Ollama
    // ==========================================

    const ollamaModel =
        model ||
        createOllamaModel();


    // ==========================================
    // Create Planner Agent
    // ==========================================

    const planner =
        new PlannerAgent(
            ollamaModel
        );


    // ==========================================
    // Generate Framework Plan
    // ==========================================

    const rawResponse =
        await planner.createPlan(
            testCasePath
        );


    console.log(
        "\nRaw Planner Response:\n"
    );


    console.log(
        rawResponse
    );


    // ==========================================
    // Parse Framework Plan
    // ==========================================

    const parser =
        new PlannerParser();


    const frameworkPlan =
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
    // Save Framework Plan
    // ==========================================

    await fs.writeFile(

        ProjectPaths.frameworkPlan,

        JSON.stringify(
            frameworkPlan,
            null,
            2
        ),

        "utf8"

    );


    console.log(
        "\n✅ Framework Plan Saved"
    );


    console.log(
        ProjectPaths.frameworkPlan
    );
}


// ==========================================
// Standalone Execution
// ==========================================

