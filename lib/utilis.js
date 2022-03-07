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

function returnContentByEncoding(path, ctx) {
  const accteptEncoding = ctx.headers["accept-encoding"];
  let content;
  if (accteptEncoding.includes("br")) {
    content = fs.readFileSync(path + ".br");
    ctx.set("content-encoding", "br");
  } else if (accteptEncoding.includes("gzip")) {
    content = fs.readFileSync(path + ".gzip");
    ctx.set("content-encoding", "gzip");
  } else {
    content = fs.readFileSync(path, "utf-8");
  }
  return content;
}

function readFile(path, ctx) {
  try {
    if (ctx) {
      return returnContentByEncoding(path, ctx);
    }
    const content = fs.readFileSync(path, { encoding: "utf-8" });
    return content;
  } catch (e) {
    console.log(e);
  }
}
function pathRewrite(node, filePath) {
  let value;
  if (!node.source) {
    return;
  }
  value = node.source.value;

  if (!start(value)) {
    node.source.value = "/@node_modules/" + value;
  } else {
    // 这里是为了防止在node_module文件通过import又导入其他文件，导致路径错误
    // if (filePath.includes("/@node_modules/") && !filePath.includes(".js")) {
    //   value = path.join("/" + filePath.slice(1), value).replace(/\\/g, "/");
    //   node.source.value = value;
    // }
  }
}

function importRewrite(content, filePath) {
  // 生成ast
  // console.log(filePath, "import");
  if (!content) {
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
