const fs = require("fs");
const path = require("path");
const http = require("http");

const Koa = require("koa");
const WebSocket = require("ws");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse");
const { transformFromAst } = require("@babel/core");
const compilerSFC = require("@vue/compiler-sfc");
const compilerDOM = require("@vue/compiler-dom");
const chokidar = require("chokidar");

const app = new Koa();

let gws;
chokidar.watch("./src/").on("all", (event, path) => {
  gws?.send("reload");
});
function WebSocketApi(wss) {
  wss.on("connection", function connection(ws) {
    gws = ws;
  });
  wss.on("open", function (ws) {
    console.log("open");
  });
} //引入封装的ws模块
const server = http.createServer(app.callback());

const wss = new WebSocket.Server({
  // 同一个端口监听不同的服务
  server,
});

WebSocketApi(wss);

const RESPONSE_TYPE = {
  JAVASCRIPT: "application/javascript",
  HTML: "text/html",
};

function readFile(path) {
  return fs.readFileSync(path, { encoding: "utf-8" });
}

function compilerVueScript(url, ctx) {
  const filePath = path.join(__dirname, url);
  const content = readFile(filePath);
  const ast = compilerSFC.parse(content);
  if (ast.descriptor.script === null && ast.descriptor.scriptSetup === null) {
    return `import { render } from '${url}?type=template'
    const sfc = {}
    sfc.render = render \n export default sfc
    `;
  }
  const scriptContent = importRewrite(
    compilerSFC.compileScript(ast.descriptor, {}).content
  ).replace("export default", "const sfc = ");
  return `import { render } from '${url}?type=template'
  ${scriptContent} \n sfc.render = render \n export default sfc
  `;
}

function compilerVueTemplate(url, ctx) {
  const filePath = path.join(__dirname, url.replace("?type=template", ""));
  const content = readFile(filePath);
  const ast = compilerSFC.parse(content);
  const template = importRewrite(
    compilerDOM.compile(ast.descriptor.template.content, { mode: "module" })
      .code
  );
  return template;
}

// 处理引用node_modules的文件路径
function handleNodeModulesPath(url) {
  // 处理第三个模块
  // 获取真正模块名称
  const moduleName = url.replace("/@node_modules/", "");
  const prefix = path.resolve("./node_modules/", moduleName);
  // 获取package.json的module字段
  const modulePath = require(path.join(prefix, "package.json")).module;
  // 真正导入文件路径
  return path.join(prefix, modulePath);
}

function handleResponse(ctx, type, content) {
  ctx.type = type;
  ctx.body = content;
}

// 处理html文件
app.use((ctx, next) => {
  const { url } = ctx.request;
  if (url === "/") {
    // 处理html
    const content = readFile("./index.html");
    handleResponse(ctx, RESPONSE_TYPE.HTML, content);

    ctx.set("Cache-Control", "no-cache");
  } else {
    next();
  }
});
// 处理js
app.use((ctx, next) => {
  const { url } = ctx.request;
  if (url.endsWith(".js")) {
    const filePath = path.join(__dirname, url);
    // 处理js文件
    const rawContent = readFile(filePath);
    const content = importRewrite(rawContent);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
  } else {
    next();
  }
});
// 处理node_modules的文件
app.use((ctx, next) => {
  const { url } = ctx.request;
  if (url.startsWith("/@node_modules")) {
    const filePath = handleNodeModulesPath(url);
    const rawContent = readFile(filePath);
    const content = importRewrite(rawContent);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
    ctx.set("Cache-Control", "max-age=31536000");
  } else {
    next();
  }
});

// 处理vue script
app.use((ctx, next) => {
  const { url } = ctx.request;
  if (url.endsWith(".vue")) {
    // 解析vue文件
    const content = compilerVueScript(url, ctx);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
  } else {
    next();
  }
});

// 处理vue template
app.use((ctx, next) => {
  const { url } = ctx.request;
  const { query } = ctx;
  if (query.type === "template") {
    const content = compilerVueTemplate(url, ctx);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
  }
});

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

function start(str) {
  return str.startsWith("./") || str.startsWith("/") || str.startsWith("../");
}

server.listen(8000, () => {
  console.log("vite server success");
});
