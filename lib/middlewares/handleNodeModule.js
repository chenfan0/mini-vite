const path = require("path");
const fs = require("fs");

const esbuild = require("esbuild");
const gzipPlugin = require("@luncheon/esbuild-plugin-gzip");

const { app } = require("../server");
const { handleResponse } = require("../response");
const { RESPONSE_TYPE, VITE_CACHE, PATH } = require("../constant");
const { readFile, existFile } = require("../utilis");

// 对 /@node_modules这种路径进行处理
function handleNodeModulesPath(url) {
  // 处理第三方模块
  // /@node_modules -> ''
  const moduleName = url.replace(PATH["/@NODE_MODULES/"], "");
  // 获取到在node_modules下的文件路径
  // eg: node_modules/vue
  const prefix = path.resolve(PATH["./NODE_MODULES/"], moduleName);
  // 获取package.json的module字段
  try {
    // 获取package.json的module字段
    const modulePath = require(path.join(prefix, "package.json")).module;
    return path.join(prefix, modulePath);
  } catch (e) {
    console.log(e);
  }
}

const cachePath = path.join(process.cwd(), VITE_CACHE);

app.use(async (ctx, next) => {
  const { url } = ctx.request;
  if (url.startsWith(PATH["/@NODE_MODULES/"])) {
    const filePath = handleNodeModulesPath(url);
    const resolvePath = path.parse(filePath);
    const outputPath = path.join(cachePath, resolvePath.base);

    if (!existFile(outputPath)) {
      // 对读取node_modules下的文件打包成多种格式保存
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
