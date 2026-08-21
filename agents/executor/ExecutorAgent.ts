import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

import { ProjectPaths } from "../../utils/ProjectPaths";

const execAsync = promisify(exec);

export class ExecutorAgent {

    public async execute(): Promise<void> {

        console.log("\n====================================");
        console.log("        PLAYWRIGHT EXECUTOR");
        console.log("====================================\n");


        // ==========================================
        // Paths
        // ==========================================

        const testsPath =
            ProjectPaths.tests;

        const reportPath =
            ProjectPaths.execution;


        console.log("Tests:");
        console.log(testsPath);

        console.log("\nExecution Report:");
        console.log(reportPath);


        // ==========================================
        // Ensure Output Directory
        // ==========================================

        await fs.mkdir(
            ProjectPaths.output,
            {
                recursive: true
            }
        );


        // ==========================================
        // Validate Tests Directory
        // ==========================================

        try {

            await fs.access(
                testsPath
            );

        } catch {

            const report = {

                success: false,

                exitCode: 1,

                error:
                    "Generated tests folder was not found.",

                suites: [],

                failedTests: [],

                passedTests: [],

                totalTests: 0

            };


            await this.writeReport(
                reportPath,
                report
            );


            throw new Error(
                `Generated tests folder not found:\n${testsPath}`
            );
        }


        // ==========================================
        // Check Spec Files
        // ==========================================

        const testFiles =
            await this.findSpecFiles(
                testsPath
            );


        console.log(
            `\nFound ${testFiles.length} Playwright test file(s).`
        );


        for (
            const file of testFiles
        ) {

            console.log(
                `  ✓ ${file}`
            );
        }


        if (
            testFiles.length === 0
        ) {

            const report = {

                success: false,

                exitCode: 1,

                error:
                    "No Playwright .spec.ts files found.",

                suites: [],

                failedTests: [],

                passedTests: [],

                totalTests: 0

            };


            await this.writeReport(
                reportPath,
                report
            );


            console.warn(
                "\n⚠️ No Playwright test files found."
            );

            return;
        }


        // ==========================================
        // Execute Playwright
        // ==========================================

        try {

            /*
             * IMPORTANT:
             *
             * playwright.config.ts already contains:
             *
             * testDir: "./output/tests"
             *
             * Therefore DO NOT pass output/tests
             * again to the Playwright command.
             */

            const command =
                `npx playwright test --reporter=json`;


            console.log(
                "\nExecuting:"
            );

            console.log(
                command
            );


            const {
                stdout,
                stderr
            } = await execAsync(

                command,

                {
                    cwd:
                        ProjectPaths.root,

                    maxBuffer:
                        20 * 1024 * 1024
                }

            );


            // ==========================================
            // Parse Report
            // ==========================================

            const report =
                this.parseReport(
                    stdout,
                    stderr
                );


            // ==========================================
            // Save Report
            // ==========================================

            await this.writeReport(
                reportPath,
                report
            );


            console.log(
                "\n✅ Playwright Execution Completed"
            );


            console.log(
                `Execution Report: ${reportPath}`
            );


        } catch (error: any) {

            console.log(
                "\n⚠️ Playwright returned a non-zero exit code."
            );


            const stdout =
                typeof error?.stdout === "string"
                    ? error.stdout
                    : "";


            const stderr =
                typeof error?.stderr === "string"
                    ? error.stderr
                    : "";


            const exitCode =
                Number(
                    error?.code ?? 1
                );


            // ==========================================
            // Parse Whatever Playwright Returned
            // ==========================================

            let report =
                this.parseReport(
                    stdout,
                    stderr
                );


            // ==========================================
            // Mark Execution Failed
            // ==========================================

            report = {

                ...report,

                success: false,

                exitCode

            };


            // ==========================================
            // Save Valid JSON
            // ==========================================

            await this.writeReport(
                reportPath,
                report
            );


            console.log(
                "\nExecution report generated."
            );


            console.log(
                `Execution Report: ${reportPath}`
            );


            if (
                stderr &&
                stderr.trim()
            ) {

                console.error(
                    "\nPlaywright Error:"
                );

                console.error(
                    stderr
                );
            }


            /*
             * Do NOT throw.
             *
             * The report is now available for
             * the Healer.
             */

            return;
        }
    }


    // ==========================================
    // Parse Playwright JSON
    // ==========================================

    private parseReport(
        stdout: string,
        stderr: string
    ): any {

        if (
            !stdout ||
            !stdout.trim()
        ) {

            return {

                success: false,

                exitCode: 1,

                error:
                    stderr ||
                    "Playwright returned no output.",

                suites: [],

                failedTests: [],

                passedTests: [],

                totalTests: 0

            };
        }


        // ==========================================
        // Direct JSON
        // ==========================================

        try {

            const parsed =
                JSON.parse(
                    stdout
                );


            return this.normalizeReport(
                parsed
            );

        } catch {
            // Continue
        }


        // ==========================================
        // Extract JSON Object
        // ==========================================

        const start =
            stdout.indexOf("{");


        const end =
            stdout.lastIndexOf("}");


        if (
            start !== -1 &&
            end !== -1 &&
            end > start
        ) {

            try {

                const parsed =
                    JSON.parse(
                        stdout.substring(
                            start,
                            end + 1
                        )
                    );


                return this.normalizeReport(
                    parsed
                );

            } catch {
                // Continue
            }
        }


        // ==========================================
        // Fallback
        // ==========================================

        return {

            success: false,

            exitCode: 1,

            error:
                stderr ||
                stdout,

            suites: [],

            failedTests: [],

            passedTests: [],

            totalTests: 0

        };
    }


    // ==========================================
    // Normalize Report
    // ==========================================

    private normalizeReport(
        report: any
    ): any {

        const failedTests: any[] = [];

        const passedTests: any[] = [];

        let totalTests = 0;


        this.collectTests(
            report,
            failedTests,
            passedTests
        );


        totalTests =
            failedTests.length +
            passedTests.length;


        return {

            ...report,

            success:
                failedTests.length === 0,

            exitCode:
                failedTests.length > 0
                    ? 1
                    : 0,

            failedTests,

            passedTests,

            totalTests

        };
    }


    // ==========================================
    // Collect Tests
    // ==========================================

    private collectTests(
        node: any,
        failedTests: any[],
        passedTests: any[]
    ): void {

        if (
            !node ||
            typeof node !== "object"
        ) {

            return;
        }


        // ==========================================
        // Specs
        // ==========================================

        if (
            Array.isArray(
                node.specs
            )
        ) {

            for (
                const spec of node.specs
            ) {

                if (
                    !Array.isArray(
                        spec.tests
                    )
                ) {

                    continue;
                }


                for (
                    const test of spec.tests
                ) {

                    const results =
                        Array.isArray(
                            test.results
                        )
                            ? test.results
                            : [];


                    const failed =
                        results.some(
                            (result: any) =>
                                result?.status === "failed" ||
                                result?.status === "timedOut"
                        );


                    const testInfo = {

                        title:
                            test.title ||
                            spec.title ||
                            "Unknown Test",

                        file:
                            spec.file ||
                            "",

                        results

                    };


                    if (
                        failed
                    ) {

                        failedTests.push(
                            testInfo
                        );

                    } else {

                        passedTests.push(
                            testInfo
                        );
                    }
                }
            }
        }


        // ==========================================
        // Nested Suites
        // ==========================================

        if (
            Array.isArray(
                node.suites
            )
        ) {

            for (
                const suite of node.suites
            ) {

                this.collectTests(
                    suite,
                    failedTests,
                    passedTests
                );
            }
        }
    }


    // ==========================================
    // Find Spec Files
    // ==========================================

    private async findSpecFiles(
        folder: string
    ): Promise<string[]> {

        const files: string[] = [];


        const entries =
            await fs.readdir(
                folder,
                {
                    withFileTypes: true
                }
            );


        for (
            const entry of entries
        ) {

            const fullPath =
                require("path").join(
                    folder,
                    entry.name
                );


            if (
                entry.isDirectory()
            ) {

                const nested =
                    await this.findSpecFiles(
                        fullPath
                    );


                files.push(
                    ...nested
                );


                continue;
            }


            if (
                entry.name.endsWith(
                    ".spec.ts"
                )
            ) {

                files.push(
                    fullPath
                );
            }
        }


        return files;
    }


    // ==========================================
    // Write Report
    // ==========================================

    private async writeReport(
        reportPath: string,
        report: any
    ): Promise<void> {

        await fs.writeFile(

            reportPath,

            JSON.stringify(
                report,
                null,
                2
            ),

            "utf8"
        );
    }
}