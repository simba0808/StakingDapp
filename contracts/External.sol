//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract External {
    bool public completed;

    function complete() payable public {
        completed = true;
    }
}