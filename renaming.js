const fs = require("fs");
const { promisify } = require("util");

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const renameAsync = promisify(fs.rename);

const scripturePath = "./content/pogp";

const processFile = async path => {
    let nameOfFileToProcess = path;

    const pathSplit = nameOfFileToProcess.split("/");
    const fileName = pathSplit.pop();

    if (fileName.length === 4) {
        const padFileStart = `${pathSplit.join("/")}/${fileName.padStart(5, "0")}`;
        await renameAsync(nameOfFileToProcess, padFileStart);
        nameOfFileToProcess = padFileStart;
    }

    const fileContents = await readFileAsync(nameOfFileToProcess, "utf8");
    const addLineBreaksForMd = fileContents.split(/\n+/g).join("\n\n");

    const splitFilePath = nameOfFileToProcess.split("/");
    const chapter = splitFilePath[splitFilePath.length - 1].replace(/(:?\.md)/g, "");
    const book = splitFilePath[splitFilePath.length - 2].replace("_", " ");

    const frontMatter = `---
title: "${book} ${chapter}"
date: ${new Date()}
draft: false
---
`;

    let contentsToWrite = addLineBreaksForMd;

    if (!addLineBreaksForMd.includes("---")) {
        contentsToWrite = frontMatter + contentsToWrite;
    }

    writeFileAsync(nameOfFileToProcess, contentsToWrite);
};

const readBookOfScripture = async (scripture = scripturePath) => {
    const bookOfScripture = await readdirAsync(scripture);

    for (let book of bookOfScripture) {
        const bookPath = `${scripture}/${book}`;
        const statsBook = await statAsync(bookPath);

        if (book.includes(" ")) {
            await renameAsync(bookPath, `${scripture}/${book.replace(/ /g, "_")}`);
        }

        if (statsBook.isDirectory()) {
            readBookOfScripture(bookPath);
        } else {
            processFile(bookPath);
        }
    }
};

readBookOfScripture();
