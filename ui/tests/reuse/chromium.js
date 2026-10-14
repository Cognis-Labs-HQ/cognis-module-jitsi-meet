import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function openChromium() {
    const profile = await mkdtemp(join(tmpdir(), "jitsi-browser-"));
    const process = spawn(
        globalThis.process.env.CHROMIUM_EXECUTABLE_PATH ?? "chromium",
        [
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--remote-debugging-port=0",
            `--user-data-dir=${profile}`,
            "about:blank",
        ],
        { stdio: "ignore" },
    );
    let launchError;
    process.on("error", (error) => {
        launchError = error;
    });
    let socket;
    const close = async () => {
        socket?.close();
        if (process.exitCode === null && !launchError) {
            const exited = new Promise((resolve) =>
                process.once("exit", resolve),
            );
            process.kill();
            await exited;
        }
        await rm(profile, { recursive: true, force: true });
    };
    try {
        let port;
        for (let attempt = 0; attempt < 50; attempt += 1) {
            if (launchError) throw launchError;
            try {
                port = (
                    await readFile(join(profile, "DevToolsActivePort"), "utf8")
                ).split("\n")[0];
                break;
            } catch (error) {
                if (error.code !== "ENOENT") throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        if (!port)
            throw new Error(
                "Chromium debugging endpoint did not become ready.",
            );
        const response = await fetch(
            `http://127.0.0.1:${port}/json/new?about:blank`,
            { method: "PUT" },
        );
        const target = await response.json();
        socket = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
            socket.addEventListener("open", resolve, { once: true });
            socket.addEventListener("error", reject, { once: true });
        });
        let sequence = 0;
        const pending = new Map();
        socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);
            const request = pending.get(message.id);
            if (!request) return;
            pending.delete(message.id);
            if (message.error) request.reject(new Error(message.error.message));
            else request.resolve(message.result);
        });
        const command = (method, params) =>
            new Promise((resolve, reject) => {
                const id = ++sequence;
                pending.set(id, { resolve, reject });
                socket.send(JSON.stringify({ id, method, params }));
            });
        const evaluate = async (operation, input) => {
            const result = await command("Runtime.evaluate", {
                expression: `(${operation.toString()})(${JSON.stringify(input) ?? "undefined"})`,
                awaitPromise: true,
                returnByValue: true,
            });
            if (result.exceptionDetails)
                throw new Error(
                    result.exceptionDetails.exception?.description ??
                        result.exceptionDetails.text,
                );
            return result.result.value;
        };
        return {
            async newPage() {
                return {
                    async goto(url) {
                        await command("Page.navigate", { url });
                        for (let attempt = 0; attempt < 50; attempt += 1) {
                            if (
                                await evaluate(
                                    () =>
                                        document.readyState === "complete" &&
                                        location.href !== "about:blank",
                                )
                            )
                                return;
                            await new Promise((resolve) =>
                                setTimeout(resolve, 20),
                            );
                        }
                        throw new Error(
                            "Browser fixture did not finish loading.",
                        );
                    },
                    async setContent(html) {
                        await evaluate((markup) => {
                            document.open();
                            document.write(markup);
                            document.close();
                        }, html);
                    },
                    evaluate,
                };
            },
            close,
        };
    } catch (error) {
        await close();
        throw error;
    }
}
