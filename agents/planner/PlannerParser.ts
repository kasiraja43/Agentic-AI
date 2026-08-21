import { FrameworkPlan } from "./types";

export class PlannerParser {

    public parse(response: string): FrameworkPlan {

        // Remove Markdown if present
        response = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        // Extract JSON
        const start = response.indexOf("{");
        const end = response.lastIndexOf("}");

        if (start === -1 || end === -1) {
            throw new Error("Planner returned invalid JSON.");
        }

        const json = response.substring(start, end + 1);

        const data = JSON.parse(json);

        return {

            projectName: data.projectName ?? "",

            pages: this.removeDuplicatePages(data.pages ?? []),

            fixtures: this.removeDuplicates(data.fixtures ?? []),

            utilities: this.removeDuplicates(data.utilities ?? []),

            testData: this.removeDuplicates(data.testData ?? []),

            testScripts: this.removeDuplicates(data.testScripts ?? []),

            reusableComponents: this.removeDuplicates(
                data.reusableComponents ?? []
            ),

            businessFlows: this.removeDuplicates(
                data.businessFlows ?? []
            )

        };
    }

    private removeDuplicates(items: string[]): string[] {
        return [...new Set(items)];
    }

    private removeDuplicatePages(
        pages: { name: string; reason: string }[]
    ): { name: string; reason: string }[] {

        const unique = new Map<string, { name: string; reason: string }>();

        for (const page of pages) {
            unique.set(page.name, page);
        }

        return [...unique.values()];
    }

}