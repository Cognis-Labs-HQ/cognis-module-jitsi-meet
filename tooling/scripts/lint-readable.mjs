import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("rg --files api ui cli -g '*.js' -g '*.html' -g '*.css'")
    .toString()
    .trim()
    .split("\n")
    .filter(Boolean);
let failed = false;

for (const file of files) {
    const text = readFileSync(file, "utf8");

    if (/\t/.test(text)) {
        console.error(`Readability lint failed (tab character): ${file}`);
        failed = true;
    }

    if (/ +$/m.test(text)) {
        console.error(`Readability lint failed (trailing whitespace): ${file}`);
        failed = true;
    }

    if (/\n\n\n/.test(text)) {
        console.error(
            `Readability lint failed (consecutive blank lines): ${file}`,
        );
        failed = true;
    }
}

if (failed) process.exit(1);

const jitsiApp = readFileSync("ui/app.js", "utf8");
if (
    !/state\.availableParticipants = [\s\S]*?;\n\n    const composer = createPageComposer/.test(
        jitsiApp,
    )
) {
    console.error(
        "Readability lint failed (Jitsi state and composer blocks require separation)",
    );
    failed = true;
}

if (failed) process.exit(1);
