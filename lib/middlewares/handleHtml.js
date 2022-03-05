const path = require("path");

const { readFile } = require("../utilis");
const { app } = require("../server")

const {  handleResponse } = require('../response')
const { RESPONSE_TYPE } = require('../constant')

app.use((ctx, next) => {
  const { url } = ctx.request;
  if (url === "/") {
    // 处理html
    const content = readFile(path.resolve(process.cwd(), "./index.html"));
    handleResponse(ctx, RESPONSE_TYPE.HTML, content);
    ctx.set("Cache-Control", "no-cache");
  } else {
    next();
  }
});
