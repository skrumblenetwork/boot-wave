const Config = require("../config");
const BlockChain = require("./blockchain");
const Server = require("./server");
const Controller = require("./controller");

async function startApp() {
  var config = await Config.init();
  var blockchain = new BlockChain(config.blockchain);
  var server = new Server(config.server);
  new Controller({
    blockchain: blockchain,
    server: server,
  }).init();
  console.log("App Started");
}

startApp();
