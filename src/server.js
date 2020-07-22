const EventEmitter = require("events").EventEmitter;
const cryptoRandomString = require("crypto-random-string");

class Server extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.httpServer = require("http").createServer();
    this.sio = require("socket.io")(this.httpServer);
  }

  async broadcast(type, data) {
    this.sio.emit(type, data);
  }

  async init() {
    var s = this;
    this.sio.on("connection", (socket) => {
      s.emit("connection", socket);
    });
    this.httpServer.listen(this.options.port);
    return this;
  }
}

module.exports = Server;
