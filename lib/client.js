// 改文件是为了一开始注入全局变量，以及开启浏览器webSocket
const process = {
  env: {
    NODE_ENV: "development",
  },
};

const __VUE_OPTIONS_API__ = true;
const __VUE_PROD_DEVTOOLS__ = true;

window.onload = function () {
  const ws = new WebSocket("ws://localhost:8000");
  ws.onopen = function () {
    console.log("[mini-vite] connected.");
  };
  ws.onerror = function () {
    console.log("error");
  };
  ws.onmessage = function (msg) {
    console.log(msg.data);
    if (msg.data === "reload") {
      console.log("reload");
      window.location.reload();
    }
  };
};
