import { execSync as executeSync } from "node:child_process";

try {
    executeSync("npx prettier --check .", { stdio: "inherit" });
} catch {
    process.exit(1);
}
