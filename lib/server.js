const http = require("http");

const chokidar = require("chokidar");
const Koa = require("koa");
const WebSocket = require("ws");

const { debounce } = require("./utilis");

const app = new Koa();
// 保存ws的全局变量
let gws;

const server = http.createServer(app.callback());
const wss = new WebSocket.Server({
  server,
});

wss.on("connection", function connection(ws) {
  gws = ws;
});

function handleWatch(event, path) {
  gws?.send("reload");
}

chokidar
  .watch(".", {
    ignored: "node_modules",
  })
  .on("all", debounce(handleWatch, 100));

module.exports = {
  server,
  app,
};
