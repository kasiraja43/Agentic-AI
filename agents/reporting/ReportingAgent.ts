import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class ReportingAgent {

    // ==========================================
    // Generate Allure Report
    // ==========================================

    public async generateReport(
        resultsDir: string,
        reportDir: string
    ): Promise<void> {

        console.log(
            "\n====================================="
        );

        console.log(
            "        REPORTING AGENT"
        );

        console.log(
            "=====================================\n"
        );


        // ==========================================
        // Validate Results Directory
        // ==========================================

        console.log(
            "Allure Results:"
        );

        console.log(
            resultsDir
        );


        try {

            await fs.access(
                resultsDir
            );

        } catch {

            throw new Error(
                `Allure results directory not found:\n${resultsDir}`
            );
        }


        // ==========================================
        // Create Report Directory
        // ==========================================

        await fs.mkdir(
            reportDir,
            {
                recursive: true
            }
        );


        console.log(
            "\nGenerating Allure Report..."
        );


        // ==========================================
        // Generate Allure HTML Report
        // ==========================================

        const command =
            `npx allure generate "${resultsDir}" -o "${reportDir}" --clean`;


        console.log(
            `Executing: ${command}`
        );


        try {

            const {
                stdout,
                stderr
            } = await execAsync(
                command,
                {
                    windowsHide: true
                }
            );


            if (
                stdout
            ) {

                console.log(
                    stdout
                );
            }


            if (
                stderr
            ) {

                console.log(
                    stderr
                );
            }

        } catch (error) {

            console.error(
                "\n❌ Allure report generation failed"
            );

            console.error(
                error
            );

            throw error;
        }


        // ==========================================
        // Validate Generated Report
        // ==========================================

        const indexFile =
            path.join(
                reportDir,
                "index.html"
            );


        try {

            await fs.access(
                indexFile
            );

        } catch {

            throw new Error(
                `Allure report was not generated:\n${indexFile}`
            );
        }


        console.log(
            "\n✓ Allure Report Generated"
        );

        console.log(
            `Report Location: ${reportDir}`
        );

        console.log(
            `Report Entry: ${indexFile}`
        );
    }
}