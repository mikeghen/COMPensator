require("@nomicfoundation/hardhat-toolbox");
const tdly = require("@tenderly/hardhat-tenderly");
tdly.setup();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ethereum: {
      url: `${process.env.ETHEREUM_NODE_URL}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    }
  },
  tenderly: {
    username: process.env.TENDERLY_USERNAME,
    project: process.env.TENDERLY_PROJECT,
  }
};
