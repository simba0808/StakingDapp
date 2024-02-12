import { ethers } from "hardhat";

async function main() {
  const External = await ethers.getContractFactory("External");
  const external = await External.deploy();
  console.log("External deployed to Address:", await external.getAddress());

  const Staker = await ethers.getContractFactory("Staker");
  const staker = await Staker.deploy(await external.getAddress());
  console.log("Staker deployed to Address:", await staker.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
