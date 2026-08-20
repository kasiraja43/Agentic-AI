
import fs from "fs/promises";
import path from "path";

import { ChatOllama } from "@langchain/ollama";

import { createOllamaModel } from "../utils/OllamaConfig";

import { RequirementAgent } from "../agents/requirement/RequirementAgent";
import { ProjectPaths } from "../utils/ProjectPaths";


// ==========================================
// Requirement Analysis Agent
// ==========================================

export async function runRequirementAgent(
    model?: ChatOllama
): Promise<void> {

    console.log("\n=======================================");
    console.log("     REQUIREMENT ANALYSIS AGENT");
    console.log("=======================================\n");


    // ==========================================
    // Requirement Documents
    // ==========================================

    console.log("Knowledge Directory:");
    console.log(ProjectPaths.knowledge);

    console.log("\nRequirements Directory:");
    console.log(ProjectPaths.requirements);


    // ==========================================
    // Find Documents
    // ==========================================

    const knowledgeDocument =
        await findDocument(
            ProjectPaths.knowledge
        );

    const requirementsDocument =
        await findDocument(
            ProjectPaths.requirements
        );


    console.log("\nKnowledge Document:");
    console.log(knowledgeDocument);

    console.log("\nRequirements Document:");
    console.log(requirementsDocument);


    // ==========================================
    // Initialize Ollama
    // ==========================================

    const ollamaModel =
        model ||
        createOllamaModel();


    // ==========================================
    // Create Requirement Agent
    // ==========================================

    const agent =
        new RequirementAgent(
            ollamaModel
        );


    // ==========================================
    // Generate Agent 2 Input
    // ==========================================

    const outputPath =
        await agent.generateAgent2Input(
            knowledgeDocument,
            requirementsDocument
        );


    console.log(
        "\n✅ Requirement Analysis Completed"
    );

    console.log(
        "Agent 2 Input:"
    );

    console.log(
        outputPath
    );
}


// ==========================================
// Find First Supported Document
// ==========================================

async function findDocument(
    folder: string
): Promise<string> {

    const entries =
        await fs.readdir(
            folder,
            {
                withFileTypes: true
            }
        );


    const document =
        entries.find(
            entry =>
                entry.isFile() &&
                (
                    entry.name
                        .toLowerCase()
                        .endsWith(".docx") ||

                    entry.name
                        .toLowerCase()
                        .endsWith(".md") ||

                    entry.name
                        .toLowerCase()
                        .endsWith(".txt")
                )
        );


    if (!document) {

        throw new Error(
            `No supported requirement document found in:\n${folder}`
        );
    }


    return path.join(
        folder,
        document.name
    );
}


// ==========================================
// Standalone Execution
// ==========================================

