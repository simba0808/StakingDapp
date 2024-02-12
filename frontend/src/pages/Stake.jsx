const Stake = () => {
  return (
    <div className="min-w-[50%] h-[100vh] py-20">
      <h1 className="text-left">Staking Dapp</h1>
      <div className="flex py-6 text-lg">
        <button className="rounded-xl px-2 py-2 border border-gray-100 hover:bg-gray-100 hover:text-black">
          Connect Wallet
        </button>
      </div>
      <div className="flex flex-col gap-y-4 text-lg text-left py-4">
        <p>APY Per Block:</p>
        <div className="flex">
          <p className="flex-1">Claim Period Left:</p>
          <p className="flex-1">Withdrawal Period Left:</p>
        </div>
        <p>Total Available ETH in Contract:</p>
        <p>ETH Locked in Staker Contract:</p>
        <div className="min-w-[40%] mx-auto flex flex-col gap-y-4 mt-10">
            <div className="flex justify-between">
              <button className="rounded-xl px-4 py-2 border border-gray-100 hover:bg-gray-100 hover:text-black">Execute</button>
              <button className="rounded-xl px-4 py-2 border border-gray-100 hover:bg-gray-100 hover:text-black">Withdraw</button>
            </div>
            <button className="rounded-xl px-4 py-2 border border-gray-100 hover:bg-gray-100 hover:text-black">
              Stake ether
            </button>
          </div>
      </div>
    </div>
  );
}

export default Stake;