const open = require("open");
const pc = require("picocolors");

const { server } = require("./server");
const useMiddlwares = require("./middlewares");

useMiddlwares();

server.listen(8000, () => {
  console.log(
    `${pc.bold("vite server in")} ${pc.blue("http://localhost:8000")}`
  );
  open("http://localhost:8000");
});
