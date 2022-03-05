const path = require("path");

const { app } = require("../server");
const { handleResponse } = require("../response");
const { RESPONSE_TYPE } = require('../constant')
const { readFile } = require("../utilis");

app.use((ctx, next) => {
  const { url } = ctx.request;
  if (url.endsWith(".css")) {
    const filePath = path.join(process.cwd(), url);
    // h1{ color: red }
    const rawContent = readFile(filePath);
    /**
     *   `h1 {color: red}`
     */
    const content = "`" + rawContent + "`";
    const finalContent = `
    let style = document.querySelector("#cf_mini_vite");
    if (!style) {
      style = document.createElement("style");
      style.setAttribute("id", "cf_mini_vite");
    }
    style.innerHTML = style.innerHTML + ${content};
    document.getElementsByTagName("head").item(0).appendChild(style);`;
    handleResponse(ctx, RESPONSE_TYPE.JAVASCRIPT, finalContent);
  } else {
    next();
  }
});
