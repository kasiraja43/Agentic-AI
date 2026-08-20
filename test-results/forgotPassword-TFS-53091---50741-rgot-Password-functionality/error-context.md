# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: forgotPassword.spec.ts >> TFS-53091 - Verify Forgot Password functionality
- Location: output\tests\forgotPassword.spec.ts:6:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#email')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - heading "Example Domain" [level=1] [ref=e3]
  - paragraph [ref=e4]: This domain is for use in documentation examples without needing permission. Avoid use in operations.
  - paragraph [ref=e5]:
    - link "Learn more" [ref=e6] [cursor=pointer]:
      - /url: https://iana.org/domains/example
```

# Test source

```ts
  1  | import {
  2  |     test,
  3  |     expect
  4  | } from "@playwright/test";
  5  | 
  6  | test(
  7  |     "TFS-53091 - Verify Forgot Password functionality",
  8  |     async ({ page }) => {
  9  |         // Navigate to forgot password page
  10 |         await page.goto("https://example.com/forgot-password");
  11 | 
  12 |         // Fill email input
> 13 |         await page.locator("#email").fill("test@example.com");
     |                                      ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  14 | 
  15 |         // Click submit button
  16 |         await page.locator("#submit").click();
  17 | 
  18 |         // Verify success message
  19 |         await expect(page.locator("#successMessage")).toBeVisible();
  20 |     }
  21 | );
```