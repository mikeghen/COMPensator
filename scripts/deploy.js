const hre = require("hardhat");

async function main() {
  const Compensator = await hre.ethers.getContractFactory("Compensator");
  const compensator = await Compensator.deploy();

  await compensator.deployed();

  console.log("Compensator deployed to:", compensator.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
