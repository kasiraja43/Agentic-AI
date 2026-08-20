
import { ChatOllama } from "@langchain/ollama";

import { createOllamaModel } from "../utils/OllamaConfig";

import { TestCaseAgent } from "../agents/testcase/TestCaseAgent";
import { TestCaseParser } from "../agents/testcase/parser";

import { Agent1FileFinder } from "../utils/Agent1FileFinder";
import { ProjectPaths } from "../utils/ProjectPaths";
import { TestFileWriter } from "../utils/TestFileWriter";


// ==========================================
// Test Generator Runner
// ==========================================

export async function runTestGenerator(
    model?: ChatOllama
): Promise<void> {

    console.log("\n=====================================");
    console.log("     PLAYWRIGHT TEST GENERATOR");
    console.log("=====================================\n");


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
    // Validate Framework Plan
    // ==========================================

    const frameworkPlanPath =
        ProjectPaths.frameworkPlan;


    console.log(
        "\nFramework Plan:"
    );

    console.log(
        frameworkPlanPath
    );


    // ==========================================
    // Initialize Ollama
    // ==========================================

    const ollamaModel =
        model ||
        createOllamaModel();


    // ==========================================
    // Create Test Case Agent
    // ==========================================

    const agent =
        new TestCaseAgent(
            ollamaModel
        );


    // ==========================================
    // Generate Tests
    // ==========================================

    const rawResponse =
        await agent.generateTests(
            testCasePath,
            frameworkPlanPath
        );


    // ==========================================
    // Parse Generated Tests
    // ==========================================

    const parser =
        new TestCaseParser();


    const parsed =
        parser.parse(
            rawResponse
        );


    // ==========================================
    // Write Test Files
    // ==========================================

    const writer =
        new TestFileWriter();


    await writer.write(
        parsed,
        ProjectPaths.tests
    );


    console.log(
        "\n✅ Test Generation Completed"
    );


    console.log(
        `Test Location: ${ProjectPaths.tests}`
    );
}


