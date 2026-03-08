import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");

const htmlFiles = readdirSync(rootDir).filter((name) => name.endsWith(".html"));
const staticFiles = ["robots.txt", "sitemap.xml", "CNAME"];
const staticDirs = ["assets"];
const hashedAssets = [
    "style.css",
    "script.js",
    "admin.js",
    "site-data.js",
    "supabase-bridge.js",
    "supabase-config.js"
];

function ensureDir(dirPath) {
    mkdirSync(dirPath, { recursive: true });
}

function copyRecursive(sourcePath, targetPath) {
    const entries = readdirSync(sourcePath, { withFileTypes: true });
    ensureDir(targetPath);

    for (const entry of entries) {
        const from = path.join(sourcePath, entry.name);
        const to = path.join(targetPath, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(from, to);
            continue;
        }

        copyFileSync(from, to);
    }
}

function fileHash(filePath) {
    const content = readFileSync(filePath);
    return createHash("sha256").update(content).digest("hex").slice(0, 10);
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
}

ensureDir(distDir);

for (const dirName of staticDirs) {
    const sourceDir = path.join(rootDir, dirName);
    if (existsSync(sourceDir)) {
        copyRecursive(sourceDir, path.join(distDir, dirName));
    }
}

for (const fileName of staticFiles) {
    const sourceFile = path.join(rootDir, fileName);
    if (existsSync(sourceFile)) {
        copyFileSync(sourceFile, path.join(distDir, fileName));
    }
}

const assetMap = new Map();

for (const assetName of hashedAssets) {
    const sourcePath = path.join(rootDir, assetName);
    if (!existsSync(sourcePath)) {
        continue;
    }

    const parsed = path.parse(assetName);
    const hashedName = `${parsed.name}.${fileHash(sourcePath)}${parsed.ext}`;
    const targetPath = path.join(distDir, hashedName);

    copyFileSync(sourcePath, targetPath);
    assetMap.set(assetName, hashedName);
}

for (const htmlName of htmlFiles) {
    const sourcePath = path.join(rootDir, htmlName);
    let html = readFileSync(sourcePath, "utf8");

    for (const [sourceName, hashedName] of assetMap.entries()) {
        const pattern = new RegExp(`${escapeRegex(sourceName)}(?:\\?v=[^"'\\s>]+)?`, "g");
        html = html.replace(pattern, hashedName);
    }

    writeFileSync(path.join(distDir, htmlName), html, "utf8");
}

console.log(`Built ${htmlFiles.length} HTML files into ${distDir}`);
