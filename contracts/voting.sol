pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED

import "./checker.sol";

contract Voting {
    // contract owner
    address public owner;

    // name of election
    string electionName;
    // address of election creator
    address electionCreator;

    // mapping of voter address
    mapping(address => bool) public voters;
    mapping(address => uint) public votes;
    string[] public voteOptions;

    // array to keep track of voters
    address[] public allowedVoters;

    // struct to order getVotes function data
    struct voterAndVotes {
        address validVoter;
        uint votedFor;
    }

    constructor(string memory _electionName) {
        owner = msg.sender;
        electionName = _electionName;
        electionCreator = msg.sender;
    }

    // events
    event newVote(address voter, string voteOption);

    event newVoterAdded(address voterAddress);

    event voterRemoved(address voterAddress);

    event addedVoteOption(string voteOption);

    // set details of elections
    function setElectionDetails(
        string memory _electionName
    ) public returns (string memory, address) {
        electionName = _electionName;
        electionCreator = msg.sender;
        return (electionName, electionCreator);
    }

    // get election details
    function getElectionDetails() public view returns (string memory, address) {
        return (electionName, electionCreator);
    }

    function registerVoter(address voter) public {
        // the person registering voters should be election creator not owner
        require(msg.sender == owner);
        require(!voters[voter]);
        voters[voter] = true;
        // add new voter to the array
        allowedVoters.push(voter);
        emit newVoterAdded(voter);
    }

    function unregisterVoter(address voter) public {
        require(msg.sender == owner);
        require(voters[voter]);
        voters[voter] = false;

        // delete voter from array
        for (uint i = 0; i < allowedVoters.length; i++) {
            if (allowedVoters[i] == voter) {
                allowedVoters[i] = allowedVoters[allowedVoters.length - 1];
                allowedVoters.pop();
            }
        }
        emit voterRemoved(voter);
    }

    function addVoteOption(string memory option) public {
        require(msg.sender == owner);
        voteOptions.push(option);
        emit addedVoteOption(option);
    }

    function castVote(string memory option) public {
        //voters[msg.sender] = false;
        require(voters[msg.sender], "voter is not registered.");
        require(votes[msg.sender] == 0, " Voter has already voted.");
        // use checker library to check if user option is valid
        checker.isValidOption(voteOptions, option);
        // get the index of the options in voteOptions array
        uint optionIndex = checker.getOptionIndex(voteOptions, option);
        // update votes mapping
        votes[msg.sender] = optionIndex + 1;
        // adding + 1 because it helps to solve the multiple votes bug.
        // users who vote for the first voteOptions can vote multiple times
        // until they choose a different option.
        emit newVote(msg.sender, option);
    }

    function getVotes() public view returns (voterAndVotes[] memory) {
        // uint variable to keep track of dynamic array
        uint voterVoteCount = 0;
        // for loop to iterate through the allowedVoters arrays,
        // for loop to chack if the users gotten from the allowedVoters have voted, with votes mapping
        for (uint i = 0; i < allowedVoters.length; i++) {
            // check
            if (voters[allowedVoters[i]] == true) {
                voterVoteCount++;
            }
        }
        //
        voterAndVotes[] memory voterVotesArray = new voterAndVotes[](
            voterVoteCount
        );

        //
        uint count = 0;

        // for loop to iterate through the allowedVoters arrays,
        // and check if the users gotten from the allowedVoters have voted, with votes mapping
        for (uint i = 0; i < allowedVoters.length; i++) {
            // check
            if (voters[allowedVoters[i]] == true) {
                address currentVoter = allowedVoters[i];
                uint currentVote = votes[currentVoter];

                voterVotesArray[count] = voterAndVotes(
                    currentVoter,
                    currentVote
                );
                count++;
            }
        }
        return voterVotesArray;
    }
}
