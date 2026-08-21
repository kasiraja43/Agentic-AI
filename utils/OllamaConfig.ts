import { ChatOllama } from "@langchain/ollama";

import "dotenv/config";

export function createOllamaModel(): ChatOllama {

    const model =
    process.env.OLLAMA_MODEL ||
    "qwen2.5-coder:latest";

    const temperature =
        Number(
            process.env.OLLAMA_TEMPERATURE ||
            "0"
        );

    const baseUrl =
        process.env.OLLAMA_BASE_URL ||
        "http://localhost:11434";

    return new ChatOllama({

        model,

        temperature,

        baseUrl
    });
}