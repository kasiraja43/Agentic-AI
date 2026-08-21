import fs from "fs/promises";
import path from "path";

import { ProjectPaths } from "../../utils/ProjectPaths";

interface HealingSuggestion {
    file: string;
    problem: string;
    oldCode: string;
    newCode: string;
    reason: string;
}

interface HealingReport {
    success: boolean;
    suggestions: HealingSuggestion[];
    summary: string;
}

export class HealingApplier {

    public async apply(): Promise<void> {

        console.log("\n=======================================");
        console.log("        HEALING APPLIER");
        console.log("=======================================\n");


        const reportFile =
            ProjectPaths.healingReport;


        console.log(
            "Healing Report:"
        );

        console.log(
            reportFile
        );


        // ==========================================
        // Read Report
        // ==========================================

        const reportContent =
            await fs.readFile(
                reportFile,
                "utf8"
            );


        const report =
            JSON.parse(
                reportContent
            ) as HealingReport;


        if (
            !report.success ||
            !Array.isArray(
                report.suggestions
            ) ||
            report.suggestions.length === 0
        ) {

            console.log(
                "\n⚠️ No healing suggestions available."
            );

            return;
        }


        console.log(
            `\nHealing Suggestions: ${report.suggestions.length}`
        );


        // ==========================================
        // Apply Suggestions
        // ==========================================

        for (
            const suggestion of report.suggestions
        ) {

            await this.applySuggestion(
                suggestion
            );
        }


        console.log(
            "\n✅ Healing Applied Successfully"
        );
    }


    private async applySuggestion(
        suggestion: HealingSuggestion
    ): Promise<void> {

        console.log(
            `\nHealing File: ${suggestion.file}`
        );


        const testFile =
            await this.findFile(
                ProjectPaths.tests,
                suggestion.file
            );


        if (!testFile) {

            console.warn(
                `⚠️ Test file not found: ${suggestion.file}`
            );

            return;
        }


        console.log(
            `File Found: ${testFile}`
        );


        // ==========================================
        // Read Test
        // ==========================================

        const content =
            await fs.readFile(
                testFile,
                "utf8"
            );


        // ==========================================
        // Check Old Code
        // ==========================================

        if (
            !content.includes(
                suggestion.oldCode
            )
        ) {

            console.warn(
                "\n⚠️ Old code was not found."
            );

            console.warn(
                "Healing skipped for:"
            );

            console.warn(
                suggestion.oldCode
            );

            return;
        }


        // ==========================================
        // Apply Replacement
        // ==========================================

        const healedContent =
            content.replace(
                suggestion.oldCode,
                suggestion.newCode
            );


        // ==========================================
        // Backup Original
        // ==========================================

        const backupFile =
            `${testFile}.backup`;


        await fs.writeFile(
            backupFile,
            content,
            "utf8"
        );


        console.log(
            `Backup Created: ${backupFile}`
        );


        // ==========================================
        // Write Healed Test
        // ==========================================

        await fs.writeFile(
            testFile,
            healedContent,
            "utf8"
        );


        console.log(
            `✓ Healed: ${suggestion.file}`
        );


        console.log(
            `Reason: ${suggestion.reason}`
        );
    }


    private async findFile(
        folder: string,
        fileName: string
    ): Promise<string | null> {

        let entries;


        try {

            entries =
                await fs.readdir(
                    folder,
                    {
                        withFileTypes: true
                    }
                );

        } catch {

            return null;
        }


        for (
            const entry of entries
        ) {

            const fullPath =
                path.join(
                    folder,
                    entry.name
                );


            if (
                entry.isDirectory()
            ) {

                const found =
                    await this.findFile(
                        fullPath,
                        fileName
                    );


                if (found) {

                    return found;
                }


                continue;
            }


            if (
                entry.name === fileName
            ) {

                return fullPath;
            }
        }


        return null;
    }
}