//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract External {
    bool public completed;

    function complete() payable public {
        completed = true;
    }

    receive() external payable {
        // Receive Ether sent from another contract
        completed = true;
    }

    fallback() external payable {
        // Receive Ether sent from another contract
        completed = true;
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
}