const path = require("path");

const esbuild = require("esbuild");

const { app } = require("../server");
const { handleResponse } = require("../response");
const { RESPONSE_TYPE, PATH } = require("../constant");
const { readFile, importRewrite } = require("../utilis");

app.use((ctx, next) => {
  const { url } = ctx.request;

  if (url.endsWith(".js")) {
    let filePath = path.join(
      process.cwd(),
      url.replace(PATH["/@NODE_MODULES/"], PATH["./NODE_MODULES/"])
    );
    if (url === "/client.js") {
      // 注入热刷新代码
      filePath = path.join(__dirname, "../client.js");
    }
    // 处理js文件
    const rawContent = readFile(filePath);
    // 对js文件进行import处理，在js文件中也导入第三方模块
    const content = importRewrite(rawContent, url);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
  } else {
    next();
  }
});
