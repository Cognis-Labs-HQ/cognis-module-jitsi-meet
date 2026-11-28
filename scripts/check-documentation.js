import { validateBundle } from "./reuse/documentation/validate.js";

const issues = validateBundle(process.cwd());
if (issues.length) {
    process.stderr.write(issues.join("\n") + "\n");
    process.exitCode = 1;
} else
    process.stdout.write(
        "Localized documentation bundles satisfy the required layout.\n",
    );
