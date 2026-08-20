export interface FailedTest {

    file: string;

    title: string;

    error: string;

    screenshot?: string;

    trace?: string;

}

export interface ExecutionResult {

    status: string;

    total: number;

    passed: number;

    failed: number;

    skipped: number;

    duration: string;

    failedTests: FailedTest[];

}