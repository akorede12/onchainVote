pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED

library checker {
    function isValidOption(
        bytes32[] memory voteOptions,
        bytes32 option
    ) public pure {
        uint optionIndex;
        for (uint i = 0; i < voteOptions.length; i++) {
            // if(keccak256(abi.encodePacked(voteOptions[i])) == keccak256(abi.encodePacked(option))){
            if (voteOptions[i] == option) {
                optionIndex = i;
                break;
            }
        }
        require(voteOptions[optionIndex] == option, "Option is not valid");
    }

    function getOptionIndex(
        bytes32[] memory voteOptions,
        bytes32 option
    ) public pure returns (uint8) {
        for (uint8 i = 0; i < voteOptions.length; i++) {
            if (voteOptions[i] == option) {
                return i;
            }
        }
        revert("Invalid vote option.");
    }
}
