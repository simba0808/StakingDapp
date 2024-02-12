// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "hardhat/console.sol";
import "./External.sol";

contract Staker {
    External public externalContract;

    //staking reward per second
    uint256 public constant rewardRate = 0.1 ether;

    //deadline for staking to begin/end
    uint256 public withdrawalDeadline = block.timestamp + 10 seconds;
    uint256 public claimDeadline = block.timestamp + 20 seconds;

    //current block
    uint256 public currentBlock = 0;

    //deposited amount per address
    mapping(address => uint256) public balances;
    
    //deposited timestamp per address
    mapping(address => uint256) public depositTimestamps;

    event Stake(address indexed sender, uint256 amount);
    event Received(address indexed receiver, uint256 amount);
    event Execute(address indexed sender, uint256 amount);

    constructor(address externalContractAddress) {
        externalContract = External(externalContractAddress);
    }

    function withdrawalTimeLeft() public view returns (uint256 withdrawalTimeLeft) {
        if(block.timestamp >= withdrawalDeadline) {
            return (0);
        } else {
            return (withdrawalDeadline - block.timestamp);
        }
    }

    function claimPeriodLeft() public view returns (uint256 claimPeriodLeft) {
        if(block.timestamp >= claimDeadline) {
            return (0);
        } else {
            return (claimDeadline - block.timestamp);
        }
    }

    modifier withdrawalDeadlineReached(bool requireReached) {
        uint256 timeRemaining = withdrawalTimeLeft();
        if(requireReached) {
            require(timeRemaining == 0, "Withdrawal period is not reached yet");
        } else {
            require(timeRemaining > 0, "Withdrawal period has been reached");
        }
        _;
    }

    modifier claimDeadlineReached(bool requireReached) {
        uint256 timeRemaining = claimPeriodLeft();
        if(requireReached) {
            require(timeRemaining == 0, "Claim deadline is not reached yet");
        } else {
            require(timeRemaining > 0, "Claim deadline has been reached");
        }
        _;
    }

    modifier notCompleted() {
        bool completed = externalContract.completed();
        require(!completed, "Stake already completed");
        _;
    }

    function stake() public payable withdrawalDeadlineReached(false) claimDeadlineReached(false) {
        balances[msg.sender] = balances[msg.sender] + msg.value;
        depositTimestamps[msg.sender] = block.timestamp;

        emit Stake(msg.sender, msg.value);
    }

    function withdraw() public withdrawalDeadlineReached(true) claimDeadlineReached(false) notCompleted {
        require(balances[msg.sender] > 0, "You have no balance to withdraw");
        
        uint256 currentBalance = balances[msg.sender];
        uint256 amountToWithdraw = currentBalance + ((block.timestamp - depositTimestamps[msg.sender]) * rewardRate);
        balances[msg.sender] = 0;

        (bool sent, bytes memory data) = msg.sender.call{value: amountToWithdraw}("");
    
        require(sent, "Failed to send Ether");
    }

    function execute() public claimDeadlineReached(true) notCompleted {
        externalContract.complete{value: address(this).balance}();
    }

    function killTime() public {
        currentBlock = block.timestamp;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
