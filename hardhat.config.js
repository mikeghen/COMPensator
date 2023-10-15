require("@nomicfoundation/hardhat-toolbox");
const tdly = require("@tenderly/hardhat-tenderly");
tdly.setup();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    tenderly: {
      url: `${process.env.TENDERLY_RPC_URL}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    ethereum: {
      url: `${process.env.ETHEREUM_RPC_URL}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    }
  },
  tenderly: {
    username: "mikeghen",
    project: "compensator"
  }
};
