import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");

export function readModuleStyles(path = resolve(ROOT, "ui/jitsi-meet.css")) {
    return readFileSync(path, "utf8").replace(
        /@import "(\.\/[^"\n]+\.css)";/g,
        (_, importedPath) =>
            readModuleStyles(resolve(dirname(path), importedPath)),
    );
}
