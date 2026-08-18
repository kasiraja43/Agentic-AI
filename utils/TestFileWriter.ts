import fs from "fs/promises";
import path from "path";

import { TestGenerationOutput } from "../agents/testcase/types";

export class TestFileWriter {

    // ==========================================
    // Write Generated Test Files
    // ==========================================

    public async write(
        output: TestGenerationOutput,
        outputFolder: string
    ): Promise<void> {

        console.log(
            "\nWriting Test Files...\n"
        );

        // ==========================================
        // Validate Output
        // ==========================================

        if (
            !output ||
            !Array.isArray(output.files)
        ) {

            throw new Error(
                "Invalid test generation output."
            );
        }

        if (
            output.files.length === 0
        ) {

            throw new Error(
                "No test files available to write."
            );
        }

        // ==========================================
        // Create Test Directory
        // ==========================================

        await fs.mkdir(
            outputFolder,
            {
                recursive: true
            }
        );

        // ==========================================
        // Write Test Files
        // ==========================================

        for (
            const file of output.files
        ) {

            // ==========================================
            // Validate Extension
            // ==========================================

            if (
                !file.fileName.endsWith(
                    ".spec.ts"
                )
            ) {

                console.warn(
                    `⚠️ Skipping invalid test file: ${file.fileName}`
                );

                continue;
            }

            // ==========================================
            // Normalize Filename
            // ==========================================

            let fileName =
                file.fileName
                    .replace(/\\/g, "/")
                    .trim();

            // ==========================================
            // Remove tests/ Prefix
            //
            // Parser may return:
            //
            // tests/Login.spec.ts
            //
            // We want:
            //
            // Login.spec.ts
            // ==========================================

            fileName =
                fileName.replace(
                    /^tests\//i,
                    ""
                );

            // ==========================================
            // Prevent Absolute Paths
            // ==========================================

            fileName =
                path.basename(
                    fileName
                );

            // ==========================================
            // Validate Filename
            // ==========================================

            if (
                !fileName ||
                !fileName.endsWith(
                    ".spec.ts"
                )
            ) {

                console.warn(
                    `⚠️ Skipping invalid filename: ${file.fileName}`
                );

                continue;
            }

            // ==========================================
            // Validate Content
            // ==========================================

            if (
                !file.content ||
                file.content.trim().length === 0
            ) {

                console.warn(
                    `⚠️ Skipping empty test file: ${fileName}`
                );

                continue;
            }

            // ==========================================
            // Build Full Path
            // ==========================================

            const fullPath =
                path.join(
                    outputFolder,
                    fileName
                );

            // ==========================================
            // Create Parent Folder
            // ==========================================

            await fs.mkdir(
                path.dirname(fullPath),
                {
                    recursive: true
                }
            );

            // ==========================================
            // Write File
            // ==========================================

            await fs.writeFile(
                fullPath,
                file.content,
                "utf8"
            );

            console.log(
                `✓ ${fileName}`
            );
        }

        console.log(
            "\nTest Files Created Successfully.\n"
        );
    }
}