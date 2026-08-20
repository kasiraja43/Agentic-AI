
import { ChatOllama } from "@langchain/ollama";

import { createOllamaModel } from "../utils/OllamaConfig";

import { FrameworkAgent } from "../agents/framework/FrameworkAgent";
import { FrameworkParser } from "../agents/framework/parser";

import { FrameworkWriter } from "../utils/FrameworkWriter";
import { ProjectPaths } from "../utils/ProjectPaths";


// ==========================================
// Framework Runner
// ==========================================

export async function runFramework(
    model?: ChatOllama
): Promise<void> {

    console.log("\n====================================");
    console.log("     PLAYWRIGHT FRAMEWORK AGENT");
    console.log("====================================\n");


    console.log(
        "Framework Plan:"
    );

    console.log(
        ProjectPaths.frameworkPlan
    );


    console.log(
        "Framework Output:"
    );

    console.log(
        ProjectPaths.framework
    );


    // ==========================================
    // Initialize Ollama
    // ==========================================

    const ollamaModel =
        model ||
        createOllamaModel();


    // ==========================================
    // Create Framework Agent
    // ==========================================

    const frameworkAgent =
        new FrameworkAgent(
            ollamaModel
        );


    // ==========================================
    // Generate Framework
    // ==========================================

    const rawResponse =
        await frameworkAgent.generateFramework(
            ProjectPaths.frameworkPlan
        );


    // ==========================================
    // Parse Framework
    // ==========================================

    const parser =
        new FrameworkParser();


    const framework =
        parser.parse(
            rawResponse
        );


    // ==========================================
    // Write Framework
    // ==========================================

    const writer =
        new FrameworkWriter();


    await writer.write(
        framework,
        ProjectPaths.framework
    );


    console.log(
        "\n✅ Framework Generation Completed"
    );


    console.log(
        `Framework Location: ${ProjectPaths.framework}`
    );
}


// ==========================================
// Standalone Execution
// ==========================================

if (require.main === module) {

    runFramework()
        .catch((error) => {

            console.error(
                "\n❌ Framework Agent Failed"
            );

            console.error(
                error
            );

            process.exit(1);
        });
}

