import { defineConfig } from "@playwright/test";

export default defineConfig({

    // ==========================================
    // Test Location
    // ==========================================

    testDir: "./output/tests",


    // ==========================================
    // Test Execution
    // ==========================================

    timeout: 30_000,

    fullyParallel: false,

    retries: 0,


    // ==========================================
    // Reporters
    // ==========================================

     reporter: [
        ["list"],

        [
            "allure-playwright",
            {
                resultsDir: "output/reports/allure-results"
            }
        ]
    ],


    // ==========================================
    // Browser Settings
    // ==========================================

    use: {

        headless: false,

        screenshot: "only-on-failure",

        video: "retain-on-failure",

        trace: "retain-on-failure"
    }

});