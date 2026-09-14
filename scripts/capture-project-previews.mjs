import {spawn} from "node:child_process";
import {mkdtemp, readFile, mkdir, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {setTimeout as delay} from "node:timers/promises";

// Capture the actual live sites, using an isolated browser profile for each.
const chrome = process.env.PROJECT_PREVIEW_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const projects = [
    ["bakery-shop", "https://bakery-shop-beta.vercel.app/"],
    ["prepvista", "https://prep-vista-five.vercel.app/"],
    ["aetherseo", "https://aetherseo.com/en"],
];
const outputDirectory = path.resolve("public/images/work");
await mkdir(outputDirectory, {recursive: true});

async function capture([name, url]) {
    const profile = await mkdtemp(path.join(tmpdir(), "adamant-project-preview-"));
    const browser = spawn(chrome, ["--headless=new", "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], {stdio: "ignore"});
    let socket;
    const pending = new Map();
    try {
        let port;
        for (let attempt = 0; attempt < 100; attempt++) {
            if (browser.exitCode !== null) throw new Error("Chrome exited before capture.");
            try { port = (await readFile(path.join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]; break; } catch { await delay(200); }
        }
        if (!port) throw new Error("Chrome did not start its debugging interface.");
        const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        const target = targets.find((entry) => entry.type === "page");
        if (!target) throw new Error("No browser page was available.");
        socket = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, {once: true}); socket.addEventListener("error", reject, {once: true}); });
        let nextId = 0;
        socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);
            const promise = pending.get(message.id);
            if (!promise) return;
            pending.delete(message.id);
            clearTimeout(promise.timer);
            if (message.error) promise.reject(new Error(message.error.message)); else promise.resolve(message.result);
        });
        const send = (method, params = {}) => new Promise((resolve, reject) => {
            const id = ++nextId;
            const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out.`)); }, 20000);
            pending.set(id, {resolve, reject, timer});
            socket.send(JSON.stringify({id, method, params}));
        });
        await send("Page.enable");
        await send("Emulation.setDeviceMetricsOverride", {width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
        const navigation = await send("Page.navigate", {url});
        if (navigation.errorText) throw new Error(navigation.errorText);
        await delay(12000);
        await send("Runtime.evaluate", {expression: "document.fonts.ready", awaitPromise: true});
        await send("Runtime.evaluate", {expression: `(() => { const buttons = [...document.querySelectorAll('button')]; const decline = buttons.find(button => button.textContent.trim() === 'Decline'); if (decline) decline.click(); const retry = buttons.find(button => button.textContent.includes('Try the 3D experience again')); if (retry) retry.click(); window.scrollTo(0, 0); })()`});
        await delay(5000);
        const page = await send("Runtime.evaluate", {expression: "({title:document.title,text:document.body.innerText.slice(0,300)})", returnByValue: true});
        if (/site can.t be reached|deployment could not be found|vercel authentication/i.test(page.result.value.text)) throw new Error("The live project did not load.");
        const screenshot = await send("Page.captureScreenshot", {format: "png", captureBeyondViewport: false});
        await writeFile(path.join(outputDirectory, `${name}.png`), Buffer.from(screenshot.data, "base64"));
        console.log(`${name}: captured ${page.result.value.title}`);
        await send("Browser.close").catch(() => {});
    } finally {
        for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(new Error("Capture closed.")); }
        socket?.close();
        browser.kill("SIGTERM");
    }
}

const results = await Promise.allSettled(projects.map(capture));
for (let index = 0; index < results.length; index++) {
    if (results[index].status === "rejected") { console.error(`${projects[index][0]}: ${results[index].reason.message}`); process.exitCode = 1; }
}
