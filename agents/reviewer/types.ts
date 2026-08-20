export interface ReviewIssue {

    severity: "Critical" | "High" | "Medium" | "Low";

    category:
        | "Framework"
        | "Test"
        | "Locator"
        | "Performance"
        | "Playwright"
        | "Naming";

    file: string;

    issue: string;

    recommendation: string;

}

export interface ReviewReport {

    overallScore: number;

    issues: ReviewIssue[];

    strengths: string[];

    improvements: string[];

    summary: string;

}