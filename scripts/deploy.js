const hre = require("hardhat");

// Deploy Script for Compensator
// -----------------------------
// - Deploys the Compensator contracts
// - Creates three delegates and three delegators
// - Deploys Compensator contracts for each of the delegates
// - For each delegate, it deposits 1000 COMP into the Compensator contracts
// - For delegate1 it sets the rewardRate to 10 COMP per month
// - For delegate2 it sets the rewardRate to 5 COMP per month
// - For delegate3 it sets the rewardRate to 1 COMP per month
// - For each delegator, they deposit 500 COMP into each of the delegates' Compensator contracts

async function main() {
  const [deployer, delegate1, delegate2, delegate3, delegator1, delegator2, delegator3] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the accounts");
  console.log("Deployer: ", deployer.address);
  console.log("Delegate 1: ", delegate1.address);
  console.log("Delegate 2: ", delegate2.address);
  console.log("Delegate 3: ", delegate3.address);
  console.log("Delegator 1: ", delegator1.address);
  console.log("Delegator 2: ", delegator2.address);
  console.log("Delegator 3: ", delegator3.address);


  const CompensatorFactory = await hre.ethers.getContractFactory("CompensatorFactory");
  const compensatorFactory = await CompensatorFactory.deploy();
  await compensatorFactory.deployed();
  console.log("CompensatorFactory deployed to:", compensatorFactory.address);

  // Create a compensator for each delegate, deposit 1000 COMP, and set the reward rates
  const delegates = [delegate1, delegate2, delegate3];
  const delegateNames = ["Delegate 1", "Delegate 2", "Delegate 3"];
  const rewardRates = [ethers.utils.parseEther("25").div(30*24*60*60), ethers.utils.parseEther("10").div(30*24*60*60), ethers.utils.parseEther("5").div(30*24*60*60)];
  let compensatorAddresses = [];
  const delegators = [delegator1, delegator2, delegator3];

  const comp = await hre.ethers.getContractAt("ERC20", "0xc00e94Cb662C3520282E6f5717214004A7f26888");

  for (let i = 0; i < delegates.length; i++) {
    await compensatorFactory.connect(delegates[i]).createCompensator(delegates[i].address, delegateNames[i]);
    let compensatorAddress = await compensatorFactory.getCompensator(delegates[i].address);
    compensatorAddresses.push(compensatorAddress);
    let compensator = await hre.ethers.getContractAt("Compensator", compensatorAddress);
    console.log(`Compensator for ${delegateNames[i]} deployed to:`, compensatorAddress);

    // Approve the compensator contract to spend 1000 COMP
    await comp.connect(delegates[i]).approve(compensator.address, ethers.utils.parseEther("1000"));
    console.log(`${delegateNames[i]} approved 1000 COMP to:`, compensatorAddress)

    // Log the delegates COMP balance
    let balance = await comp.balanceOf(delegates[i].address);
    console.log(`${delegateNames[i]} COMP balance:`, ethers.utils.formatEther(balance));

    await compensator.connect(delegates[i]).delegateDeposit(ethers.utils.parseEther("1000"));
    console.log(`${delegateNames[i]} deposited 1000 COMP to:`, compensatorAddress);

    await compensator.connect(delegates[i]).setRewardRate(rewardRates[i]);
    console.log(`${delegateNames[i]} reward rate set to ${ethers.utils.formatEther(rewardRates[i].mul(30*24*60*60))} COMP per month`);

    for (let j = 0; j < delegators.length; j++) {
      await comp.connect(delegators[j]).approve(compensator.address, ethers.utils.parseEther("500"));
      await compensator.connect(delegators[j]).delegatorDeposit(ethers.utils.parseEther("500"));
      console.log(`Delegator ${j+1} deposited 500 COMP to:`, compensatorAddress);
    }
    
  }

  // For each delegator, they deposit 500 COMP into each of the delegates' Compensator contracts



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
