const fs = require("fs");
const path = require("path");

const files = [
  path.join(__dirname, "node_modules/@remix-run/web-fetch/dist/lib.node.cjs"),
  path.join(__dirname, "node_modules/@remix-run/web-fetch/src/headers.js"),
];

for (const filePath of files) {
  let content = fs.readFileSync(filePath, "utf-8");
  let patched = content.replace(/URLSearchParams\.prototype\[p\]\.call\(\s*receiver,/g, "URLSearchParams.prototype[p].call(target,");

  if (patched !== content) {
    fs.writeFileSync(filePath, patched, "utf-8");
    console.log(`Patched ${filePath}`);
  } else {
    console.log(`No changes needed in ${filePath}`);
  }

  const remaining = (patched.match(/URLSearchParams\.prototype\[p\]\.call\(\s*receiver,/g) || []).length;
  console.log(`receiver call occurrences remaining in ${filePath}: ${remaining}`);
}
