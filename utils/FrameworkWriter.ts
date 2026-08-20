import fs from "fs/promises";
import path from "path";

import { FrameworkOutput } from "../agents/framework/types";

export class FrameworkWriter {

    public async write(
        framework: FrameworkOutput,
        outputFolder: string
    ): Promise<void> {

        console.log("\nCreating Framework Files...\n");

        if (!framework.files || framework.files.length === 0) {
            throw new Error(
                "Framework generation returned no files."
            );
        }

        // Ensure framework output directory exists
        await fs.mkdir(
            outputFolder,
            {
                recursive: true
            }
        );

        for (const file of framework.files) {

            if (!file.fileName) {
                console.warn(
                    "⚠️ Skipping framework file with empty filename."
                );

                continue;
            }

            const fullPath = path.join(
                outputFolder,
                file.fileName
            );

            // Create parent folders
            await fs.mkdir(
                path.dirname(fullPath),
                {
                    recursive: true
                }
            );

            // Write framework file
            await fs.writeFile(
                fullPath,
                file.content,
                "utf8"
            );

            console.log(
                `✓ ${file.fileName}`
            );
        }

        console.log(
            "\n✅ Framework Created Successfully\n"
        );

        console.log(
            `Framework Location: ${outputFolder}`
        );
    }
}