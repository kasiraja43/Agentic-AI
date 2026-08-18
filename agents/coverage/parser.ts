import { CoverageResult, MissingTestCase } from "./types";

export class CoverageParser {

    public parse(response: string): CoverageResult {

        if (
            !response ||
            !response.trim()
        ) {

            throw new Error(
                "Coverage Agent returned an empty response."
            );
        }


        console.log(
            "\n========== COVERAGE RAW RESPONSE ==========\n"
        );

        console.log(
            response.substring(0, 5000)
        );

        console.log(
            "\n===========================================\n"
        );


        // ==========================================
        // Normalize Response
        // ==========================================

        let cleanedResponse =
            response
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .trim();


        // ==========================================
        // Remove Markdown Code Fences
        // ==========================================

        cleanedResponse =
            cleanedResponse
                .replace(
                    /```json/gi,
                    ""
                )
                .replace(
                    /```typescript/gi,
                    ""
                )
                .replace(
                    /```ts/gi,
                    ""
                )
                .replace(
                    /```javascript/gi,
                    ""
                )
                .replace(
                    /```js/gi,
                    ""
                )
                .replace(
                    /```/g,
                    ""
                )
                .trim();


        // ==========================================
        // Remove Common JSON Prefixes
        // ==========================================

        cleanedResponse =
            cleanedResponse
                .replace(
                    /^Here(?:'s| is).*?:/is,
                    ""
                )
                .trim();


        // ==========================================
        // Try Direct JSON Parse First
        // ==========================================

        let data: unknown;


        try {

            data =
                JSON.parse(
                    cleanedResponse
                );

        } catch {

            // Continue with extracted JSON
            data =
                this.extractJson(
                    cleanedResponse
                );
        }


        // ==========================================
        // Validate Object
        // ==========================================

        if (
            typeof data !== "object" ||
            data === null ||
            Array.isArray(data)
        ) {

            throw new Error(
                "Coverage Agent returned an invalid JSON object."
            );
        }


        const raw =
            data as Record<string, unknown>;


        // ==========================================
        // Normalize Numeric Values
        // ==========================================

        const totalTestCases =
            this.toNumber(
                raw.totalTestCases ??
                raw.totalTests ??
                raw.total
            );


        const generatedTestCases =
            this.toNumber(
                raw.generatedTestCases ??
                raw.generatedTests ??
                raw.automatedTestCases ??
                raw.generated
            );


        // ==========================================
        // Missing Test Cases
        // ==========================================

        const missingTestCases =
            this.normalizeMissingTestCases(
                raw.missingTestCases ??
                raw.missingTests ??
                raw.uncoveredTestCases ??
                []
            );


        // ==========================================
        // Coverage Percentage
        // ==========================================

        let coveragePercentage =
            this.toNumber(
                raw.coveragePercentage ??
                raw.coverage ??
                raw.percentage
            );


        // ==========================================
        // Calculate Coverage When Missing
        // ==========================================

        if (
            coveragePercentage === 0 &&
            totalTestCases > 0 &&
            generatedTestCases >= 0
        ) {

            coveragePercentage =
                Number(
                    (
                        generatedTestCases /
                        totalTestCases *
                        100
                    ).toFixed(2)
                );
        }


        // ==========================================
        // Validate Numeric Values
        // ==========================================

        if (
            !Number.isFinite(
                totalTestCases
            )
        ) {

            throw new Error(
                "Coverage Agent returned invalid totalTestCases."
            );
        }


        if (
            !Number.isFinite(
                generatedTestCases
            )
        ) {

            throw new Error(
                "Coverage Agent returned invalid generatedTestCases."
            );
        }


        if (
            !Number.isFinite(
                coveragePercentage
            )
        ) {

            throw new Error(
                "Coverage Agent returned invalid coveragePercentage."
            );
        }


        // ==========================================
        // Validate Logical Values
        // ==========================================

        if (
            totalTestCases < 0
        ) {

            throw new Error(
                "totalTestCases cannot be negative."
            );
        }


        if (
            generatedTestCases < 0
        ) {

            throw new Error(
                "generatedTestCases cannot be negative."
            );
        }


        if (
            coveragePercentage < 0 ||
            coveragePercentage > 100
        ) {

            throw new Error(
                "coveragePercentage must be between 0 and 100."
            );
        }


        // ==========================================
        // Final Result
        // ==========================================

        const result: CoverageResult = {

            totalTestCases,

            generatedTestCases,

            missingTestCases,

            coveragePercentage

        };


        console.log(
            "\n✓ Coverage JSON Parsed Successfully"
        );

        console.log(
            `Total Test Cases      : ${result.totalTestCases}`
        );

        console.log(
            `Generated Test Cases  : ${result.generatedTestCases}`
        );

        console.log(
            `Missing Test Cases    : ${result.missingTestCases.length}`
        );

        console.log(
            `Coverage Percentage   : ${result.coveragePercentage}%`
        );


        return result;
    }


    // ==========================================
    // Extract JSON From LLM Response
    // ==========================================

    private extractJson(
        response: string
    ): Record<string, unknown> {

        // ------------------------------------------
        // Find first {
        // ------------------------------------------

        const start =
            response.indexOf("{");


        if (
            start === -1
        ) {

            throw new Error(
                "Coverage Agent returned invalid JSON: no JSON object found."
            );
        }


        // ------------------------------------------
        // Find matching closing }
        //
        // Handles nested objects safely.
        // ------------------------------------------

        let depth = 0;

        let inString = false;

        let escaped = false;

        let end = -1;


        for (
            let i = start;
            i < response.length;
            i++
        ) {

            const char =
                response[i];


            if (
                char === "\\" &&
                inString
            ) {

                escaped =
                    !escaped;

                continue;
            }


            if (
                char === '"' &&
                !escaped
            ) {

                inString =
                    !inString;
            }


            escaped = false;


            if (
                inString
            ) {

                continue;
            }


            if (
                char === "{"
            ) {

                depth++;
            }


            if (
                char === "}"
            ) {

                depth--;


                if (
                    depth === 0
                ) {

                    end = i;

                    break;
                }
            }
        }


        if (
            end === -1
        ) {

            throw new Error(
                "Coverage Agent returned malformed JSON object."
            );
        }


        const json =
            response.substring(
                start,
                end + 1
            );


        try {

            return JSON.parse(
                json
            ) as Record<string, unknown>;

        } catch (error) {

            console.error(
                "\n❌ Coverage JSON parsing failed."
            );

            console.error(
                "\nExtracted JSON:"
            );

            console.error(
                json
            );


            throw new Error(
                "Coverage Agent returned malformed JSON."
            );
        }
    }


    // ==========================================
    // Convert Value To Number
    // ==========================================

    private toNumber(
        value: unknown
    ): number {

        if (
            typeof value === "number"
        ) {

            return value;
        }


        if (
            typeof value === "string"
        ) {

            const cleaned =
                value
                    .replace(
                        /%/g,
                        ""
                    )
                    .trim();


            const parsed =
                Number(
                    cleaned
                );


            return parsed;
        }


        return 0;
    }


    // ==========================================
    // Normalize Missing Test Cases
    // ==========================================

    private normalizeMissingTestCases(
        value: unknown
    ): MissingTestCase[] {

        if (
            !Array.isArray(value)
        ) {

            return [];
        }


        return value
            .map(
                item => {

                    if (
                        typeof item === "string"
                    ) {

                        return {

                            id: item,

                            title: "",

                            reason: ""

                        };
                    }


                    if (
                        typeof item === "object" &&
                        item !== null
                    ) {

                        const object =
                            item as Record<string, unknown>;


                        return {

                            id:
                                String(
                                    object.id ??
                                    object.testCaseId ??
                                    ""
                                ),

                            title:
                                String(
                                    object.title ??
                                    object.name ??
                                    ""
                                ),

                            reason:
                                String(
                                    object.reason ??
                                    object.description ??
                                    ""
                                )

                        };
                    }


                    return null;
                }
            )
            .filter(
                (
                    item
                ): item is MissingTestCase =>
                    item !== null
            );
    }
}