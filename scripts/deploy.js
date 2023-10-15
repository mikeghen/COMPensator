const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CompensatorFactory = await hre.ethers.getContractFactory("CompensatorFactory");
  const compensatorFactory = await CompensatorFactory.deploy();
  await compensatorFactory.deployed();
  console.log("CompensatorFactory deployed to:", compensatorFactory.address);

  await compensatorFactory.createCompensator(deployer.address);
  const compensatorAddress = await compensatorFactory.getCompensator(deployer.address);
  console.log("Compensator deployed to:", compensatorAddress);

  await tenderly.verify({
    name: "CompensatorFactory",
    address: compensatorFactory.address,
  });
  await tenderly.verify({
    name: "Compensator",
    address: compensatorAddress,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
