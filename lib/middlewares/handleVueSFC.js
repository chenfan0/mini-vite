const path = require("path");

const compilerSFC = require("@vue/compiler-sfc");
const compilerDOM = require("@vue/compiler-dom");

const { app } = require("../server");
const { handleResponse } = require("../response");
const { RESPONSE_TYPE } = require("../constant");
const { readFile, importRewrite } = require("../utilis");

function compilerVueScript(url) {
  const filePath = path.join(process.cwd(), url);
  const content = readFile(filePath);
  const ast = compilerSFC.parse(content);
  if (ast.descriptor.script === null && ast.descriptor.scriptSetup === null) {
    return `import { render } from '${url}?type=template'
    const sfc = {}
    sfc.render = render \n export default sfc
    `;
  }
  const scriptContent = importRewrite(
    compilerSFC.compileScript(ast.descriptor, { id: "123" }).content,
    url
  ).replace("export default", "const sfc = ");
  return `import { render } from '${url}?type=template'
  ${scriptContent} \n sfc.render = render \n export default sfc
  `;
}

function compilerVueTemplate(url) {
  const filePath = path.join(process.cwd(), url.replace("?type=template", ""));
  const content = readFile(filePath);
  const ast = compilerSFC.parse(content);
  const template = importRewrite(
    compilerDOM.compile(ast.descriptor.template.content, { mode: "module" })
      .code,
    url
  );
  return template;
}

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
// 处理template
app.use((ctx, next) => {
  const { url } = ctx.request;
  const { query } = ctx;
  if (query.type === "template") {
    const content = compilerVueTemplate(url, ctx);
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, content);
  }
});
