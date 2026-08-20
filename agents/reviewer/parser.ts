import { ReviewReport } from "./types";

export class ReviewerParser {

    public parse(response: string): ReviewReport {

        if (!response || !response.trim()) {
            throw new Error(
                "Reviewer Agent returned an empty response."
            );
        }


        // ==========================================
        // Remove Markdown code fences
        // ==========================================

        const cleanedResponse =
            response
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();


        // ==========================================
        // Extract JSON object
        // ==========================================

        const start =
            cleanedResponse.indexOf("{");

        const end =
            cleanedResponse.lastIndexOf("}");


        if (
            start === -1 ||
            end === -1 ||
            end <= start
        ) {

            throw new Error(
                "Reviewer Agent returned invalid JSON."
            );
        }


        const json =
            cleanedResponse.substring(
                start,
                end + 1
            );


        // ==========================================
        // Parse JSON
        // ==========================================

        let data: any;

        try {

            data =
                JSON.parse(json);

        } catch (error) {

            console.error(
                "\n❌ Reviewer JSON parsing failed."
            );

            console.error(
                "\nRaw JSON:"
            );

            console.error(json);

            throw new Error(
                "Reviewer Agent returned malformed JSON."
            );
        }


        // ==========================================
        // Validate JSON object
        // ==========================================

        if (
            typeof data !== "object" ||
            data === null
        ) {

            throw new Error(
                "Reviewer Agent returned an invalid JSON object."
            );
        }


        // ==========================================
        // Normalize Review Report
        // ==========================================

        const overallScore =
            Number(
                data.overallScore ?? 0
            );

        const issues =
            Array.isArray(data.issues)
                ? data.issues
                : [];

        const strengths =
            Array.isArray(data.strengths)
                ? data.strengths
                : [];

        const improvements =
            Array.isArray(data.improvements)
                ? data.improvements
                : [];

        const summary =
            typeof data.summary === "string"
                ? data.summary
                : "";


        // ==========================================
        // Validate Score
        // ==========================================

        if (
            !Number.isFinite(
                overallScore
            )
        ) {

            throw new Error(
                "Reviewer Agent returned an invalid overallScore."
            );
        }


        // ==========================================
        // Return Review Report
        // ==========================================

        return {

            overallScore,

            issues,

            strengths,

            improvements,

            summary

        };
    }
}