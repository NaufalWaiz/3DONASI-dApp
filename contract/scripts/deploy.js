const hre = require("hardhat");

async function main() {
  const DonasiChain = await hre.ethers.getContractFactory("DonasiChain");
  const contract = await DonasiChain.deploy();
  await contract.waitForDeployment();
  console.log("DonasiChain deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
