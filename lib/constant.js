const PORT = 8000;
const SERVER_UTL = `http://localhost:8000`

const RESPONSE_TYPE = {
  JAVASCRIPT: "application/javascript",
  HTML: "text/html",
  CSS: "text/css",
};

const VITE_CACHE = "./node_modules/mini_vite_cache/";

const PATH = {
  "/@NODE_MODULES/": "/@node_modules/",
  "./NODE_MODULES/": "./node_modules/",
};

module.exports = {
  PORT,
  RESPONSE_TYPE,
  VITE_CACHE,
  PATH,
  SERVER_UTL
};
