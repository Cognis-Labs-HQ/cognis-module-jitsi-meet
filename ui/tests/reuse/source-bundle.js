import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export function readJitsiApiBundle() {
    const root = resolve(import.meta.dirname, "../../../api");
    const files = readdirSync(root, { recursive: true })
        .filter((file) => file.endsWith(".js") && !file.startsWith("tests/"))
        .sort();
    return files
        .map((file) => readFileSync(join(root, file), "utf8"))
        .join("\n");
}
