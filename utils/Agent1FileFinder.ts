import fs from "fs/promises";
import path from "path";

import { ProjectPaths } from "./ProjectPaths";

export class Agent1FileFinder {

    public static async getLatestAgent2Input(): Promise<string> {

        const folder =
            ProjectPaths.agent2Input;

        console.log(
            "\nSearching Agent 1 output:"
        );

        console.log(folder);

        try {

            const files =
                await fs.readdir(
                    folder,
                    {
                        withFileTypes: true
                    }
                );

            const agent2Files =
                files
                    .filter(
                        file =>
                            file.isFile() &&
                            file.name.startsWith(
                                "Agent2_Input_"
                            ) &&
                            file.name.endsWith(
                                ".md"
                            )
                    )
                    .map(
                        file => file.name
                    );

            if (
                agent2Files.length === 0
            ) {

                throw new Error(
                    "No Agent 2 input files found."
                );
            }

            const filesWithStats =
                await Promise.all(

                    agent2Files.map(
                        async file => {

                            const fullPath =
                                path.join(
                                    folder,
                                    file
                                );

                            const stats =
                                await fs.stat(
                                    fullPath
                                );

                            return {
                                file,
                                fullPath,
                                modified:
                                    stats.mtimeMs
                            };

                        }
                    )

                );

            filesWithStats.sort(
                (a, b) =>
                    b.modified -
                    a.modified
            );

            const latest =
                filesWithStats[0];

            console.log(
                "\nLatest Agent 2 Input:"
            );

            console.log(
                latest.fullPath
            );

            return latest.fullPath;

        } catch (error) {

            console.error(
                "\n❌ Failed to find Agent 2 input."
            );

            throw error;
        }
    }
}