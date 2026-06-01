const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const tsRoot = path.join(projectRoot, 'assets');
const configRoot = path.join(projectRoot, 'config');
const configFallbackRoot = path.join(projectRoot, 'assets', 'Game', 'AssetPackage', 'CONFIG');
const outputDir = path.join(projectRoot, 'work');
const outputFile = path.join(outputDir, 'day2.txt');

function walkFiles(dir, extSet, output) {
    if (!fs.existsSync(dir)) {
        return;
    }

    const entries = fs.readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkFiles(fullPath, extSet, output);
            continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        if (extSet.has(ext)) {
            output.push(fullPath);
        }
    }
}

function normalizeToProjectPath(absPath) {
    return path.relative(projectRoot, absPath).split(path.sep).join('/');
}

function readTextSafe(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.replace(/\r\n/g, '\n');
}

function collectSourceFiles() {
    const tsFiles = [];
    walkFiles(tsRoot, new Set(['.ts']), tsFiles);

    const jsonFiles = [];
    if (fs.existsSync(configRoot)) {
        walkFiles(configRoot, new Set(['.json']), jsonFiles);
    } else {
        walkFiles(configFallbackRoot, new Set(['.json']), jsonFiles);
    }

    return [...tsFiles, ...jsonFiles].sort((a, b) => normalizeToProjectPath(a).localeCompare(normalizeToProjectPath(b)));
}

function buildOutput(files) {
    const parts = [];
    parts.push('# day2');
    parts.push('');
    parts.push(`Generated At: ${new Date().toISOString()}`);
    parts.push('');

    for (const file of files) {
        const title = normalizeToProjectPath(file);
        const content = readTextSafe(file);

        parts.push(`## 标题: ${title}`);
        parts.push('内容:');
        parts.push(content);
        parts.push('');
    }

    return parts.join('\n');
}

function main() {
    const files = collectSourceFiles();
    fs.mkdirSync(outputDir, {recursive: true});
    fs.writeFileSync(outputFile, buildOutput(files), 'utf8');

    console.log(`Generated: ${normalizeToProjectPath(outputFile)}`);
    console.log(`File Count: ${files.length}`);
}

main();
