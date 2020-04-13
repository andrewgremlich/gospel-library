const fs = require("fs").promises;
const { promisify } = require("util");

const frontMatterParser = require("parser-front-matter");
const lunrjs = require("lunr");

const parse = promisify(frontMatterParser.parse.bind(frontMatterParser));

const contentPath = `${__dirname}/content`;

async function readBookChapters(bookPath) {
  const books = await fs.readdir(bookPath);

  return await Promise.all(
    books.map(async book => {
      const fileContent = await fs.readFile(`${bookPath}/${book}`, "utf8");

      const { content, data } = await parse(fileContent);

      return {
        content: content.slice(0, 3000),
        ...data
      };
    })
  );
}

async function loadPostsWithFrontMatter(postsDirectoryPath) {
  const scriptures = await fs.readdir(postsDirectoryPath);
  const allPosts = [];

  for (let script of scriptures) {
    const itemName = `${postsDirectoryPath}/${script}`;
    const stat = await fs.stat(itemName);

    if (stat.isDirectory()) {
      const books = await fs.readdir(itemName);

      const chapters = await Promise.all(
        books.map(async book => {
          const bookPath = `${itemName}/${book}`;
          const stat = await fs.stat(bookPath);

          if (!stat.isDirectory()) {
            const fileContent = await fs.readFile(bookPath, "utf8");
            const { content, data } = await parse(fileContent);
            return {
              content: content.slice(0, 3000),
              ...data
            };
          } else {
            const data = await readBookChapters(bookPath);
            return data;
          }
        })
      );

      allPosts.push(...chapters);
    }
  }

  return allPosts;
}

function makeIndex(posts) {
  return lunrjs(function() {
    this.ref("title");
    this.field("title");
    this.field("content");
    this.field("tags");
    this.field("date");
    this.field("draft");
    posts.forEach(p => {
      this.add(p);
    });
  });
}

async function run() {
    const posts = await loadPostsWithFrontMatter(`${__dirname}/content`);
    const index = makeIndex(posts);
    console.log(JSON.stringify(index));
}

run()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error.stack);
    process.exit(1);
  });
