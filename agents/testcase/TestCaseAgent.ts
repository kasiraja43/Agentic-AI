import fs from "fs/promises";
import path from "path";

import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

import { ProjectPaths } from "../../utils/ProjectPaths";

export class TestCaseAgent {

    constructor(
        private readonly model: ChatOllama
    ) {}

    // ==========================================
    // Generate Playwright Tests
    // ==========================================

    public async generateTests(
        testCaseFile: string,
        frameworkPlanFile: string
    ): Promise<string> {

        console.log(
            "\n====================================="
        );

        console.log(
            "     PLAYWRIGHT TEST GENERATOR"
        );

        console.log(
            "=====================================\n"
        );


        // ==========================================
        // Load Test Cases
        // ==========================================

        console.log(
            "Loading Test Cases..."
        );

        const testCases =
            await fs.readFile(
                testCaseFile,
                "utf8"
            );

        if (
            !testCases.trim()
        ) {

            throw new Error(
                "Test case file is empty."
            );
        }

        console.log(
            "✓ Test Cases Loaded"
        );


        // ==========================================
        // Load Framework Plan
        // ==========================================

        console.log(
            "Loading Framework Plan..."
        );

        const frameworkPlan =
            await fs.readFile(
                frameworkPlanFile,
                "utf8"
            );

        if (
            !frameworkPlan.trim()
        ) {

            throw new Error(
                "Framework plan is empty."
            );
        }

        console.log(
            "✓ Framework Plan Loaded"
        );


        // ==========================================
        // Load Actual Generated Framework
        // ==========================================

        console.log(
            "Loading Generated Framework..."
        );

        const generatedFramework =
            await this.readFrameworkFiles(
                ProjectPaths.framework
            );

        console.log(
            "✓ Generated Framework Loaded"
        );


        // ==========================================
        // Build Framework Contract
        // ==========================================

        console.log(
            "Building Framework Contract..."
        );

        const frameworkContract =
            this.buildFrameworkContract(
                generatedFramework
            );

        console.log(
            "✓ Framework Contract Created"
        );

        console.log(
            `Framework Contract Size: ${frameworkContract.length} characters`
        );


        // ==========================================
        // Debug Framework Contract
        // ==========================================

        console.log(
            "\n========== FRAMEWORK CONTRACT ==========\n"
        );

        console.log(
            frameworkContract
        );

        console.log(
            "\n========================================\n"
        );


        // ==========================================
        // Load Test Generator Prompt
        // ==========================================

        console.log(
            "Loading Test Generator Prompt..."
        );

        const promptPath =
            path.join(
                process.cwd(),
                "agents",
                "testcase",
                "prompt.md"
            );


        try {

            await fs.access(
                promptPath
            );

        } catch {

            throw new Error(
                `Test Generator prompt not found:\n${promptPath}`
            );
        }


        let prompt =
            await fs.readFile(
                promptPath,
                "utf8"
            );


        if (
            !prompt.trim()
        ) {

            throw new Error(
                "Test Generator prompt is empty."
            );
        }


        console.log(
            "✓ Prompt Loaded"
        );


        // ==========================================
        // Replace Prompt Placeholders
        // ==========================================

        prompt =
            prompt
                .replace(
                    "{{TEST_CASES}}",
                    testCases
                )
                .replace(
                    "{{FRAMEWORK_PLAN}}",
                    frameworkPlan
                )
                .replace(
                    "{{GENERATED_FRAMEWORK}}",
                    generatedFramework
                );


        // ==========================================
        // Add Strong Framework Contract
        // ==========================================

        prompt += `

==================================================
FINAL FRAMEWORK CONTRACT
==================================================

The following contract was extracted directly from
the ACTUAL generated Playwright framework.

THIS CONTRACT IS THE SOURCE OF TRUTH.

Do NOT trust assumptions from the Framework Plan
when they conflict with this contract.

If the Framework Plan and Generated Framework
conflict:

USE THE GENERATED FRAMEWORK.

==================================================
${frameworkContract}
==================================================


==================================================
STRICT TEST GENERATION RULES
==================================================

RULE 1
Generate ONLY Playwright .spec.ts files.

RULE 2
NEVER generate Page Objects.

RULE 3
NEVER generate BasePage.ts.

RULE 4
NEVER generate LoginPage.ts.

RULE 5
NEVER generate DashboardPage.ts.

RULE 6
NEVER generate ForgotPasswordPage.ts.

RULE 7
NEVER generate fixture files.

RULE 8
NEVER generate utility files.

RULE 9
NEVER generate test-data files.

RULE 10
NEVER generate framework files.

RULE 11
NEVER invent Page Objects.

RULE 12
NEVER invent Page Object methods.

RULE 13
NEVER invent Page Object properties.

RULE 14
NEVER invent fixture names.

RULE 15
NEVER invent utility names.

RULE 16
NEVER invent URLs.

RULE 17
NEVER invent selectors when an existing Page Object
method can perform the operation.

RULE 18
NEVER access protected Page Object properties.

RULE 19
NEVER access private Page Object properties.

RULE 20
ONLY use methods explicitly present in the Framework
Contract.

RULE 21
ONLY use classes explicitly present in the Framework
Contract.

RULE 22
ONLY use exports explicitly present in the Framework
Contract.

RULE 23
If a method does not exist in the Framework Contract,
DO NOT call it.

RULE 24
If a Page Object does not exist in the Framework
Contract, DO NOT import it.

RULE 25
If a fixture does not exist in the Framework Contract,
DO NOT use it.

==================================================
PAGE OBJECT API RULE
==================================================

Before using a Page Object:

1. Find the Page Object in the Framework Contract.
2. Find the required method.
3. Verify the method name exactly.
4. Verify the method parameters.
5. Use only that method.

Example:

If the contract contains:

CLASS: LoginPage

METHOD: login(username: string, password: string)

then this is valid:

const loginPage =
    new LoginPage(page);

await loginPage.login(
    username,
    password
);


This is INVALID unless explicitly listed:

await loginPage.gotoLoginPage();

await loginPage.isLoginPageVisible();

await loginPage.fillRegistrationForm();

await loginPage.submitLogin();

==================================================
PROTECTED PROPERTY RULE
==================================================

NEVER access:

pageObject.page

pageObject.usernameInput

pageObject.passwordInput

pageObject.loginButton

pageObject.emailInput

or any protected/private property.

Example of INVALID code:

await forgotPasswordPage.page.getByText("Success");

Instead use the test's Playwright page:

await expect(
    page.getByText("Success")
).toBeVisible();


==================================================
FIXTURE RULE
==================================================

Fixtures MUST come from:

../framework/fixtures/


If the framework contains:

export const test = base.extend<Fixtures>(...)

then use:

import { test } from "../framework/fixtures/testFixture";


If the fixture type contains:

dataFixture

then access it through the test callback:

test(
    "Test",
    async ({
        page,
        dataFixture
    }) => {

        // use dataFixture here

    }
);


DO NOT write:

import {
    dataFixture
} from "../framework/fixtures/testFixture";


unless dataFixture is explicitly exported as a
standalone constant.

==================================================
PLAYWRIGHT IMPORT RULE
==================================================

Use:

import {
    test,
    expect
} from "@playwright/test";


OR use the framework fixture when required:

import {
    test
} from "../framework/fixtures/testFixture";


NEVER use:

require("@playwright/test")


NEVER use CommonJS.

==================================================
TEST LOCATION
==================================================

Generated test files belong to:

output/tests/


Therefore Page Object imports MUST use:

../framework/pages/


Fixture imports MUST use:

../framework/fixtures/


Utility imports MUST use:

../framework/utils/


Data imports MUST use:

../framework/data/


==================================================
URL RULE
==================================================

Only use URLs explicitly provided by:

1. Manual Test Cases
2. Generated Framework
3. Framework Contract

DO NOT invent:

https://example.com

https://example.com/login

https://example.com/register


==================================================
SELECTOR RULE
==================================================

Do NOT invent selectors.

Prefer Page Object methods.

If a Page Object exposes:

login(username, password)

use:

await loginPage.login(
    username,
    password
);


Do NOT duplicate:

page.locator(...)

when an appropriate Page Object method already exists.

==================================================
ASSERTION RULE
==================================================

Use Playwright assertions.

Examples:

await expect(
    page.getByText("Success")
).toBeVisible();


await expect(
    page
).toHaveURL(...);


If an existing Page Object exposes:

isDashboardVisible()

then this is allowed:

const visible =
    await dashboardPage.isDashboardVisible();

expect(visible).toBe(true);


Do NOT invent assertion methods.

==================================================
TEST DATA RULE
==================================================

Use only test data provided by:

1. Manual Test Cases
2. Framework Contract
3. Existing generated framework

Do NOT invent:

username
password
email
customer information
URLs
business values


==================================================
TEST CASE RULE
==================================================

Generate tests strictly from the supplied manual
test cases.

Do NOT invent business requirements.

Do NOT remove important negative scenarios.

Preserve test case IDs whenever available.

Example:

test(
    "TFS-53091 - Verify Forgot Password functionality",
    async ({ page }) => {

        ...

    }
);


==================================================
OUTPUT FILE RULE
==================================================

Every output file MUST:

- start with tests/
- end with .spec.ts
- be unique
- contain executable TypeScript
- contain Playwright tests


Valid:

===== FILE: tests/loginValidation.spec.ts

===== FILE: tests/registerCustomer.spec.ts

===== FILE: tests/resetPassword.spec.ts


Invalid:

===== FILE: pages/LoginPage.ts

===== FILE: pages/BasePage.ts

===== FILE: fixtures/testFixture.ts

===== FILE: utils/Logger.ts

===== FILE: utils/WaitHelper.ts

===== FILE: LoginPage.ts

===== FILE: tests/LoginPage.ts


==================================================
OUTPUT FORMAT
==================================================

The FIRST line of the response MUST be:

===== FILE: tests/<filename>.spec.ts


Example:

===== FILE: tests/loginValidation.spec.ts

import {
    test,
    expect
} from "@playwright/test";

test(
    "Login validation",
    async ({ page }) => {

        // test code

    }
);


If multiple files are generated:

===== FILE: tests/loginValidation.spec.ts

<complete test>


===== FILE: tests/registerCustomer.spec.ts

<complete test>


===== FILE: tests/resetPassword.spec.ts

<complete test>


==================================================
ABSOLUTELY NO MARKDOWN
==================================================

DO NOT use:

\`\`\`

DO NOT use:

\`\`\`typescript

DO NOT use:

\`\`\`javascript


==================================================
ABSOLUTELY NO EXPLANATION
==================================================

Do NOT write:

Here are the tests.

Based on the requirements...

The generated tests are...

Explanation:

Summary:

Notes:

==================================================
FINAL VALIDATION
==================================================

Before returning the response verify:

1. First line starts with:

===== FILE: tests/

2. Every file ends with:

.spec.ts

3. Every file contains Playwright tests.

4. No Page Object class is created.

5. No fixture is created.

6. No utility is created.

7. No framework file is created.

8. No invented Page Object is used.

9. No invented Page Object method is used.

10. No invented fixture is used.

11. No invented utility is used.

12. No protected Page Object property is accessed.

13. No private Page Object property is accessed.

14. No invented URL is used.

15. No invented selector is used when a Page Object
    method exists.

16. No require() is used.

17. No Markdown fences are used.

18. No explanation is returned.

19. No text appears before the first FILE marker.

20. No text appears after the final test file.

==================================================
FINAL COMMAND
==================================================

RETURN ONLY THE GENERATED .spec.ts FILES.

NOTHING ELSE.
`;


        console.log(
            `\nPrompt Size : ${prompt.length}`
        );


        console.log(
            "\nSending Request To Ollama...\n"
        );


        // ==========================================
        // Call Ollama
        // ==========================================

        const start =
            Date.now();


        let response;

        try {

            response =
                await this.model.invoke([
                    new HumanMessage(
                        prompt
                    )
                ]);

        } catch (error) {

            console.error(
                "\n❌ Ollama Test Generation Failed"
            );

            console.error(
                error
            );

            throw error;
        }


        // ==========================================
        // Response Time
        // ==========================================

        const end =
            Date.now();


        const duration =
            (end - start) / 1000;


        console.log(
            `Ollama responded in ${duration.toFixed(2)} seconds`
        );


        console.log(
            "✓ Test Scripts Generated\n"
        );


        // ==========================================
        // Extract Response
        // ==========================================

        const rawResponse =
            this.extractResponseContent(
                response.content
            );


        if (
            !rawResponse.trim()
        ) {

            throw new Error(
                "Ollama returned an empty test generation response."
            );
        }


        // ==========================================
        // Debug Preview
        // ==========================================

        console.log(
            "Test Generator Response Preview:\n"
        );

        console.log(
            rawResponse.substring(
                0,
                3000
            )
        );


        if (
            rawResponse.length > 3000
        ) {

            console.log(
                "\n... response preview truncated ..."
            );
        }


        console.log(
            ""
        );


        return rawResponse;
    }


    // ==========================================
    // Build Framework Contract
    // ==========================================

    private buildFrameworkContract(
        framework: string
    ): string {

        const lines =
            framework.split("\n");

        const contract: string[] = [];

        let currentFile =
            "";


        for (
            const line of lines
        ) {

            // ==========================================
            // Detect Framework File
            // ==========================================

            if (
                line.startsWith(
                    "===== FRAMEWORK FILE:"
                )
            ) {

                currentFile =
                    line
                        .replace(
                            "===== FRAMEWORK FILE:",
                            ""
                        )
                        .trim();


                contract.push(
                    "",
                    `FILE: ${currentFile}`
                );


                continue;
            }


            // ==========================================
            // Exported Classes
            // ==========================================

            const classMatch =
                line.match(
                    /export\s+class\s+([A-Za-z0-9_]+)/
                );


            if (
                classMatch
            ) {

                contract.push(
                    `CLASS: ${classMatch[1]}`
                );

                continue;
            }


            // ==========================================
            // Exported Constants
            // ==========================================

            const constMatch =
                line.match(
                    /export\s+const\s+([A-Za-z0-9_]+)/
                );


            if (
                constMatch
            ) {

                contract.push(
                    `EXPORT: ${constMatch[1]}`
                );

                continue;
            }


            // ==========================================
            // Exported Functions
            // ==========================================

            const functionMatch =
                line.match(
                    /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/
                );


            if (
                functionMatch
            ) {

                contract.push(
                    `FUNCTION: ${functionMatch[1]}`
                );

                continue;
            }


            // ==========================================
            // Public / Async / Regular Methods
            // ==========================================

            const methodMatch =
                line.match(
                    /^\s*(?:public\s+)?(?:async\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)/
                );


            if (
                methodMatch
            ) {

                const methodName =
                    methodMatch[1];

                const parameters =
                    methodMatch[2];


                if (
                    methodName !== "constructor"
                ) {

                    contract.push(
                        `METHOD: ${methodName}(${parameters})`
                    );
                }


                continue;
            }


            // ==========================================
            // Protected / Private Properties
            // ==========================================

            const propertyMatch =
                line.match(
                    /^\s*(protected|private)\s+(?:readonly\s+)?([A-Za-z_][A-Za-z0-9_]*)/
                );


            if (
                propertyMatch
            ) {

                contract.push(
                    `INTERNAL ${propertyMatch[1].toUpperCase()}: ${propertyMatch[2]}`
                );

                continue;
            }
        }


        return contract.join(
            "\n"
        );
    }


    // ==========================================
    // Read Framework Files
    // ==========================================

    private async readFrameworkFiles(
        folder: string
    ): Promise<string> {

        const files: string[] = [];


        try {

            await fs.access(
                folder
            );

        } catch {

            throw new Error(
                `Generated framework directory not found:\n${folder}`
            );
        }


        await this.scanFolder(
            folder,
            files
        );


        if (
            files.length === 0
        ) {

            throw new Error(
                `No generated framework files found in:\n${folder}`
            );
        }


        return files.join(
            "\n\n"
        );
    }


    // ==========================================
    // Scan Framework Folder
    // ==========================================

    private async scanFolder(
        folder: string,
        files: string[]
    ): Promise<void> {

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
                path.join(
                    folder,
                    entry.name
                );


            // ==========================================
            // Directory
            // ==========================================

            if (
                entry.isDirectory()
            ) {

                await this.scanFolder(
                    fullPath,
                    files
                );


                continue;
            }


            // ==========================================
            // Only Read TypeScript Files
            // ==========================================

            if (
                !entry.name.endsWith(
                    ".ts"
                )
            ) {

                continue;
            }


            const content =
                await fs.readFile(
                    fullPath,
                    "utf8"
                );


            const relativePath =
                path.relative(
                    folder,
                    fullPath
                );


            files.push(
                `===== FRAMEWORK FILE: ${relativePath}\n${content}`
            );
        }
    }


    // ==========================================
    // Extract Ollama Response
    // ==========================================

    private extractResponseContent(
        content: unknown
    ): string {

        // ==========================================
        // Normal String
        // ==========================================

        if (
            typeof content === "string"
        ) {

            return content.trim();
        }


        // ==========================================
        // Structured LangChain Content
        // ==========================================

        if (
            Array.isArray(content)
        ) {

            return content
                .map(
                    item => {

                        if (
                            typeof item === "string"
                        ) {

                            return item;
                        }


                        if (
                            item &&
                            typeof item === "object" &&
                            "text" in item
                        ) {

                            const text =
                                (
                                    item as {
                                        text?: unknown
                                    }
                                ).text;


                            return typeof text === "string"
                                ? text
                                : "";
                        }


                        return "";
                    }
                )
                .join("")
                .trim();
        }


        // ==========================================
        // Fallback
        // ==========================================

        return String(
            content
        ).trim();
    }
}