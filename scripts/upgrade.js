const { ethers, upgrades } = require("hardhat");

async function main() {
  const memeUpgrade = await ethers.getContractFactory("MemeUpgrade");
  const memePush = await upgrades.upgradeProxy(
    // '0x7374b28F49192CB628634BAE81D892d418d72Fe3', // RINKEBY address of the previous
    '0x29989769868a93923fE0e813f436dB68A3685067', // MAINNET address of the previous
    memeUpgrade,
  );

  await memePush.deployed();
  console.log("Meme VIP upgraded at:", memePush.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })