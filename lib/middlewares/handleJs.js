const path = require("path");

const esbuild = require("esbuild");

const { app } = require("../server");
const { handleResponse } = require("../response");
const { RESPONSE_TYPE } = require("../constant");
const { readFile, importRewrite } = require("../utilis");

app.use((ctx, next) => {
  const { url } = ctx.request;

  if (url.endsWith(".js")) {
    let filePath = path.join(
      process.cwd(),
      url.replace("/@node_modules/", "./node_modules/")
    );
    // if (filePath.includes("/@node_modules/")) {
    // }
    if (url === "/client.js") {
      filePath = path.join(__dirname, "../client.js");
    }
    // 处理js文件
    const rawContent = readFile(filePath);
    const content = importRewrite(rawContent, url);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
  } else {
    next();
  }
});
