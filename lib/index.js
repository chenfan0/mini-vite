const open = require("open");
const pc = require("picocolors");

const { server } = require("./server");
const useMiddlwares = require("./middlewares");
const { PORT, SERVER_UTL } = require("./constant");

useMiddlwares();

server.listen(PORT, () => {
  console.log(
    `${pc.bold("vite server in")} ${pc.blue(SERVER_UTL)}`
  );
  // open("http://localhost:8000");
});
