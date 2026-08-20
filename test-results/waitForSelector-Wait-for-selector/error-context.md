# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: waitForSelector.spec.ts >> Wait for selector
- Location: output\tests\waitForSelector.spec.ts:6:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button#submit') to be visible

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
  6  | test("Wait for selector", async ({ page }) => {
  7  |     await page.goto("https://example.com");
> 8  |     await page.waitForSelector("button#submit");
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  9  |     await expect(page.getByText("Success")).toBeVisible();
  10 | });
```