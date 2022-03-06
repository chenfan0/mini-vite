const path = require("path");

const { app } = require("../server");
const { handleResponse } = require("../response");
const { RESPONSE_TYPE } = require("../constant");
const { readFile, importRewrite } = require("../utilis");

const res = [];

function handleNodeModulesPath(url) {
  // 处理第三个模块
  // 获取真正模块名称
  const moduleName = url.replace("/@node_modules/", "");
  const prefix = path.resolve("./node_modules/", moduleName);
  // 获取package.json的module字段
  try {
    const modulePath = require(path.join(prefix, "package.json")).module;

    return path.join(prefix, modulePath);
  } catch (e) {
    res.push(e);
    console.log(res);
    return;
  }
  // 真正导入文件路径
}

app.use((ctx, next) => {
  const { url } = ctx.request;
  if (url.startsWith("/@node_modules")) {
    const filePath = handleNodeModulesPath(url);
    const rawContent = readFile(filePath);
    const content = importRewrite(rawContent, url);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
    ctx.set("Cache-Control", "max-age=31536000");
  } else {
    next();
  }
});
