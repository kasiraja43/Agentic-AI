export interface TestScript {

    fileName: string;

    content: string;

}

export interface TestGenerationOutput {

    files: TestScript[];

}