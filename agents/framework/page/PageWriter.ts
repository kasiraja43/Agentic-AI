import fs from "fs/promises";
import path from "path";

import { PageOutput } from "./types";

export class PageWriter {

    public async write(
        pages: PageOutput,
        outputFolder: string
    ): Promise<void> {

        console.log("\nWriting Page Objects...\n");

        for (const file of pages.files) {

            const fullPath = path.join(
                outputFolder,
                file.fileName
            );

            await fs.mkdir(
                path.dirname(fullPath),
                {
                    recursive: true
                }
            );

            await fs.writeFile(
                fullPath,
                file.content,
                "utf8"
            );

            console.log(`✓ ${file.fileName}`);
        }

        console.log("\nPage Objects Created Successfully.\n");
    }
}