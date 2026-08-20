import { ExecutorAgent } from "../agents/executor/ExecutorAgent";

export async function runExecutor(): Promise<void> {

    console.log("\n====================================");
    console.log("        PLAYWRIGHT EXECUTOR");
    console.log("====================================\n");

    const executor =
        new ExecutorAgent();

    await executor.execute();
}


// ==========================================
// Direct Runner
// ==========================================
