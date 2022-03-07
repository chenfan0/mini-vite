const esbuild = require("esbuild");
const filePath = `D:\\前端\\面试题\\vite\\mini-vite01\\node_modules\\lodash-es\\lodash.js`;

console.log(filePath, "111111111111111111");

console.log(
  esbuild.buildSync({
    entryPoints: [filePath],
    outfile: "bundle.js",
    bundle: true,
    // target: "es2020",
    format: "esm",
  })
);
