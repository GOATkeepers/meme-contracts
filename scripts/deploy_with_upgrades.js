const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  const memeDeploy = await hre.ethers.getContractFactory("MemeVIP");
  const memeInSitu = await memeDeploy.deploy()
  await memeInSitu.deployed()
  console.log("Contract deployed to:", memeInSitu.address)

  const memeProxy = await upgrades.deployProxy(memeDeploy, { kind: 'uups' });

  await memeProxy.deployed();
  console.log("The Proxy is deployed to:", memeProxy.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })