
import fs from "fs/promises";

import { ChatOllama } from "@langchain/ollama";

import { createOllamaModel } from "../utils/OllamaConfig";

import { ReviewerAgent } from "../agents/reviewer/ReviewerAgent";
import { ReviewerParser } from "../agents/reviewer/parser";

import { ProjectPaths } from "../utils/ProjectPaths";


// ==========================================
// Reviewer Runner
// ==========================================

export async function runReview(
    model?: ChatOllama
): Promise<void> {

    console.log("\n=======================================");
    console.log("       PLAYWRIGHT REVIEWER AGENT");
    console.log("=======================================\n");


    // ==========================================
    // Input Paths
    // ==========================================

    console.log(
        "Framework:"
    );

    console.log(
        ProjectPaths.framework
    );


    console.log(
        "\nGenerated Tests:"
    );

    console.log(
        ProjectPaths.tests
    );


    console.log(
        "\nCoverage Report:"
    );

    console.log(
        ProjectPaths.coverage
    );


    // ==========================================
    // Initialize Ollama
    // ==========================================

    const ollamaModel =
        model ||
        createOllamaModel();


    // ==========================================
    // Create Reviewer Agent
    // ==========================================

    const reviewer =
        new ReviewerAgent(
            ollamaModel
        );


    // ==========================================
    // Generate Review
    // ==========================================

    const rawResponse =
        await reviewer.reviewFramework(

            ProjectPaths.framework,

            ProjectPaths.tests,

            ProjectPaths.coverage

        );


    // ==========================================
    // Parse Review
    // ==========================================

    const parser =
        new ReviewerParser();


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
    // Save Review Report
    // ==========================================

    await fs.writeFile(

        ProjectPaths.review,

        JSON.stringify(
            report,
            null,
            2
        ),

        "utf8"

    );


    console.log(
        "\n✅ Review Report Saved"
    );


    console.log(
        `Review Location: ${ProjectPaths.review}`
    );
}


// ==========================================
// Standalone Execution
// ==========================================

