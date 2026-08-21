import { createOllamaModel } from "../utils/OllamaConfig";

import { PageGeneratorAgent } from "../agents/framework/page/pagegeneratoragent";
import { PageParser } from "../agents/framework/page/parser";
import { PageWriter } from "../agents/framework/page/PageWriter";
import { ProjectPaths } from "../utils/ProjectPaths";

export async function runPageGenerator(): Promise<void> {

    console.log("\n========================================");
    console.log("     PAGE GENERATOR");
    console.log("========================================\n");


    // ==========================================
    // Initialize Ollama
    // ==========================================

   const model = createOllamaModel();


    // ==========================================
    // Framework Plan
    // ==========================================

    const frameworkPlan =
        ProjectPaths.frameworkPlan;

    console.log(
        "Framework Plan:"
    );

    console.log(
        frameworkPlan
    );


    // ==========================================
    // Create Page Generator Agent
    // ==========================================

    const agent =
        new PageGeneratorAgent(
            model
        );


    // ==========================================
    // Generate Page Objects
    // ==========================================

    const rawResponse =
        await agent.generatePages(
            frameworkPlan
        );


    // ==========================================
    // Parse Page Objects
    // ==========================================

    const parser =
        new PageParser();

    const pages =
        parser.parse(
            rawResponse
        );


    // ==========================================
    // Write Page Objects
    // ==========================================

    const writer =
        new PageWriter();

    await writer.write(
        pages,
        ProjectPaths.framework
    );


    console.log(
        "\n✅ Page Generation Completed Successfully.\n"
    );
}


// ==========================================
// Error Handling
// ==========================================

runPageGenerator().catch(
    (error) => {

        console.error(
            "\n❌ Page Generation Failed"
        );

        console.error(
            error
        );

        process.exit(1);
    }
);