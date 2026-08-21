import {
    TestGenerationOutput,
    TestScript
} from "./types";

export class TestCaseParser {

    // ==========================================
    // Parse Test Generator Response
    // ==========================================

    public parse(
        response: string
    ): TestGenerationOutput {

        if (
            !response ||
            response.trim().length === 0
        ) {

            throw new Error(
                "Test Generator returned an empty response."
            );
        }

        // ==========================================
        // Normalize Response
        // ==========================================

        let normalized =
            response
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .trim();

        // ==========================================
        // Remove Markdown Code Fences
        // ==========================================

        normalized =
            normalized
                .replace(
                    /```(?:typescript|ts|javascript|js)?/gi,
                    ""
                )
                .replace(
                    /```/g,
                    ""
                )
                .trim();

        // ==========================================
        // Generated Files
        // ==========================================

        const files: TestScript[] = [];

        // ==========================================
        // Strategy 1
        //
        // Expected:
        //
        // ===== FILE: tests/Login.spec.ts
        //
        // import ...
        //
        // ===== FILE: tests/Register.spec.ts
        //
        // import ...
        // ==========================================

        const explicitFilePattern =
            /(?:^|\n)\s*={3,}\s*FILE:\s*([^\n]+)\n([\s\S]*?)(?=\n\s*={3,}\s*FILE:|\s*$)/gi;

        let match: RegExpExecArray | null;

        while (
            (
                match =
                    explicitFilePattern.exec(
                        normalized
                    )
            ) !== null
        ) {

            const fileName =
                this.normalizeFileName(
                    match[1]
                );

            const content =
                this.cleanContent(
                    match[2]
                );

            this.addFile(
                files,
                fileName,
                content
            );
        }

        // ==========================================
        // If FILE format worked, return files
        // ==========================================

        if (
            files.length > 0
        ) {

            return this.createOutput(
                files
            );
        }

        // ==========================================
        // Strategy 2
        //
        // Support:
        //
        // ### Login.spec.ts
        //
        // or:
        //
        // Login.spec.ts
        //
        // import ...
        // ==========================================

        const filenamePattern =
            /(?:^|\n)\s*(?:#{1,6}\s*)?(?:tests[\\/])?([A-Za-z0-9_.-]+\.spec\.ts)\s*(?:\n|:)/gi;

        const matches =
            [
                ...normalized.matchAll(
                    filenamePattern
                )
            ];

        for (
            let index = 0;
            index < matches.length;
            index++
        ) {

            const current =
                matches[index];

            const fileName =
                this.normalizeFileName(
                    current[1]
                );

            const start =
                current.index !== undefined
                    ? current.index + current[0].length
                    : -1;

            if (
                start < 0
            ) {

                continue;
            }

            const next =
                matches[index + 1];

            const end =
                next?.index !== undefined
                    ? next.index
                    : normalized.length;

            const content =
                this.cleanContent(
                    normalized.slice(
                        start,
                        end
                    )
                );

            this.addFile(
                files,
                fileName,
                content
            );
        }

        // ==========================================
        // Strategy 3
        //
        // Support fenced code when filename
        // appears immediately before the block.
        // ==========================================

        if (
            files.length === 0
        ) {

            const fencedPattern =
                /(?:^|\n)\s*(?:#{1,6}\s*)?(?:tests[\\/])?([A-Za-z0-9_.-]+\.spec\.ts)\s*\n\s*```(?:typescript|ts|javascript|js)?\s*\n([\s\S]*?)```/gi;

            while (
                (
                    match =
                        fencedPattern.exec(
                            response
                        )
                ) !== null
            ) {

                const fileName =
                    this.normalizeFileName(
                        match[1]
                    );

                const content =
                    this.cleanContent(
                        match[2]
                    );

                this.addFile(
                    files,
                    fileName,
                    content
                );
            }
        }

        // ==========================================
        // Final Validation
        // ==========================================

        if (
            files.length === 0
        ) {

            console.warn(
                "\n⚠️ Test Generator response could not be parsed."
            );

            console.warn(
                "\nResponse Preview:\n"
            );

            console.warn(
                response.substring(
                    0,
                    3000
                )
            );

            throw new Error(
                "No valid .spec.ts test scripts generated."
            );
        }

        // ==========================================
        // Return Unique Files
        // ==========================================

        return this.createOutput(
            files
        );
    }

    // ==========================================
    // Clean Generated Content
    // ==========================================

    private cleanContent(
        content: string
    ): string {

        let cleaned =
            content.trim();

        // Remove accidental Markdown fences
        cleaned =
            cleaned
                .replace(
                    /^```(?:typescript|ts|javascript|js)?\s*/i,
                    ""
                )
                .replace(
                    /\s*```$/i,
                    ""
                )
                .trim();

        return cleaned;
    }

    // ==========================================
    // Normalize Filename
    // ==========================================

    private normalizeFileName(
        fileName: string
    ): string {

        let normalized =
            fileName
                .trim()
                .replace(
                    /^["'`]+/,
                    ""
                )
                .replace(
                    /["'`]+$/,
                    ""
                )
                .trim();

        // Remove tests/ prefix
        normalized =
            normalized.replace(
                /^tests[\\/]/i,
                ""
            );

        // Prevent absolute paths
        normalized =
            normalized.replace(
                /^.*[\\/]/,
                ""
            );

        return normalized.trim();
    }

    // ==========================================
    // Normalize Framework Imports
    // ==========================================

    private normalizeImports(
        content: string
    ): string {

        return content

            // ------------------------------------------
            // ../pages/LoginPage
            // →
            // ../framework/pages/LoginPage
            // ------------------------------------------

            .replace(
                /from\s+["']\.\.\/pages\/([^"']+)["']/g,
                'from "../framework/pages/$1"'
            )

            // ------------------------------------------
            // ../testFixture
            // →
            // ../framework/fixtures/testFixture
            // ------------------------------------------

            .replace(
                /from\s+["']\.\.\/testFixture["']/g,
                'from "../framework/fixtures/testFixture"'
            )

            // ------------------------------------------
            // ../fixtures/testFixture
            // →
            // ../framework/fixtures/testFixture
            // ------------------------------------------

            .replace(
                /from\s+["']\.\.\/fixtures\/([^"']+)["']/g,
                'from "../framework/fixtures/$1"'
            )

            // ------------------------------------------
            // ../utils/SomeUtility
            // →
            // ../framework/utils/SomeUtility
            // ------------------------------------------

            .replace(
                /from\s+["']\.\.\/utils\/([^"']+)["']/g,
                'from "../framework/utils/$1"'
            )

            // ------------------------------------------
            // ../data/testData
            // →
            // ../framework/data/testData
            // ------------------------------------------

            .replace(
                /from\s+["']\.\.\/data\/([^"']+)["']/g,
                'from "../framework/data/$1"'
            );
    }

    // ==========================================
    // Add Valid Test File
    // ==========================================

    private addFile(
        files: TestScript[],
        fileName: string,
        content: string
    ): void {

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
                `⚠️ Ignoring invalid test filename: ${fileName}`
            );

            return;
        }

        // ==========================================
        // Validate Content
        // ==========================================

        if (
            !content ||
            content.trim().length === 0
        ) {

            console.warn(
                `⚠️ Ignoring empty test file: ${fileName}`
            );

            return;
        }

        // ==========================================
        // Basic Playwright Validation
        // ==========================================

        const hasPlaywrightImport =
            content.includes(
                "@playwright/test"
            );

        const hasTestUsage =
            content.includes(
                "test("
            ) ||
            content.includes(
                "test.describe"
            ) ||
            content.includes(
                "test.only"
            ) ||
            content.includes(
                "test.skip"
            );

        if (
            !hasPlaywrightImport ||
            !hasTestUsage
        ) {

            console.warn(
                `⚠️ Ignoring invalid Playwright test: ${fileName}`
            );

            return;
        }

        // ==========================================
        // Normalize Framework Imports
        // ==========================================

        const normalizedContent =
            this.normalizeImports(
                content
            );

        // ==========================================
        // Prevent Duplicate Filename
        // ==========================================

        const existing =
            files.find(
                file =>
                    file.fileName ===
                    fileName
            );

        if (
            existing
        ) {

            console.warn(
                `⚠️ Duplicate test file ignored: ${fileName}`
            );

            return;
        }

        // ==========================================
        // Add File
        // ==========================================

        files.push({
            fileName,
            content: normalizedContent
        });
    }

    // ==========================================
    // Create Parser Output
    // ==========================================

    private createOutput(
        files: TestScript[]
    ): TestGenerationOutput {

        const uniqueFiles =
            new Map<string, TestScript>();

        for (
            const file of files
        ) {

            uniqueFiles.set(
                file.fileName,
                file
            );
        }

        return {
            files:
                Array.from(
                    uniqueFiles.values()
                )
        };
    }
}