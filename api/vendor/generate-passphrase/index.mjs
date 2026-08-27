import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Adapted from generate-passphrase 1.3.0.
 * Copyright Reinaldy Rafli, distributed under the bundled MIT license.
 * The package's insecure fast mode is intentionally omitted.
 */
const words = readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), "./words.txt"),
    "utf8",
)
    .split("\n")
    .filter(Boolean);

function secureIndex(maximum) {
    return crypto.randomInt(0, maximum);
}

function randomWord() {
    return words[secureIndex(words.length)];
}

function createPattern(length, numbers) {
    const choices = numbers ? "NWW" : "WWW";
    return Array.from(
        { length },
        () => choices[secureIndex(choices.length)],
    ).join("");
}

function titlecaseWord(word) {
    return word.replace(
        /\w\S*/g,
        (matchedWord) =>
            matchedWord.charAt(0).toUpperCase() +
            matchedWord.slice(1).toLowerCase(),
    );
}

export function generate(options = {}) {
    const configuration = {
        length: 4,
        separator: "-",
        numbers: true,
        uppercase: false,
        titlecase: false,
        pattern: undefined,
        ...options,
    };
    if (configuration.length <= 0) {
        throw new Error("Length should be 1 or bigger.");
    }
    const pattern =
        configuration.pattern?.toUpperCase() ??
        createPattern(configuration.length, configuration.numbers);
    const values = Array.from(pattern, (token) => {
        if (token === "N") return String(secureIndex(256));
        if (token !== "W") {
            throw new Error("Unknown pattern found. Use N or W instead.");
        }
        const word = randomWord();
        if (configuration.uppercase) return word.toUpperCase();
        return configuration.titlecase ? titlecaseWord(word) : word;
    });
    return values.join(configuration.separator);
}

export function generateMultiple(amount, options = {}) {
    return Array.from({ length: amount }, () => generate(options));
}
