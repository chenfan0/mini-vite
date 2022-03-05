const path = require("path");

const { app } = require("../server");
const {  handleResponse } = require("../response");
const { RESPONSE_TYPE } = require('../constant')
const { readFile, importRewrite } = require("../utilis");

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
