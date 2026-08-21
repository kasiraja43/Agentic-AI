import { runReporting } from "./runReporting";

runReporting().catch((error) => {

    console.error(
        "\n❌ Reporting Agent Failed"
    );

    console.error(error);

    process.exit(1);
});