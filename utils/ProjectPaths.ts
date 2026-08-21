import path from "path";

const ROOT = process.cwd();

export const ProjectPaths = {

    // ==========================================
    // Project
    // ==========================================

    root: ROOT,


    // ==========================================
    // Input
    // ==========================================

    input: path.join(
        ROOT,
        "input"
    ),

    knowledge: path.join(
        ROOT,
        "input",
        "knowledge"
    ),

    requirements: path.join(
        ROOT,
        "input",
        "requirements"
    ),


    // ==========================================
    // Output
    // ==========================================

    output: path.join(
        ROOT,
        "output"
    ),

    framework: path.join(
        ROOT,
        "output",
        "framework"
    ),

    tests: path.join(
        ROOT,
        "output",
        "tests"
    ),

    reports: path.join(
        ROOT,
        "output",
        "reports"
    ),


    // ==========================================
    // Planner
    // ==========================================

    frameworkPlan: path.join(
        ROOT,
        "output",
        "framework-plan.json"
    ),


    // ==========================================
    // Requirement Agent
    // ==========================================

    agent2Input: path.join(
        ROOT,
        "output",
        "agent2-input"
    ),


    // ==========================================
    // Reports
    // ==========================================

    execution: path.join(
        ROOT,
        "output",
        "execution.json"
    ),

    coverage: path.join(
        ROOT,
        "output",
        "coverage.json"
    ),

    review: path.join(
        ROOT,
        "output",
        "review.json"
    ),

    healingReport: path.join(
        ROOT,
        "output",
        "healing-report.json"
    ),


    // ==========================================
    // Allure
    // ==========================================

    allureResults: path.join(
        ROOT,
        "output",
        "reports",
        "allure-results"
    ),

    allureReport: path.join(
        ROOT,
        "output",
        "reports",
        "allure-report"
    )

};