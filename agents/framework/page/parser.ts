import { PageFile, PageOutput } from "./types";

export class PageParser {

    public parse(response: string): PageOutput {

        // Remove markdown if LLM accidentally returns it
        response = response
            .replace(/```typescript/g, "")
            .replace(/```ts/g, "")
            .replace(/```javascript/g, "")
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const files: PageFile[] = [];

        // Split using the file delimiter
        const sections = response
            .split("===== FILE:")
            .map(section => section.trim())
            .filter(section => section.length > 0);

        for (const section of sections) {

            const lines = section.split("\n");

            if (lines.length === 0) {
                continue;
            }

            const fileName = lines[0].trim();

            const content = lines
                .slice(1)
                .join("\n")
                .trim();

            files.push({
                fileName,
                content
            });

        }

        if (files.length === 0) {
            throw new Error("No page objects were generated.");
        }

        return {
            files
        };
    }
}