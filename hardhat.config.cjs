require("@nomicfoundation/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@typechain/hardhat");
require("@nomicfoundation/hardhat-toolbox");


module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sep: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: [`0x${YOUR_PRIVATE_KEY}`]
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  }
};
