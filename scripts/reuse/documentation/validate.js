import { readFileSync, readdirSync, lstatSync, existsSync } from "node:fs";
import { resolve, relative, dirname, sep } from "node:path";
import structure from "./structure.json" with { type: "json" };
import { contentIssues } from "./content.js";
import { markdownLayout } from "./markdown-layout.js";

export const languages = Object.keys(structure);
export const documents = {
    readme: "README",
    usage: "USAGE",
    technical: "TECHNICAL",
};

export function validateMarkdown(markdown, kind, language) {
    const { prose, issues, hasCode } = markdownLayout(markdown);
    issues.push(...contentIssues(prose));
    const headings = [...prose.matchAll(/^(#{1,6})\s+(.+)$/gm)];
    if (
        headings.filter((heading) => heading[1] === "#").length !== 1 ||
        !/^# [^\n]+\n/.test(markdown) ||
        !headings[0]?.[2].trim()
    )
        issues.push("Start with exactly one H1");
    if ((headings[0]?.[2].length ?? 0) > 30)
        issues.push("H1 exceeds 30 characters");
    const actual = headings
        .filter((heading) => heading[1] === "##")
        .map((heading) => heading[2]);
    const expected = structure[language]?.[kind];
    if (!expected || JSON.stringify(actual) !== JSON.stringify(expected))
        issues.push(`Required H2 order: ${expected?.join(" / ")}`);
    for (let index = 1; index < headings.length; index++) {
        if (headings[index][1].length > headings[index - 1][1].length + 1)
            issues.push(`Skipped heading level: ${headings[index][2]}`);
    }
    const firstSection = prose.indexOf("\n## ");
    const introduction = prose
        .slice(prose.indexOf("\n") + 1, firstSection)
        .trim();
    if (
        !introduction ||
        /^(?:Code example|#{1,6}\s|[-*+]\s|\d+[.)]\s|[>|]| {4}|\t)/.test(
            introduction,
        )
    )
        issues.push("Missing introductory paragraph");
    for (let index = 1; index < headings.length; index++) {
        const heading = headings[index];
        const end =
            headings
                .slice(index + 1)
                .find((next) => next[1].length <= heading[1].length)?.index ??
            prose.length;
        const section = prose.slice(heading.index + heading[0].length, end);
        if (!section.replace(/^#{3,6} .+$/gm, "").trim())
            issues.push("Empty section");
    }
    if (
        /Describe the component-specific contract|Ersetzen Sie diese Anweisung|Ganti petunjuk ini|この指示を/.test(
            prose,
        ) ||
        /\b(TODO|TBD|FIXME|lorem ipsum)\b/i.test(prose) ||
        /<[^>]*(?:example|description)[^>]*>/i.test(
            prose.replace(/`[^`]+`/g, ""),
        )
    )
        issues.push("Unfilled documentation template");
    if (
        /\b(this PR|this pull request|this change|we (?:added|fixed)|now (?:supports|uses))\b/i.test(
            prose,
        ) ||
        /^#{2,6} (?:\d{4}-\d{2}-\d{2}|Added |Fixed |Changed |Updated )/m.test(
            prose,
        )
    )
        issues.push("Release history belongs in the branch changelog");
    if (
        kind === "readme" &&
        (hasCode ||
            /\/api\/v\d|ctx\.capabilities|\b(?:GET|POST|PUT|PATCH|DELETE)\s+\//.test(
                markdown,
            ))
    )
        issues.push(
            "README is for non-technical readers; move examples to USAGE and endpoints to TECHNICAL",
        );
    return issues;
}

export function validateBundle(root) {
    const issues = [];
    const manifest = JSON.parse(
        readFileSync(resolve(root, "manifest.json"), "utf8"),
    );
    if (
        JSON.stringify(Object.keys(manifest.documentation ?? {}).sort()) !==
        JSON.stringify(Object.keys(documents).sort())
    )
        issues.push(
            "Declare exactly documentation.readme, usage and technical",
        );
    const allowed = new Set();
    for (const [kind, name] of Object.entries(documents)) {
        const pointer = `docs/${name}.en.md`;
        if (manifest.documentation?.[kind] !== pointer)
            issues.push(`Invalid documentation.${kind}: use ${pointer}`);
        for (const language of languages) {
            const filename = `${name}.${language}.md`;
            allowed.add(filename);
            const path = resolve(root, "docs", filename);
            try {
                if (!lstatSync(path).isFile())
                    throw new Error("Expected a regular file");
                issues.push(
                    ...referenceIssues(
                        readFileSync(path, "utf8"),
                        root,
                        manifest.repository,
                        dirname(path),
                    ).map((issue) => `${filename}: ${issue}`),
                );
                issues.push(
                    ...validateMarkdown(
                        readFileSync(path, "utf8"),
                        kind,
                        language,
                    ).map((issue) => `${filename}: ${issue}`),
                );
            } catch (error) {
                issues.push(`${filename}: ${error.message}`);
            }
        }
    }
    function inspect(directory) {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            if (
                directory === resolve(root, "docs") &&
                entry.name === "changelog"
            )
                continue;
            const path = resolve(directory, entry.name);
            if (entry.isDirectory()) inspect(path);
            else if (
                /\.md$/i.test(entry.name) &&
                (!entry.isFile() ||
                    !allowed.has(relative(resolve(root, "docs"), path)))
            )
                issues.push(`Unregistered document: ${relative(root, path)}`);
        }
    }
    inspect(resolve(root, "docs"));
    return issues;
}

export function referenceIssues(markdown, root, repository, directory) {
    const issues = [];
    const prose = markdownLayout(markdown).prose;
    for (const match of prose.matchAll(
        /https:\/\/github\.com\/([^/\s]+\/[^/\s]+)\/(?:blob|raw)\/([^/\s]+)\/([^\s)<>"`#?]+)/g,
    )) {
        if (match[2] !== "HEAD")
            issues.push(
                `Source links must follow the default branch through HEAD: ${match[0]}`,
            );
        if (
            `https://github.com/${match[1]}` !==
            repository?.replace(/\.git$/, "")
        )
            continue;
        try {
            const path = resolve(root, decodeURIComponent(match[3]));
            if (!path.startsWith(resolve(root) + sep) || !existsSync(path))
                issues.push(`Missing owned source target: ${match[3]}`);
        } catch {
            issues.push(`Invalid source target: ${match[3]}`);
        }
    }
    for (const match of prose.matchAll(/\[[^\]\n]*\]\(([^\s)]+)\)/g)) {
        if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(match[1])) continue;
        try {
            const target = resolve(
                directory,
                decodeURIComponent(match[1].split(/[?#]/)[0]),
            );
            if (!target.startsWith(resolve(root) + sep) || !existsSync(target))
                issues.push(`Missing relative reference: ${match[1]}`);
        } catch {
            issues.push(`Invalid relative reference: ${match[1]}`);
        }
    }
    return issues;
}
