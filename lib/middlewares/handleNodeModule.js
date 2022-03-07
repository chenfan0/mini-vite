const path = require("path");
const fs = require("fs");

const esbuild = require("esbuild");
const gzipPlugin = require("@luncheon/esbuild-plugin-gzip");

const { app } = require("../server");
const { handleResponse } = require("../response");
const { RESPONSE_TYPE } = require("../constant");
const { readFile } = require("../utilis");

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
    console.log(e);
  }
}

const cachePath = path.join(process.cwd(), "./node_modules/mini_vite_cache/");

app.use(async (ctx, next) => {
  const { url } = ctx.request;
  if (url.startsWith("/@node_modules")) {
    const filePath = handleNodeModulesPath(url);
    const res = path.parse(filePath);
    const outputPath = path.join(cachePath, res.base);

    if (!fs.existsSync(outputPath)) {
      await esbuild.build({
        entryPoints: [filePath],
        outfile: outputPath,
        bundle: true,
        format: "esm",
        write: false,
        plugins: [gzipPlugin()],
      });
    }
    const content = readFile(outputPath, ctx);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
    ctx.set("Cache-Control", "max-age=31536000");
  } else {
    next();
  }
});
