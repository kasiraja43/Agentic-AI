
import fs from "fs/promises";

import { ChatOllama } from "@langchain/ollama";

import { createOllamaModel } from "../utils/OllamaConfig";

import { CoverageAgent } from "../agents/coverage/CoverageAgent";
import { CoverageParser } from "../agents/coverage/parser";

import { Agent1FileFinder } from "../utils/Agent1FileFinder";
import { ProjectPaths } from "../utils/ProjectPaths";


// ==========================================
// Coverage Runner
// ==========================================

export async function runCoverage(
    model?: ChatOllama
): Promise<void> {

    console.log("\n=======================================");
    console.log("       PLAYWRIGHT COVERAGE AGENT");
    console.log("=======================================\n");


    // ==========================================
    // Get latest Agent 1 hand-off
    // ==========================================

    const testCasePath =
        await Agent1FileFinder.getLatestAgent2Input();


    console.log(
        "\nTest Case Input:"
    );

    console.log(
        testCasePath
    );


    // ==========================================
    // Framework Plan
    // ==========================================

    console.log(
        "\nFramework Plan:"
    );

    console.log(
        ProjectPaths.frameworkPlan
    );


    // ==========================================
    // Generated Tests
    // ==========================================

    console.log(
        "\nGenerated Tests:"
    );

    console.log(
        ProjectPaths.tests
    );


    // ==========================================
    // Initialize Ollama
    // ==========================================

    const ollamaModel =
        model ||
        createOllamaModel();


    // ==========================================
    // Create Coverage Agent
    // ==========================================

    const agent =
        new CoverageAgent(
            ollamaModel
        );


    // ==========================================
    // Generate Coverage Report
    // ==========================================

    const rawResponse =
        await agent.generateCoverage(

            testCasePath,

            ProjectPaths.frameworkPlan,

            ProjectPaths.tests

        );


    // ==========================================
    // Parse Coverage Report
    // ==========================================

    const parser =
        new CoverageParser();


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
    // Save Coverage Report
    // ==========================================

    await fs.writeFile(

        ProjectPaths.coverage,

        JSON.stringify(
            report,
            null,
            2
        ),

        "utf8"

    );


    console.log(
        "\n✅ Coverage Report Saved"
    );


    console.log(
        `Coverage Location: ${ProjectPaths.coverage}`
    );
}


// ==========================================
// Standalone Execution
// ==========================================


