import { expect } from "chai";
import { ethers } from "hardhat";


describe("DeFi Staking", function () {

  /*
  async function deployStakeFixture() {
    //get external contract address
    const external = await ethers.deployContract("External");
    const externalAddress = await external.getAddress();

    //deploy staker contract
    const [owner, addr1, addr2] = await ethers.getSigners();
    const staker = await ethers.deployContract("Staker", [externalAddress]);

    return { staker, owner, addr1, addr2 };
  }
  */

  let staker: any, owner: any, addr1: any, addr2: any, addr3: any;
  let stakerA: any, stakerB: any, stakerC: any;
  let external: any;

  before(async function () {
    external = await ethers.deployContract("External");
    const externalAddress = await external.getAddress();

    staker = await ethers.deployContract("Staker", [externalAddress]);
    owner = await ethers.provider.getSigner(0);
    addr1 = await ethers.provider.getSigner(1);
    addr2 = await ethers.provider.getSigner(2);
    addr3 = await ethers.provider.getSigner(3);
    console.log(staker, owner, addr1, addr2)
    stakerA = staker.connect(addr1);
    stakerB = staker.connect(addr2);
    stakerC = staker.connect(addr3);
  });

  it("stake users' fund", async function () {
    //const { staker, owner, addr1, addr2 } = await loadFixture(deployStakeFixture);
    console.log(await staker.getAddress(), await owner.getAddress(), await addr1.getAddress())
    console.log("initial", await ethers.provider.getBalance(addr1))

    //staker address
    const stakerA_addr: string = await addr1.getAddress();
    const stakerB_addr: string = await addr2.getAddress();

    //stakerA staking transaction
    const stakerA_stake_tx = await stakerA.stake({ value: ethers.parseEther("1") });
    await expect(stakerA_stake_tx).to.emit(staker, "Stake").withArgs(stakerA_addr, ethers.parseEther("1"));
    console.log("staked", await ethers.provider.getBalance(addr1))

    //stakerB staking transaction
    const stakerB_stake_tx = await stakerB.stake({ value: ethers.parseEther("2") });
    await expect(stakerB_stake_tx).to.emit(staker, "Stake").withArgs(stakerB_addr, ethers.parseEther("2"));

  });

  it("withdraw users's fund", async function () {
    //time delay for withdraw
    this.timeout(0);
    await new Promise(resolve => setTimeout(resolve, 1000 * 10));

    //stakerA withdraw transaction
    const stakerA_withdraw_tx = await stakerA.withdraw();

    console.log("withdraw", await ethers.provider.getBalance(addr1))
  });

  it("execute stake", async function () {
    await new Promise(resolve => setTimeout(resolve, 1000 * 10));

    const stakeA_execute_tx = await stakerA.execute();
  });

  it("stake user3's fund", async function () {
    const stakerC_stake_tx = await stakerC.stake({ value: ethers.parseEther("3") });
  });

});

