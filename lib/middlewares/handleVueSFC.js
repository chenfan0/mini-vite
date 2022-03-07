const path = require("path");

const compilerSFC = require("@vue/compiler-sfc");
const compilerDOM = require("@vue/compiler-dom");
const md5 = require("md5");

const { app } = require("../server");
const { handleResponse } = require("../response");
const { RESPONSE_TYPE } = require("../constant");
const { readFile, importRewrite } = require("../utilis");

function compilerVueScript(url) {
  const filePath = path.join(process.cwd(), url);
  const filename = path.parse(filePath).base;
  const id = md5(filePath).slice(0, 7);
  const scopedId = "data-v-" + id;
  const content = readFile(filePath);
  const ast = compilerSFC.parse(content);
  const cssOptions = {
    source: ast.descriptor.styles[0].content,
    filename,
    id,
    scoped: ast.descriptor.styles[0].scoped,
  };
  // compilerCss
  const cssContent = "`" + compilerSFC.compileStyle(cssOptions).code + "`";

  // 处理没有写script的情况
  if (ast.descriptor.script === null && ast.descriptor.scriptSetup === null) {
    const noScriptContent = ` import { render } from '${url}?type=template'
    
                              const __sfc__ = {} \n
                              let style = document.querySelector("#cf_mini_vite");
                              if (!style) {
                              style = document.createElement("style");
                              style.setAttribute("id", "cf_mini_vite");
                              }
                              style.innerHTML = style.innerHTML + ${cssContent};
                              document.getElementsByTagName("head").item(0).appendChild(style); \n
                              __sfc__.__scopeId = "${scopedId}" \n
                              __sfc__.render = render \n
                              __sfc__.__scopeId = "${scopedId}" \n
                              __sfc__.__file = "${filename}" \n
                              export default __sfc__
                              `;
    return noScriptContent;
  }
  // 对解析后的js文件进行importRewrite处理
  // 并且对 export default 进行替换
  const rawScriptContent = importRewrite(
    compilerSFC.rewriteDefault(
      compilerSFC.compileScript(ast.descriptor, { id }).content,
      "__sfc__"
    ),
    url
  );
  const scriptContent = `import { render } from '${url}?type=template'
                          ${rawScriptContent} \n
                          
    let style = document.querySelector("#cf_mini_vite");
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("id", "cf_mini_vite");
    }
    style.innerHTML = style.innerHTML + ${cssContent};
    document.getElementsByTagName("head").item(0).appendChild(style); \n
                          __sfc__.__scopeId = "${scopedId}" \n
                          __sfc__.render = render \n 
                          __sfc__.__file = "${filename}" \n
                          export default __sfc__
                        `;
  return scriptContent;
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
  } else {
    next();
  }
});
