export interface HealingSuggestion {

    file: string;

    issue: string;

    rootCause: string;

    fix: string;

}

export interface HealingReport {

    success: boolean;

    suggestions: HealingSuggestion[];

    summary: string;

}