import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

import { ProjectPaths } from "../../utils/ProjectPaths";

export class RequirementAgent {

    constructor(
        private readonly model: ChatOllama
    ) {}


    // ==========================================
    // Main Agent
    // ==========================================

    public async generateAgent2Input(
        knowledgeDocument: string,
        requirementsDocument: string
    ): Promise<string> {

        console.log("\n=======================================");
        console.log("     REQUIREMENT ANALYSIS AGENT");
        console.log("=======================================\n");


        // ==========================================
        // Load Knowledge Document
        // ==========================================

        console.log(
            "📄 Loading knowledge document..."
        );

        const knowledgeText =
            await this.loadDocument(
                knowledgeDocument
            );

        console.log(
            "✓ Knowledge document loaded"
        );

        console.log(
            `Knowledge Size: ${knowledgeText.length} characters`
        );


        // ==========================================
        // Load Requirements Document
        // ==========================================

        console.log(
            "📄 Loading requirements document..."
        );

        const requirementsText =
            await this.loadDocument(
                requirementsDocument
            );

        console.log(
            "✓ Requirements document loaded"
        );

        console.log(
            `Requirements Size: ${requirementsText.length} characters`
        );


        // ==========================================
        // Parse Requirements Locally
        // ==========================================

        console.log(
            "\n🔎 Parsing requirement repository..."
        );

        const allRequirements =
            this.parseRequirements(
                requirementsText
            );

        console.log(
            `✓ ${allRequirements.length} requirement(s) indexed`
        );


        if (
            allRequirements.length === 0
        ) {

            throw new Error(
                "No valid Jira requirements could be parsed from the requirements document."
            );
        }


        // ==========================================
        // Build Compact Requirement Index
        // ==========================================

        console.log(
            "\n📋 Building compact requirement index..."
        );

        const requirementIndex =
            this.buildRequirementIndex(
                allRequirements
            );

        console.log(
            `✓ Compact index created`
        );

        console.log(
            `Index Size: ${requirementIndex.length} characters`
        );


        // ==========================================
        // Select Requirements
        // ==========================================

        console.log(
            "\n🎯 Selecting requirements..."
        );

        const selectionPrompt =
            this.buildRequirementSelectionPrompt(
                requirementIndex
            );

        console.log(
            `Selection Prompt Size: ${selectionPrompt.length}`
        );

        const selectionResponse =
            await this.callOllama(
                selectionPrompt
            );

            console.log("\n========== RAW SELECTION RESPONSE ==========");
console.log(selectionResponse);
console.log("============================================\n");

        // ==========================================
        // Retrieve Full Selected Requirements
        // ==========================================

        const selectedRequirements =
            this.extractSelectedRequirements(
                selectionResponse,
                allRequirements
            );


        console.log(
            `✓ Selected ${selectedRequirements.length} requirement(s)`
        );


        if (
            selectedRequirements.length === 0
        ) {

            throw new Error(
                "Requirement selection returned zero valid requirements."
            );
        }


        // ==========================================
        // Generate Classification + Test Cases
        // ==========================================

        console.log(
            "\n🤖 Generating classification and test cases..."
        );

        const analysisPrompt =
            this.buildAnalysisPrompt(
                knowledgeText,
                selectedRequirements
            );

        console.log(
            `Analysis Prompt Size: ${analysisPrompt.length}`
        );

        const analysisResponse =
            await this.callOllama(
                analysisPrompt
            );


        // ==========================================
        // Parse Analysis
        // ==========================================

        const analysis =
            this.extractAnalysis(
                analysisResponse,
                selectedRequirements
            );


        // ==========================================
        // Build Agent 2 Input
        // ==========================================

        const agent2Input =
            this.buildAgent2Input(
                selectedRequirements,
                analysis
            );


        console.log(
            "\n✓ Agent 2 input generated"
        );


        // ==========================================
        // Save Agent 2 Input
        // ==========================================

        const agent2InputFolder =
            ProjectPaths.agent2Input;


        await fs.mkdir(
            agent2InputFolder,
            {
                recursive: true
            }
        );


        const timestamp =
            this.getTimestamp();


        const outputPath =
            path.join(
                agent2InputFolder,
                `Agent2_Input_${timestamp}.md`
            );


        await fs.writeFile(
            outputPath,
            agent2Input,
            "utf8"
        );


        console.log(
            "✓ Agent 2 input written to:"
        );

        console.log(
            outputPath
        );


        return outputPath;
    }


    // ==========================================
    // DOCX / Markdown Reader
    // ==========================================

    private async loadDocument(
        filePath: string
    ): Promise<string> {

        const extension =
            path.extname(filePath)
                .toLowerCase();


        if (
            extension === ".docx"
        ) {

            const result =
                await mammoth.extractRawText({
                    path: filePath
                });


            return String(
                result.value ?? ""
            ).trim();
        }


        return fs.readFile(
            filePath,
            "utf8"
        );
    }


    // ==========================================
    // Ollama
    // ==========================================

    private async callOllama(
        prompt: string
    ): Promise<string> {

        console.log(
            `Prompt Size: ${prompt.length}`
        );

        console.log(
            "Calling Ollama through LangChain..."
        );


        try {

            const response =
                await this.model.invoke([
                    new HumanMessage(prompt)
                ]);


            console.log(
                "✓ Ollama response received"
            );

            console.log(
                `Response Size: ${response.content.toString().length}`
            );


            return response.content.toString();

        } catch (error) {

            console.error(
                "\n❌ LangChain Ollama call failed"
            );

            console.error(error);

            throw error;
        }
    }


    // ==========================================
    // Compact Requirement Index
    // ==========================================

    private buildRequirementIndex(
        requirements: Array<Record<string, unknown>>
    ): string {

        return requirements
            .map(
                (requirement, index) => {

                    const id =
                        String(
                            requirement.requirementId ??
                            `REQ-${index + 1}`
                        );


                    const title =
                        String(
                            requirement.requirementTitle ??
                            "Requirement"
                        );


                    const businessArea =
                        String(
                            requirement.businessArea ??
                            "General"
                        );


                    const module =
                        String(
                            requirement.module ??
                            ""
                        );


                    const feature =
                        String(
                            requirement.feature ??
                            ""
                        );


                    const category =
                        String(
                            requirement.category ??
                            ""
                        );


                    const subCategory =
                        String(
                            requirement.subCategory ??
                            ""
                        );


                    const priority =
                        String(
                            requirement.priority ??
                            "High"
                        );


                    const severity =
                        String(
                            requirement.severity ??
                            "Medium"
                        );


                    return [
                        `${index + 1}.`,
                        `ID=${id}`,
                        `Title=${title}`,
                        `BusinessArea=${businessArea}`,
                        module
                            ? `Module=${module}`
                            : "",
                        feature
                            ? `Feature=${feature}`
                            : "",
                        category
                            ? `Category=${category}`
                            : "",
                        subCategory
                            ? `SubCategory=${subCategory}`
                            : "",
                        `Priority=${priority}`,
                        `Severity=${severity}`
                    ]
                        .filter(Boolean)
                        .join(" | ");
                }
            )
            .join("\n");
    }


    // ==========================================
    // Requirement Selection Prompt
    // ==========================================

    private buildRequirementSelectionPrompt(
        requirementIndex: string
    ): string {

        return `
You are a Senior QA Lead.

You are Agent 1 in an AI-Driven Software Testing Framework.

Your task is to select exactly 5 requirements from the compact Jira requirement index below.

The complete requirement details are stored locally by the application.
You only need to select the requirement IDs.

Rules:

- Select exactly 5 requirements.
- Select only IDs that exist in the provided index.
- Preserve the original requirement IDs exactly.
- Prefer different business areas where possible.
- Prefer requirements with clear automation potential.
- Prefer requirements with clear business behavior.
- Prefer requirements with clear acceptance criteria indicators.
- Prefer a balanced mix of functionality where possible.
- Do not invent requirements.
- Do not modify requirement IDs.
- Do not return complete requirement descriptions.
- Return ONLY valid JSON.
- Do not include Markdown.
- Do not include explanations.

Required JSON format:

{
  "selectedRequirements": [
    {
      "requirementId": "TFS-48321"
    },
    {
      "requirementId": "TFS-71584"
    },
    {
      "requirementId": "TFS-29463"
    },
    {
      "requirementId": "TFS-86127"
    },
    {
      "requirementId": "TFS-53091"
    }
  ]
}

COMPACT JIRA REQUIREMENT INDEX:

${requirementIndex}
`;
    }


    // ==========================================
    // Extract Selected Requirements
    // ==========================================

    private extractSelectedRequirements(
        response: string,
        requirements: Array<Record<string, unknown>>
    ): Array<Record<string, unknown>> {

        const data =
            this.extractJson(response);


        if (
            data &&
            Array.isArray(
                data.selectedRequirements
            )
        ) {

            const selectedItems =
                data.selectedRequirements
                    .slice(0, 5);


            const selectedIds =
                selectedItems
                    .map(
                        (item: any) => {

                            if (
                                typeof item === "string"
                            ) {

                                return item.trim();
                            }


                            return String(
                                item?.requirementId ??
                                item?.id ??
                                ""
                            ).trim();
                        }
                    )
                    .filter(
                        (id: string) =>
                            id.length > 0
                    );


            const selectedRequirements =
                this.findRequirementsByIds(
                    selectedIds,
                    requirements
                );


            if (
                selectedRequirements.length > 0
            ) {

                console.log(
                    "\nSelected Requirement IDs:"
                );

                selectedRequirements.forEach(
                    requirement => {

                        console.log(
                            `- ${String(
                                requirement.requirementId
                            )}`
                        );
                    }
                );


                return selectedRequirements;
            }
        }


        // ==========================================
        // Deterministic Fallback
        // ==========================================

        console.warn(
            "⚠️ Requirement selection returned invalid JSON or invalid IDs."
        );

        console.warn(
            "Using deterministic fallback selection."
        );


        return requirements.slice(
            0,
            5
        );
    }


    // ==========================================
    // Find Requirements By IDs
    // ==========================================

    private findRequirementsByIds(
        selectedIds: string[],
        requirements: Array<Record<string, unknown>>
    ): Array<Record<string, unknown>> {

        const normalizedIds =
            new Set(
                selectedIds.map(
                    id =>
                        id.trim().toLowerCase()
                )
            );


        const selected =
            requirements.filter(
                requirement => {

                    const id =
                        String(
                            requirement.requirementId ??
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    return normalizedIds.has(id);
                }
            );


        // Preserve the order returned by the LLM.
        const ordered =
            selectedIds
                .map(
                    selectedId => {

                        const normalized =
                            selectedId
                                .trim()
                                .toLowerCase();


                        return selected.find(
                            requirement =>
                                String(
                                    requirement.requirementId ??
                                    ""
                                )
                                    .trim()
                                    .toLowerCase() ===
                                normalized
                        );
                    }
                )
                .filter(
                    (
                        requirement
                    ): requirement is Record<string, unknown> =>
                        Boolean(requirement)
                );


        return ordered.slice(
            0,
            5
        );
    }


    // ==========================================
    // Analysis Prompt
    // ==========================================

    private buildAnalysisPrompt(
        knowledgeText: string,
        selectedRequirements: Array<Record<string, unknown>>
    ): string {

        return `
You are Agent 1 in an AI-Driven Software Testing Framework.

You are an experienced QA Lead.

Use the knowledge base as the core intelligence layer.

Do not rely only on keyword matching.

Analyze the selected requirements and generate automation-ready test cases.

KNOWLEDGE BASE:

${knowledgeText}


SELECTED REQUIREMENTS:

${JSON.stringify(
    selectedRequirements,
    null,
    2
)}


For every requirement generate detailed test cases.

Each test case must contain:

- Test Case ID
- Requirement ID
- Requirement Title
- Objective
- Test Type
- Labels
- Component
- Priority
- Severity
- Preconditions
- Test Data
- Test Steps
- Expected Result
- Actual Result
- Status
- Post Conditions
- Automation Candidate
- Reason for Automation
- Dependency
- Risk
- Negative Scenario
- Edge Scenario
- Business Validation
- Technical Validation
- Requirement Link

Rules:

- Every test case must contain at least 5 numbered steps.
- Every step must contain Action.
- Every step must contain Test Data.
- Every step must contain Expected Result.
- Use realistic test data.
- Include positive scenarios.
- Include negative scenarios.
- Include edge scenarios.
- Make every test implementation-ready.
- Avoid vague instructions.
- Keep requirement IDs unchanged.
- Do not invent requirements.
- Do not change requirement IDs.
- Use the supplied acceptance criteria as the primary validation source.
- Ensure generated tests are suitable for Playwright automation.
- Map every generated test case to a requirement ID.

Return ONLY valid JSON.

Required structure:

{
  "categorizationReport": "...",
  "testCases": "..."
}
`;
    }


    // ==========================================
    // Extract Analysis
    // ==========================================

    private extractAnalysis(
        response: string,
        selectedRequirements: Array<Record<string, unknown>>
    ): {
        categorizationReport: string;
        testCases: string;
    } {

        const data =
            this.extractJson(
                response
            );


        if (data) {

            return {

                categorizationReport:
                    String(
                        data.categorizationReport ?? ""
                    ),

                testCases:
                    String(
                        data.testCases ?? ""
                    )
            };
        }


        return {

            categorizationReport:
                "# Agent 1 Categorization Report\n\n" +
                "AI classification response could not be parsed.",

            testCases:
                this.buildFallbackTestCases(
                    selectedRequirements
                )
        };
    }


    // ==========================================
    // Build Agent 2 Input
    // ==========================================

    private buildAgent2Input(
        requirements: Array<Record<string, unknown>>,
        analysis: {
            categorizationReport: string;
            testCases: string;
        }
    ): string {

        const requirementSummary =
            requirements
                .map(
                    (
                        requirement,
                        index
                    ) => {

                        const id =
                            String(
                                requirement.requirementId ??
                                `REQ-${index + 1}`
                            );


                        const title =
                            String(
                                requirement.requirementTitle ??
                                requirement.summary ??
                                "Requirement"
                            );


                        const module =
                            String(
                                requirement.module ??
                                ""
                            );


                        const feature =
                            String(
                                requirement.feature ??
                                ""
                            );


                        const category =
                            String(
                                requirement.category ??
                                ""
                            );


                        const priority =
                            String(
                                requirement.priority ??
                                "High"
                            );


                        const severity =
                            String(
                                requirement.severity ??
                                "Medium"
                            );


                        return [
                            `## ${index + 1}. ${title}`,
                            `- Requirement ID: ${id}`,

                            module
                                ? `- Module: ${module}`
                                : "",

                            feature
                                ? `- Feature: ${feature}`
                                : "",

                            category
                                ? `- Category: ${category}`
                                : "",

                            `- Priority: ${priority}`,

                            `- Severity: ${severity}`
                        ]
                            .filter(Boolean)
                            .join("\n");
                    }
                )
                .join("\n\n");


        return [

            "# 🤖 Agent 2 Input Session",

            `- Generated At: ${new Date().toISOString()}`,

            `- Selected Requirements: ${requirements.length}`,

            "",

            "## 🎯 Requirements",

            requirementSummary,

            "",

            "## 📊 Categorization",

            analysis.categorizationReport,

            "",

            "## 🤖 Automation-Ready Test Cases",

            analysis.testCases,

            "",

            "## 🧠 Recommended Playwright Strategy",

            "- Use Playwright with TypeScript.",
            "- Use Page Object Model.",
            "- Reuse existing Page Objects.",
            "- Use Playwright fixtures.",
            "- Use async/await.",
            "- Use stable locators.",
            "- Avoid hard-coded waits.",
            "- Validate observable business outcomes.",
            "- Keep test data reusable.",
            "- Map every requirement ID to generated tests."

        ].join("\n");
    }


    // ==========================================
    // Jira Requirement Parser
    // ==========================================

    private parseRequirements(
        text: string
    ): Array<Record<string, unknown>> {

        const normalizedText =
            text
                .replace(/\r/g, "")
                .trim();


        // ==========================================
        // Split Using Jira Requirement ID
        // ==========================================

        const blocks =
            normalizedText
                .split(
                    /(?=JIRA\s+Requirement\s+ID\s*:)/i
                )
                .map(
                    block =>
                        block.trim()
                )
                .filter(
                    block =>
                        /JIRA\s+Requirement\s+ID\s*:/i.test(
                            block
                        )
                );


        console.log(
            `Detected ${blocks.length} Jira requirement blocks.`
        );


        return blocks
            .map(
                (
                    block,
                    index
                ) => {

                    // ==========================================
                    // Requirement ID
                    // ==========================================

                    const id =
                        block.match(
                            /JIRA\s+Requirement\s+ID\s*:\s*([A-Z0-9-]+)/i
                        )?.[1]
                        ??
                        block.match(
                            /\b(?:REQ|[A-Z]{2,})-\d+\b/i
                        )?.[0]
                        ??
                        `REQ-${index + 1}`;


                    // ==========================================
                    // Summary / Title
                    // ==========================================

                    const title =
                        block.match(
                            /Summary\s*:\s*(.+)/i
                        )?.[1]
                        ??
                        block.match(
                            /Title\s*:\s*(.+)/i
                        )?.[1]
                        ??
                        "Requirement";


                    // ==========================================
                    // Module
                    // ==========================================

                    const module =
                        block.match(
                            /Module\s*:\s*(.+)/i
                        )?.[1]
                        ?.trim()
                        ??
                        "";


                    // ==========================================
                    // Feature
                    // ==========================================

                    const feature =
                        block.match(
                            /Feature\s*:\s*(.+)/i
                        )?.[1]
                        ?.trim()
                        ??
                        "";


                    // ==========================================
                    // Category
                    // ==========================================

                    const category =
                        block.match(
                            /Category\s*:\s*(.+)/i
                        )?.[1]
                        ?.trim()
                        ??
                        "";


                    // ==========================================
                    // Sub Category
                    // ==========================================

                    const subCategory =
                        block.match(
                            /Sub Category\s*:\s*(.+)/i
                        )?.[1]
                        ?.trim()
                        ??
                        "";


                    // ==========================================
                    // Priority
                    // ==========================================

                    const priority =
                        block.match(
                            /Priority\s*:\s*(.+)/i
                        )?.[1]
                        ?.trim()
                        ??
                        "High";


                    // ==========================================
                    // Severity
                    // ==========================================

                    const severity =
                        block.match(
                            /Severity\s*:\s*(.+)/i
                        )?.[1]
                        ?.trim()
                        ??
                        "Medium";


                    // ==========================================
                    // Requirement Description
                    // ==========================================

                    const requirementDescription =
                        block.match(
                            /Requirement Description\s*:\s*([\s\S]*?)(?=\n\s*Acceptance Criteria\s*:)/i
                        )?.[1]
                        ?.trim()
                        ??
                        "";


                    // ==========================================
                    // Acceptance Criteria
                    // ==========================================

                    const acceptanceCriteriaText =
                        block.match(
                            /Acceptance Criteria\s*:\s*([\s\S]*)$/i
                        )?.[1]
                        ?.trim()
                        ??
                        "";


                    const acceptanceCriteria =
                        acceptanceCriteriaText
                            .split(/\n+/)
                            .map(
                                line =>
                                    line
                                        .replace(
                                            /^\s*[-•*]\s*/,
                                            ""
                                        )
                                        .replace(
                                            /^\s*\d+[.)]\s*/,
                                            ""
                                        )
                                        .trim()
                            )
                            .filter(
                                line =>
                                    line.length > 0
                            );


                    // ==========================================
                    // Business Area
                    // ==========================================

                    const businessArea =
                        module ||
                        category ||
                        "General";


                    return {

                        requirementId:
                            id.trim(),

                        requirementTitle:
                            title.trim(),

                        businessArea,

                        module,

                        feature,

                        category,

                        subCategory,

                        priority,

                        severity,

                        requirementDescription,

                        acceptanceCriteria,

                        sourceText:
                            block.trim()
                    };
                }
            );
    }


    // ==========================================
    // Fallback Test Cases
    // ==========================================

    private buildFallbackTestCases(
        requirements: Array<Record<string, unknown>>
    ): string {

        return requirements
            .map(
                (
                    requirement,
                    index
                ) => {

                    const id =
                        String(
                            requirement.requirementId ??
                            `REQ-${index + 1}`
                        );


                    const title =
                        String(
                            requirement.requirementTitle ??
                            "Requirement"
                        );


                    const description =
                        String(
                            requirement.requirementDescription ??
                            title
                        );


                    return `
## Test Case ${index + 1}

- Test Case ID: TC-${id}
- Requirement ID: ${id}
- Requirement Title: ${title}
- Objective: Validate the requirement.
- Test Type: Functional
- Priority: ${String(
    requirement.priority ??
    "High"
)}
- Severity: ${String(
    requirement.severity ??
    "Medium"
)}
- Preconditions: Application is available.
- Test Data: Valid and invalid data as applicable.
- Requirement Description: ${description}

### Test Steps

1. Action: Open the application.
   - Test Data: Application URL.
   - Expected Result: Application loads successfully.

2. Action: Navigate to the required feature.
   - Test Data: ${title}.
   - Expected Result: Required feature is displayed.

3. Action: Enter valid test data.
   - Test Data: Valid data.
   - Expected Result: Data is accepted.

4. Action: Submit the operation.
   - Test Data: Entered data.
   - Expected Result: Application processes the request.

5. Action: Validate the result.
   - Test Data: Expected business outcome.
   - Expected Result: Requirement behavior is satisfied.
`;
                }
            )
            .join("\n");
    }


    // ==========================================
    // JSON Parser
    // ==========================================

    private extractJson(
        response: string
    ): Record<string, any> | null {

        const cleaned =
            response
                .replace(
                    /```json/gi,
                    ""
                )
                .replace(
                    /```/g,
                    ""
                )
                .trim();


        const start =
            cleaned.indexOf("{");


        const end =
            cleaned.lastIndexOf("}");


        if (
            start === -1 ||
            end === -1 ||
            end <= start
        ) {

            return null;
        }


        try {

            return JSON.parse(
                cleaned.substring(
                    start,
                    end + 1
                )
            );

        } catch {

            return null;
        }
    }


    // ==========================================
    // Timestamp
    // ==========================================

    private getTimestamp(): string {

        const now =
            new Date();


        return [
            now.getFullYear(),

            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            ),

            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            ),

            String(
                now.getHours()
            ).padStart(
                2,
                "0"
            ),

            String(
                now.getMinutes()
            ).padStart(
                2,
                "0"
            ),

            String(
                now.getSeconds()
            ).padStart(
                2,
                "0"
            )

        ].join("");
    }
}