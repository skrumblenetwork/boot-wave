var path = require("path");

var config = {
  blockchain: {
    providerType: "http",
    providerPath: "https://demo.skrumble.co:10101",
  },
  server: {
    port: 8080,
  },
};

exports.init = async function () {
  return config;
};
