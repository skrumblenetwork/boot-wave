const cryptoRandomString = require("crypto-random-string");

class Controller {
  constructor(options) {
    this.blockchain = options.blockchain;
    this.server = options.server;
  }

  async getUserInfo(address) {
    if (this.registeredUsers.hasOwnProperty(address)) {
      return this.registeredUsers[address];
    }
    var info = await this.blockchain.getUserInfo(address);
    if (info != null) {
      this.registeredUsers[address] = info;
    }
    return info;
  }

  onlineUserList() {
    var ret = [];
    for (const key in this.onlineUsers) {
      if (this.onlineUsers.hasOwnProperty(key)) {
        ret.push(key);
      }
    }
    return ret;
  }

  async init() {
    this.onlineUsers = {};
    this.registeredUsers = {};
    var c = this;
    this.server.on("connection", (socket) => {
      socket.code = cryptoRandomString({ length: 32 });
      socket.emit("code", socket.code);

      socket.on("login", async (signature) => {
        var address = c.blockchain.recover(socket.code, signature);
        var userInfo = await c.getUserInfo(address);
        if (!userInfo) {
          socket.emit("needRegister", address);
        } else {
          socket.emit("onlineUsers", c.onlineUserList());
          socket.address = address;
          c.onlineUsers[address] = socket;
          c.server.broadcast("online", address);
        }
      });

      socket.on("wave", async (data) => {
        if (socket.address) {
          var to = data.to;
          var userInfo = await c.getUserInfo(to);
          if (!userInfo) {
            socket.emit("notRegister", to);
          } else {
            if (c.onlineUsers.hasOwnProperty(to)) {
              data.from = socket.address;
              c.onlineUsers[to].emit("wave", data);
            } else {
              socket.emit("offline", to);
            }
          }
        } else {
          socket.emit("needLogin");
        }
      });

      socket.on("disconnect", () => {
        if (
          socket.hasOwnProperty("address") &&
          c.onlineUsers.hasOwnProperty(socket.address)
        ) {
          delete c.onlineUsers[socket.address];
          c.server.broadcast("offline", socket.address);
        }
      });
    });

    await this.blockchain.init();
    await this.server.init();
    return this;
  }
}

module.exports = Controller;
