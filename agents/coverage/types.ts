export interface MissingTestCase {

    id: string;

    title: string;

    reason: string;

}

export interface CoverageResult {

    totalTestCases: number;

    generatedTestCases: number;

    missingTestCases: MissingTestCase[];

    coveragePercentage: number;

}