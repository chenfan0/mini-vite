const fs = require("fs");

const parser = require("@babel/parser");
const traverse = require("@babel/traverse");
const { transformFromAst } = require("@babel/core");

function debounce(fn, delay) {
  let time = null;
  return function (...args) {
    if (time) {
      clearTimeout(time);
      time = null;
    }
    time = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function start(str) {
  return str.startsWith("./") || str.startsWith("/") || str.startsWith("../");
}

function readFile(path) {
  return fs.readFileSync(path, { encoding: "utf-8" });
}
function pathRewrite(node) {
  let value;
  if (!node.source) {
    return;
  }
  value = node.source.value;
  if (!start(value)) {
    node.source.value = "/@node_modules/" + value;
  }
}

function importRewrite(content) {
  // 生成ast
  const ast = parser.parse(content, {
    sourceType: "module",
  });
  // 替换路径： vue -> /@node_modules/vue
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      pathRewrite(node);
    },
    ExportAllDeclaration({ node }) {
      pathRewrite(node);
    },
    ExportNamedDeclaration({ node }) {
      pathRewrite(node);
    },
  });
  // 根据ast生成代码
  const source = transformFromAst(ast).code;
  return source;
}

module.exports = {
  debounce,
  start,
  pathRewrite,
  readFile,
  importRewrite,
};
