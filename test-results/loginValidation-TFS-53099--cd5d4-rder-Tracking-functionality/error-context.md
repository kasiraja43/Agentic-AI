# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loginValidation.spec.ts >> TFS-53099 - Verify Order Tracking functionality
- Location: output\tests\loginValidation.spec.ts:78:5

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('#order-id-input') to be visible

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
  9  |         await page.goto("https://example.com/forgot-password");
  10 |         await page.waitForSelector("#email-input", { timeout: 5000 });
  11 |         await expect(page.getByPlaceholder("Email")).toBeVisible();
  12 |     }
  13 | );
  14 | 
  15 | test(
  16 |     "TFS-53092 - Verify Login functionality",
  17 |     async ({ page }) => {
  18 |         await page.goto("https://example.com/login");
  19 |         await page.waitForSelector("#username-input", { timeout: 5000 });
  20 |         await expect(page.getByPlaceholder("Username")).toBeVisible();
  21 |     }
  22 | );
  23 | 
  24 | test(
  25 |     "TFS-53093 - Verify Dashboard navigation",
  26 |     async ({ page }) => {
  27 |         await page.goto("https://example.com/dashboard");
  28 |         await page.waitForSelector(".dashboard-title", { timeout: 5000 });
  29 |         await expect(page.getByText("Dashboard")).toBeVisible();
  30 |     }
  31 | );
  32 | 
  33 | test(
  34 |     "TFS-53094 - Verify Password Reset functionality",
  35 |     async ({ page }) => {
  36 |         await page.goto("https://example.com/reset-password");
  37 |         await page.waitForSelector("#reset-code-input", { timeout: 5000 });
  38 |         await expect(page.getByPlaceholder("Reset Code")).toBeVisible();
  39 |     }
  40 | );
  41 | 
  42 | test(
  43 |     "TFS-53095 - Verify Registration functionality",
  44 |     async ({ page }) => {
  45 |         await page.goto("https://example.com/register");
  46 |         await page.waitForSelector("#register-username-input", { timeout: 5000 });
  47 |         await expect(page.getByPlaceholder("Username")).toBeVisible();
  48 |     }
  49 | );
  50 | 
  51 | test(
  52 |     "TFS-53096 - Verify Email Verification functionality",
  53 |     async ({ page }) => {
  54 |         await page.goto("https://example.com/verify-email");
  55 |         await page.waitForSelector("#verification-code-input", { timeout: 5000 });
  56 |         await expect(page.getByPlaceholder("Verification Code")).toBeVisible();
  57 |     }
  58 | );
  59 | 
  60 | test(
  61 |     "TFS-53097 - Verify Profile Management functionality",
  62 |     async ({ page }) => {
  63 |         await page.goto("https://example.com/profile");
  64 |         await page.waitForSelector("#profile-username-input", { timeout: 5000 });
  65 |         await expect(page.getByPlaceholder("Username")).toBeVisible();
  66 |     }
  67 | );
  68 | 
  69 | test(
  70 |     "TFS-53098 - Verify Payment Processing functionality",
  71 |     async ({ page }) => {
  72 |         await page.goto("https://example.com/payment");
  73 |         await page.waitForSelector("#payment-amount-input", { timeout: 5000 });
  74 |         await expect(page.getByPlaceholder("Amount")).toBeVisible();
  75 |     }
  76 | );
  77 | 
  78 | test(
  79 |     "TFS-53099 - Verify Order Tracking functionality",
  80 |     async ({ page }) => {
  81 |         await page.goto("https://example.com/order-tracking");
> 82 |         await page.waitForSelector("#order-id-input", { timeout: 5000 });
     |                    ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  83 |         await expect(page.getByPlaceholder("Order ID")).toBeVisible();
  84 |     }
  85 | );
  86 | 
  87 | test(
  88 |     "TFS-53100 - Verify Support Ticket functionality",
  89 |     async ({ page }) => {
  90 |         await page.goto("https://example.com/support");
  91 |         await page.waitForSelector("#support-message-input", { timeout: 5000 });
  92 |         await expect(page.getByPlaceholder("Message")).toBeVisible();
  93 |     }
  94 | );
```