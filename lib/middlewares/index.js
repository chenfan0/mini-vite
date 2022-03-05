function useMiddlwares() {
  require("./handleHtml");
  require("./handleCss");
  require("./handleJs");
  require("./handleNodeModule");
  require("./handleVueSFC");
}

module.exports = useMiddlwares;
