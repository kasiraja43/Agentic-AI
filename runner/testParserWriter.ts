import fs from "fs/promises";

import { TestCaseParser } from "../agents/testcase/parser";
import { TestFileWriter } from "../utils/TestFileWriter";

async function main(): Promise<void> {

    console.log("\n=====================================");
    console.log("     TEST PARSER / WRITER TEST");
    console.log("=====================================\n");

    // ==========================================
    // Fake Ollama Response
    // ==========================================

    const fakeOllamaResponse = `
===== FILE: tests/sample.spec.ts

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { authFixture } from "../testFixture";

test("Sample Playwright Test", async ({ page }) => {

    const loginPage = new LoginPage(page);

    await page.goto("https://example.com");

    await expect(page).toHaveTitle(/Example/);

});

===== FILE: tests/login.spec.ts

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { testFixture } from "../testFixture";

test("Login Test", async ({ page }) => {

    const loginPage = new LoginPage(page);

    await page.goto("https://example.com/login");

});
`;

    // ==========================================
    // Parse Response
    // ==========================================

    console.log("Parsing fake Ollama response...\n");

    const parser =
        new TestCaseParser();

    const parsed =
        parser.parse(
            fakeOllamaResponse
        );

    console.log(
        `✓ Parsed ${parsed.files.length} test files\n`
    );

    for (
        const file of parsed.files
    ) {

        console.log(
            `- ${file.fileName}`
        );
    }

    // ==========================================
    // Write Files
    // ==========================================

    const outputFolder =
        "output/tests-parser-test";

    console.log(
        "\nWriting parsed files...\n"
    );

    const writer =
        new TestFileWriter();

    await writer.write(
        parsed,
        outputFolder
    );

    // ==========================================
    // Read Back Generated Files
    // ==========================================

    console.log(
        "\nChecking generated files...\n"
    );

    for (
        const file of parsed.files
    ) {

        const filePath =
            `${outputFolder}/${file.fileName}`;

        const content =
            await fs.readFile(
                filePath,
                "utf8"
            );

        console.log(
            `===== ${file.fileName} =====`
        );

        console.log(
            content
        );

        console.log("");
    }

    console.log(
        "====================================="
    );

    console.log(
        "     PARSER TEST COMPLETED"
    );

    console.log(
        "=====================================\n"
    );
}

main().catch(
    error => {

        console.error(
            "\n❌ Parser / Writer test failed"
        );

        console.error(
            error
        );

        process.exit(1);
    }
);