const fs = require("fs");
const path = require("path");

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
  try {
    const content = fs.readFileSync(path, { encoding: "utf-8" });
    return content;
  } catch (e) {
    // return "export default {}";
  }
}
function pathRewrite(node, filePath) {
  // console.log(filePath, node.source?.value);
  let value;
  if (!node.source) {
    return;
  }
  value = node.source.value;

  if (!start(value)) {
    node.source.value = "/@node_modules/" + value;
  } else {
    // 这里是为了防止在node_module文件通过import又导入其他文件，导致路径错误
    if (filePath.includes("/@node_modules/") && !filePath.includes(".js")) {
      value = path.join("/" + filePath.slice(1), value).replace(/\\/g, "/");
      node.source.value = value;
    }
  }
}

function importRewrite(content, filePath) {
  // 生成ast
  // console.log(filePath, "import");
  if (!content) {
    // console.log(filePath, "-----------");
    return;
  }
  const ast = parser.parse(content, {
    sourceType: "module",
  });
  // 替换路径： vue -> /@node_modules/vue
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      pathRewrite(node, filePath);
    },
    ExportAllDeclaration({ node }) {
      pathRewrite(node, filePath);
    },
    ExportNamedDeclaration({ node }) {
      pathRewrite(node, filePath);
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
