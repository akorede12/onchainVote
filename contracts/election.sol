pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED

import "./voting.sol";

contract Election is Voting {
    // count of all elections
    uint public electionCount;

    // mapping to keep track of election count to election contract address
    mapping(uint => address) electionAddresses;

    // mapping to keep track of election address to election info
    mapping(address => electionInfo) public electionDetails;

    // mapping to keep track of electionId to election details.
    mapping(uint => electionInfo) public electionIdToDetails;

    // Struct to keep track of election data.
    struct electionInfo {
        uint electionId;
        bytes32 electioName;
        address electionCreator;
        address electionAddress;
    }

    event newElectionCreated(
        uint electionId,
        bytes32 eventName,
        address electionCreator,
        address electionAddress
    );

    function getElectionCount() public view returns (uint _electionCount) {
        return electionCount;
    }

    constructor() Voting("", msg.sender) {
        electionCount = 0;
    }

    // modify function to pass in an address to use as contract creator
    function createElection(
        bytes32 _electionName
    ) public returns (address _electionAddress) {
        // uint electionId = electionCount;
        // create new instance of voting contract (an election)
        Voting newElection = new Voting(_electionName, msg.sender);
        // increase election count
        electionCount++;
        // update electionAddresses mapping
        electionAddresses[electionCount] = address(newElection);

        _electionAddress = address(newElection);

        // update mapping & struct.
        electionDetails[_electionAddress] = electionInfo(
            electionCount,
            _electionName,
            msg.sender,
            _electionAddress
        );

        electionIdToDetails[electionCount] = electionInfo(
            electionCount,
            _electionName,
            msg.sender,
            _electionAddress
        );

        emit newElectionCreated(
            electionCount,
            _electionName,
            msg.sender,
            _electionAddress
        );

        return _electionAddress;
    }

    function viewElectionAddress(
        uint _index
    ) public view returns (address _electionAddress) {
        return electionAddresses[_index];
    }

    function viewLastDeployedElection()
        public
        view
        returns (address _electionAddress)
    {
        return electionAddresses[electionCount];
    }

    function getElectionDetails(
        address _electionAddress
    ) public view returns (electionInfo memory) {
        // obtain election details from electionDetails mapping. and store in a struct.
        electionInfo memory ThisElectionInfo = electionDetails[
            _electionAddress
        ];
        // return election details
        return ThisElectionInfo;
    }

    function myElections() public view returns (electionInfo[] memory, uint) {
        uint myElectionCount = 0;

        uint currentIndex = 0;

        for (uint i = 0; i <= electionCount; i++) {
            if (electionIdToDetails[i].electionCreator == msg.sender) {
                myElectionCount += 1;
            }
        }

        electionInfo[] memory myCreatedElections = new electionInfo[](
            myElectionCount
        );

        for (uint i = 0; i <= electionCount; i++) {
            if (electionIdToDetails[i].electionCreator == msg.sender) {
                uint currentElectionId = i;
                // reference current election details
                electionInfo storage currentElection = electionIdToDetails[
                    currentElectionId
                ];
                // store current election in myElections array
                myCreatedElections[currentIndex] = currentElection;
                // increase index
                currentIndex += 1;
            }
        }
        return (myCreatedElections, myElectionCount);
    }

    function allElections() public view returns (electionInfo[] memory) {
        uint currentIndex = 0;

        electionInfo[] memory allCreatedElections = new electionInfo[](
            electionCount
        );

        for (uint i = 0; i < electionCount; i++) {
            uint currentElectionId = i + 1;
            // reference current election details
            electionInfo storage currentElection = electionIdToDetails[
                currentElectionId
            ];
            // store current election in myElections array
            allCreatedElections[currentIndex] = currentElection;
            // increase index
            currentIndex += 1;
        }
        return allCreatedElections;
    }
}
