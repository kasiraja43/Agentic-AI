import { HealingReport } from "./types";

export class HealerParser {

    public parse(response: string): HealingReport {

        if (!response || !response.trim()) {
            throw new Error(
                "Healer Agent returned an empty response."
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
                "Healer Agent returned invalid JSON."
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
                "\n❌ Healer JSON parsing failed."
            );

            console.error(
                "\nRaw JSON:"
            );

            console.error(json);

            throw new Error(
                "Healer Agent returned malformed JSON."
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
                "Healer Agent returned an invalid JSON object."
            );
        }


        // ==========================================
        // Normalize Healing Report
        // ==========================================

        const success =
            Boolean(
                data.success ?? false
            );

        const suggestions =
            Array.isArray(
                data.suggestions
            )
                ? data.suggestions
                : [];

        const summary =
            typeof data.summary === "string"
                ? data.summary
                : "";


        // ==========================================
        // Return Healing Report
        // ==========================================

        return {

            success,

            suggestions,

            summary

        };
    }
}