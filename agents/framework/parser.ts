import {
    FrameworkFile,
    FrameworkOutput
} from "./types";


export class FrameworkParser {

    private readonly expectedFiles = [
        "pages/BasePage.ts",
        "pages/LoginPage.ts",
        "pages/DashboardPage.ts",
        "pages/ForgotPasswordPage.ts",
        "fixtures/testFixture.ts",
        "utils/WaitHelper.ts",
        "utils/Logger.ts"
    ];


    // ==========================================
    // Parse Framework Response
    // ==========================================

    public parse(
        response: string
    ): FrameworkOutput {

        if (
            !response ||
            response.trim().length === 0
        ) {

            throw new Error(
                "Framework Agent returned an empty response."
            );
        }


        // ==========================================
        // Normalize Response
        // ==========================================

        let normalized =
            response
                .replace(/\r\n/g, "\n")
                .trim();


        // ==========================================
        // Remove Markdown Fences
        // ==========================================

        normalized =
            normalized
                .replace(
                    /```typescript/gi,
                    ""
                )
                .replace(
                    /```ts/gi,
                    ""
                )
                .replace(
                    /```javascript/gi,
                    ""
                )
                .replace(
                    /```js/gi,
                    ""
                )
                .replace(
                    /```/g,
                    ""
                )
                .trim();


        // ==========================================
        // Extract Files
        // ==========================================

        const files: FrameworkFile[] = [];


        const sections =
            normalized
                .split("===== FILE:")
                .map(
                    section =>
                        section.trim()
                )
                .filter(
                    section =>
                        section.length > 0
                );


        // ==========================================
        // Parse Each File
        // ==========================================

        for (
            const section of sections
        ) {

            const lines =
                section.split("\n");


            if (
                lines.length < 2
            ) {

                continue;
            }


            let fileName =
                lines[0]
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


            const content =
                lines
                    .slice(1)
                    .join("\n")
                    .trim();


            // ==========================================
            // Normalize Path
            // ==========================================

            fileName =
                fileName
                    .replace(
                        /\\/g,
                        "/"
                    )
                    .replace(
                        /^.*[\\/]/,
                        ""
                    );


            // ==========================================
            // IMPORTANT
            //
            // The previous implementation could remove
            // the pages/ portion from valid paths.
            //
            // Restore based on filename.
            // ==========================================

            const pathMap: Record<string, string> = {

                "BasePage.ts":
                    "pages/BasePage.ts",

                "LoginPage.ts":
                    "pages/LoginPage.ts",

                "DashboardPage.ts":
                    "pages/DashboardPage.ts",

                "ForgotPasswordPage.ts":
                    "pages/ForgotPasswordPage.ts",

                "testFixture.ts":
                    "fixtures/testFixture.ts",

                "WaitHelper.ts":
                    "utils/WaitHelper.ts",

                "Logger.ts":
                    "utils/Logger.ts"
            };


            if (
                pathMap[fileName]
            ) {

                fileName =
                    pathMap[fileName];
            }


            // ==========================================
            // Validate Filename
            // ==========================================

            if (
                !this.expectedFiles.includes(
                    fileName
                )
            ) {

                console.warn(
                    `⚠️ Ignoring unexpected framework file: ${fileName}`
                );

                continue;
            }


            // ==========================================
            // Validate Content
            // ==========================================

            if (
                content.length === 0
            ) {

                console.warn(
                    `⚠️ Ignoring empty framework file: ${fileName}`
                );

                continue;
            }


            files.push({
                fileName,
                content
            });
        }


        // ==========================================
        // Remove Duplicate Files
        // ==========================================

        const uniqueFiles =
            new Map<
                string,
                FrameworkFile
            >();


        for (
            const file of files
        ) {

            uniqueFiles.set(
                file.fileName,
                file
            );
        }


        const finalFiles =
            Array.from(
                uniqueFiles.values()
            );


        // ==========================================
        // Validate Required Files
        // ==========================================

        const missingFiles =
            this.expectedFiles.filter(
                expected =>
                    !finalFiles.some(
                        file =>
                            file.fileName === expected
                    )
            );


        if (
            missingFiles.length > 0
        ) {

            console.error(
                "\n⚠️ Missing framework files:"
            );


            for (
                const file of missingFiles
            ) {

                console.error(
                    `   - ${file}`
                );
            }


            throw new Error(
                `Framework generation incomplete. Missing ${missingFiles.length} required file(s).`
            );
        }


        // ==========================================
        // Framework Validation
        // ==========================================

        this.validateFramework(
            finalFiles
        );


        return {
            files: finalFiles
        };
    }


    // ==========================================
    // Validate Framework
    // ==========================================

    private validateFramework(
        files: FrameworkFile[]
    ): void {

        const fileMap =
            new Map(
                files.map(
                    file => [
                        file.fileName,
                        file.content
                    ]
                )
            );


        const basePage =
            fileMap.get(
                "pages/BasePage.ts"
            ) ?? "";


        const loginPage =
            fileMap.get(
                "pages/LoginPage.ts"
            ) ?? "";


        const dashboardPage =
            fileMap.get(
                "pages/DashboardPage.ts"
            ) ?? "";


        const forgotPasswordPage =
            fileMap.get(
                "pages/ForgotPasswordPage.ts"
            ) ?? "";


        const waitHelper =
            fileMap.get(
                "utils/WaitHelper.ts"
            ) ?? "";


        const errors: string[] = [];


        // ==========================================
        // Helper
        // Accept both:
        //
        // from "@playwright/test"
        //
        // and:
        //
        // from '@playwright/test'
        // ==========================================

        const importsPlaywright =
            (content: string): boolean => {

                return /from\s+["']@playwright\/test["']/
                    .test(content);
            };


        // ==========================================
        // BasePage
        // ==========================================

        if (
            !importsPlaywright(
                basePage
            )
        ) {

            errors.push(
                "BasePage.ts must import Playwright types from @playwright/test."
            );
        }


        if (
            !/\bPage\b/.test(
                basePage
            )
        ) {

            errors.push(
                "BasePage.ts must use the Playwright Page type."
            );
        }


        if (
            basePage.includes(
                "private readonly page"
            )
        ) {

            errors.push(
                "BasePage.ts page property must not be private because child Page Objects need access."
            );
        }


        // ==========================================
        // Page Objects
        // ==========================================

        const pageObjects = [
            [
                "LoginPage.ts",
                loginPage
            ],
            [
                "DashboardPage.ts",
                dashboardPage
            ],
            [
                "ForgotPasswordPage.ts",
                forgotPasswordPage
            ]
        ] as const;


        for (
            const [
                fileName,
                content
            ] of pageObjects
        ) {

            // ------------------------------------------
            // Playwright Import
            // ------------------------------------------

            if (
                !importsPlaywright(
                    content
                )
            ) {

                errors.push(
                    `${fileName} must import Page from @playwright/test.`
                );
            }


            // ------------------------------------------
            // Page Object inheritance
            // ------------------------------------------

            if (
                !content.includes(
                    "extends BasePage"
                )
            ) {

                errors.push(
                    `${fileName} must extend BasePage.`
                );
            }


            // ------------------------------------------
            // Constructor
            // ------------------------------------------

            if (
                !content.includes(
                    "super(page)"
                )
            ) {

                errors.push(
                    `${fileName} must call super(page).`
                );
            }


            // ------------------------------------------
            // Invalid Python-style method
            // ------------------------------------------

            if (
                content.includes(
                    "navigate_to"
                )
            ) {

                errors.push(
                    `${fileName} must use navigateTo(), not navigate_to().`
                );
            }
        }


        // ==========================================
        // WaitHelper
        // ==========================================

        if (
            !importsPlaywright(
                waitHelper
            )
        ) {

            errors.push(
                "WaitHelper.ts must import Page from @playwright/test."
            );
        }


        // ==========================================
        // Undefined wait usage
        // ==========================================

        for (
            const file of files
        ) {

            if (
                file.content.includes(
                    "this.wait,"
                )
                ||
                (
                    file.content.includes(
                        "waitForSelector("
                    )
                    &&
                    !file.content.includes(
                        "async waitForSelector"
                    )
                    &&
                    !file.content.includes(
                        ".waitForSelector"
                    )
                )
            ) {

                errors.push(
                    `${file.fileName} contains an invalid waitForSelector usage.`
                );
            }
        }


        // ==========================================
        // Report Validation Errors
        // ==========================================

        if (
            errors.length > 0
        ) {

            console.error(
                "\n======================================="
            );

            console.error(
                "FRAMEWORK VALIDATION FAILED"
            );

            console.error(
                "=======================================\n"
            );


            for (
                const error of errors
            ) {

                console.error(
                    `❌ ${error}`
                );
            }


            throw new Error(
                `Framework validation failed with ${errors.length} error(s).`
            );
        }


        // ==========================================
        // Validation Passed
        // ==========================================

        console.log(
            "\n✓ Framework validation passed"
        );
    }
}