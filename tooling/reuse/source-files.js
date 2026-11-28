/**
 * Lists regular source files within a checkout without following symbolic links.
 * Public export: sourceFiles(directory, { excludeDirectories }) returns absolute file paths.
 * @example const files = sourceFiles(checkoutRoot, { excludeDirectories: ["node_modules", ".git"] });
 */
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * @param {string} directory Directory to inspect.
 * @param {{excludeDirectories?:string[]}} options Names of directories excluded at every depth.
 * @returns {string[]} Regular file paths within the selected tree.
 */
export function sourceFiles(
    directory,
    { excludeDirectories = ["node_modules", ".git", "dist"] } = {},
) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (excludeDirectories.includes(entry.name) || entry.isSymbolicLink())
            return [];
        const path = resolve(directory, entry.name);
        return entry.isDirectory()
            ? sourceFiles(path, { excludeDirectories })
            : entry.isFile()
              ? [path]
              : [];
    });
}
