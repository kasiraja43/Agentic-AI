import { ReportingAgent } from "../agents/reporting/ReportingAgent";
import { ProjectPaths } from "../utils/ProjectPaths";

export async function runReporting(): Promise<void> {

    console.log(
        "\n====================================="
    );

    console.log(
        "        REPORTING AGENT"
    );

    console.log(
        "=====================================\n"
    );


    const resultsDir =
        ProjectPaths.allureResults;

    const reportDir =
        ProjectPaths.allureReport;


    console.log(
        "Allure Results:"
    );

    console.log(
        resultsDir
    );


    console.log(
        "\nAllure Report:"
    );

    console.log(
        reportDir
    );


    const agent =
        new ReportingAgent();


    await agent.generateReport(
        resultsDir,
        reportDir
    );


    console.log(
        "\n✅ Reporting Completed"
    );

    console.log(
        `Allure Report: ${reportDir}`
    );
}


// ==========================================
// Direct Runner
// ==========================================

