import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { contractAddress, externalAddress } from "../config";
import Staker from "../abi/Staker.json";
import External from "../abi/External.json";

const Stake = () => {
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState("");
  const [contract, setContract] = useState(null);
  const [deployedTime, setDeployedTime] = useState(0);
  const [rewardRate, setRewardRate] = useState(0);
  const [withdrawLeft, setWithdrawLeft] = useState(null);
  const [claimLeft, setClaimLeft] = useState(0);
  const [executed, setExecuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [stakeAmount, setStakeAmount] = useState("");
  const [totalSupply, setTotalSupply] = useState(0);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [externalContract, setExternalContract] = useState(null);
  const [externalBalance, setExternalBalance] = useState(0);
  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
      }
    };

    initializeProvider();
  }, []);

  useEffect(() => {
    let interval;
    if(startTimer && walletAddress) {
      interval = setInterval(async () => {
        const contractBalance = await contract.totalSupply();
        setTotalSupply(parseFloat(contractBalance.toString()) / 10**18);

        const myBalance = await contract.balances(walletAddress);
        setStakedAmount(parseFloat(myBalance.toString()) / 10**18);
      }, 500000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [startTimer, walletAddress]);

  useEffect(() => {
    if(withdrawLeft != null) {
      const interval = setInterval(() => {
        setWithdrawLeft(prev => prev-1);
      }, 1000);
      if(withdrawLeft == 0) {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }
  }, [withdrawLeft]);

  useEffect(() => {
    if(claimLeft != null) {
      const interval = setInterval(() => {
        setClaimLeft(prev => prev-1);   
      }, 1000);
      if(claimLeft == 0) {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }
  }, [claimLeft]);

  useEffect(() => {
    const getNetwork = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setNetwork(network.name);
      }
    };

    const configureContract = async () => {
      if(provider) {
        const contract = new ethers.Contract(contractAddress, Staker, await provider.getSigner());
        const externalContract = new ethers.Contract(externalAddress, External, await provider.getSigner());
        setContract(contract);
        setExternalContract(externalContract);
        setStartTimer(true);

        //get contract deployed timestampe
        const timestamp = await contract.deployedTime();
        setDeployedTime(parseInt(timestamp.toString())*1000);

        //get reward per second
        const reward = await contract.rewardRate();
        setRewardRate(parseInt(reward.toString()) / 10**18);

        //get withdraw time left
        const withdrawLeftTemp = await contract.withdrawalTimeLeft();
        setWithdrawLeft(parseInt(withdrawLeftTemp.toString()));

        //get claim time left
        const claimLeftTemp = await contract.claimPeriodLeft();
        setClaimLeft(parseInt(claimLeftTemp.toString()));

        //get executed status
        setExecuted(await externalContract.completed());
      }
    };

    getNetwork();
    configureContract();
  }, [provider]);

  useEffect(() => {
    if(contract) {
      contract.on("Stake", (sender, value) => {
        console.log(sender, value);
      });
    
      contract.on("Withdraw", (value) => {
        console.log(value);
      })
    }
  }, [contract]);

  const connectWallet = async () => {
    if (!connected && provider) {
      //const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const _walletAddress = await signer.getAddress();

      setConnected(true);
      setWalletAddress(_walletAddress);
      setBalance(parseFloat((await provider.getBalance(_walletAddress)).toString()) / 10 ** 18);
    } else {
      setConnected(false);
      setWalletAddress("");
      setBalance("");
    }
  };
  
  const stakeFund = async () => {
    
    const curBalance = await contract.balances(walletAddress);
    if(stakeAmount.length == 0) {
      alert("Input stake amount")
      return;
    }
    if(Date.now() - deployedTime > 120 * 1000) {
      alert("Staking Time has been reached")
      return;
    }
    if(parseFloat(balance) < parseFloat(stakeAmount)) {
      alert("Stake amount is more than banalce");
      return;
    }
    
    await contract.stake({ from: walletAddress, value: ethers.parseEther(stakeAmount) });
    setStakedAmount(prev => prev + parseFloat(curBalance.toString()));
  };

  const withdrawFund = async () => {
    if(Date.now() - deployedTime < 120 * 1000) {
      alert("Withdraw Time has not been reached");
      return;
    } else if(Date.now() - deployedTime > 240 * 1000) {
      alert("Withdraw Time has been ended");
      return;
    }
    
    await contract.withdraw({ from: walletAddress });

    setStakedAmount(0);
  };

  const executeStake = async () => {
    if(executed) {
      alert("Staking already has been executed");
      return;
    }
    if(Date.now() - deployedTime < 240 * 1000) {
      alert("Claim has not been reached");
      return;
    }
  
    await contract.execute();
    setExecuted(true);
  };

  const handleAmountChange = (e) => {
    setStakeAmount(e.target.value);
  };

  return (
    <div className="min-w-[50%] h-[100vh] py-20">
      <h1 className="text-left">Staking Dapp</h1>
      <div className="flex py-6 text-lg">
        <button
          className="rounded-xl px-2 py-2 border border-gray-100 hover:bg-gray-100 hover:text-black"
          onClick={connectWallet}
        >
          {
            connected ? "Disconnect Wallet" : "Connect Wallet"
          }
        </button>
      </div>
      <div className="text-left text-lg">
        <p className="my-auto">
          connected: {connected ? walletAddress : "Not Connected"}
        </p>
        <p className="flex gap-8">
          <span>
            Network: {connected ? network : ""}
          </span>
          <span>
            Balance: {connected ? `${balance}eth` : ""}
          </span>
        </p>
      </div>
      <div className="flex flex-col py-4">
        <div className="flex gap-6">
          <p>Total Available ETH in Contract: {totalSupply} eth</p>
          <p>External Contract: {externalBalance} eth</p>
        </div>
        <p>You Staked: {stakedAmount} eth</p> 
      </div>
      <div className="flex flex-col gap-y-4 text-lg text-left py-4">
        <p>APY Per Block: {rewardRate}eth</p>
        <div className="flex">
          <p className="flex-1">Claim Period Left: {claimLeft}</p>
          <p className="flex-1">Withdrawal Period Left: {withdrawLeft}</p>
        </div>
        <div className="min-w-[40%] mx-auto flex flex-col gap-y-4 mt-10">
        <div className="flex gap-2">
            <input type="number" className="px-2 text-black rounded-xl focus:outline-none" value={stakeAmount} onChange={handleAmountChange}/>
            <button 
              className="rounded-xl px-4 py-2 border border-gray-100 hover:bg-gray-100 hover:text-black"
              onClick={stakeFund}
            >
              Stake ether
            </button>
          </div>
          <div className="flex justify-between">
            <button 
              className="rounded-xl px-4 py-2 border border-gray-100 hover:bg-gray-100 hover:text-black"
              onClick={executeStake}
            >
              Execute
            </button>
            <button 
              className="rounded-xl px-4 py-2 border border-gray-100 hover:bg-gray-100 hover:text-black"
              onClick={withdrawFund}
            >
              Withdraw
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Stake;