import fs from "fs/promises";

import { ChatOllama } from "@langchain/ollama";

import { createOllamaModel } from "../utils/OllamaConfig";
import { ProjectPaths } from "../utils/ProjectPaths";

import { runRequirementAgent } from "./runRequirementAgent";
import { runPlanner } from "./runPlanner";
import { runFramework } from "./runFramework";
import { runTestGenerator } from "./runTestGenerator";

import { runExecutor } from "./runExecutor";
import { runHealer } from "./runHealer";

import { HealingApplier } from "../agents/healer/HealingApplier";

import { runCoverage } from "./runCoverage";
import { runReview } from "./runReview";
import { runReporting } from "./runReporting";


// ==========================================
// Prepare Project
// ==========================================

async function prepareProject(): Promise<void> {

    console.log(
        "\nPreparing project directories...\n"
    );


    await fs.mkdir(
        ProjectPaths.output,
        {
            recursive: true
        }
    );


    await fs.mkdir(
        ProjectPaths.agent2Input,
        {
            recursive: true
        }
    );


    await fs.mkdir(
        ProjectPaths.framework,
        {
            recursive: true
        }
    );


    await fs.mkdir(
        ProjectPaths.tests,
        {
            recursive: true
        }
    );


    await fs.mkdir(
        ProjectPaths.reports,
        {
            recursive: true
        }
    );


    await fs.mkdir(
        ProjectPaths.allureResults,
        {
            recursive: true
        }
    );


    await fs.mkdir(
        ProjectPaths.allureReport,
        {
            recursive: true
        }
    );


    console.log(
        "✓ Project directories ready\n"
    );
}


// ==========================================
// Main AI Automation Pipeline
// ==========================================

async function main(): Promise<void> {

    console.log(
        "\n================================="
    );

    console.log(
        "     AI PLAYWRIGHT AUTOMATION"
    );

    console.log(
        "=================================\n"
    );


    try {

        // ==========================================
        // Prepare Project
        // ==========================================

        await prepareProject();


        // ==========================================
        // Initialize Ollama ONCE
        // ==========================================

        console.log(
            "Initializing Ollama model..."
        );


        const model: ChatOllama =
            createOllamaModel();


        console.log(
            "✓ Ollama model initialized"
        );


        // ==========================================
        // STEP 1
        // Requirement Analysis
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 1 : REQUIREMENT ANALYSIS"
        );

        console.log(
            "=================================\n"
        );


        await runRequirementAgent(
            model
        );


        console.log(
            "\n✓ STEP 1 COMPLETED"
        );


        // ==========================================
        // STEP 2
        // Planner
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 2 : PLANNER"
        );

        console.log(
            "=================================\n"
        );


        await runPlanner(
            model
        );


        console.log(
            "\n✓ STEP 2 COMPLETED"
        );


        // ==========================================
        // STEP 3
        // Framework
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 3 : FRAMEWORK"
        );

        console.log(
            "=================================\n"
        );


        await runFramework(
            model
        );


        console.log(
            "\n✓ STEP 3 COMPLETED"
        );


        // ==========================================
        // STEP 4
        // Test Generator
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 4 : TEST GENERATOR"
        );

        console.log(
            "=================================\n"
        );


        await runTestGenerator(
            model
        );


        console.log(
            "\n✓ STEP 4 COMPLETED"
        );


        // ==========================================
        // STEP 5
        // Reviewer
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 5 : REVIEWER"
        );

        console.log(
            "=================================\n"
        );


        await runReview(
            model
        );


        console.log(
            "\n✓ STEP 5 COMPLETED"
        );


        // ==========================================
        // STEP 6
        // First Executor
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 6 : EXECUTOR"
        );

        console.log(
            "=================================\n"
        );


        await runExecutor();


        console.log(
            "\n✓ STEP 6 COMPLETED"
        );


        // ==========================================
        // STEP 7
        // Healer
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 7 : HEALER"
        );

        console.log(
            "=================================\n"
        );


        await runHealer(
            model
        );


        console.log(
            "\n✓ STEP 7 COMPLETED"
        );


        // ==========================================
        // STEP 8
        // Healing Applier
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 8 : HEALING APPLIER"
        );

        console.log(
            "=================================\n"
        );


        const healingApplier =
            new HealingApplier();


        await healingApplier.apply();


        console.log(
            "\n✓ STEP 8 COMPLETED"
        );


        // ==========================================
        // STEP 9
        // Re-Execute Healed Tests
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 9 : RE-EXECUTOR"
        );

        console.log(
            "=================================\n"
        );


        await runExecutor();


        console.log(
            "\n✓ STEP 9 COMPLETED"
        );


        // ==========================================
        // STEP 10
        // Coverage
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 10 : COVERAGE"
        );

        console.log(
            "=================================\n"
        );


        await runCoverage(
            model
        );


        console.log(
            "\n✓ STEP 10 COMPLETED"
        );


        // ==========================================
        // STEP 11
        // Allure Reporting
        // ==========================================

        console.log(
            "\n================================="
        );

        console.log(
            "STEP 11 : REPORTING"
        );

        console.log(
            "=================================\n"
        );


        await runReporting();


        console.log(
            "\n✓ STEP 11 COMPLETED"
        );


        // ==========================================
        // COMPLETED
        // ==========================================

        console.log(
            "\n\n================================="
        );

        console.log(
            "     AI TESTING COMPLETED"
        );

        console.log(
            "=================================\n"
        );


        console.log(
            `Output: ${ProjectPaths.output}`
        );


        console.log(
            `\nCoverage: ${ProjectPaths.coverage}`
        );


        console.log(
            `Execution: ${ProjectPaths.execution}`
        );


        console.log(
            `Healing: ${ProjectPaths.healingReport}`
        );


        console.log(
            `Allure: ${ProjectPaths.allureReport}`
        );


    } catch (error) {

        console.error(
            "\n================================="
        );

        console.error(
            "       PIPELINE FAILED"
        );

        console.error(
            "=================================\n"
        );


        console.error(
            error
        );


        process.exitCode = 1;
    }
}


// ==========================================
// Start Pipeline
// ==========================================

main();