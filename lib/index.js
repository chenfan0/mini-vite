const open = require("open");
const pc = require("picocolors");

const { server } = require("./server");
const useMiddlwares = require("./middlewares");
const { PORT } = require('./constant')

useMiddlwares();

server.listen(PORT, () => {
  console.log(
    `${pc.bold("vite server in")} ${pc.blue('http://locahost:8000')}`
  );
  open("http://localhost:8000");
});
