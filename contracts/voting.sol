pragma solidity ^0.8.0;
// SPDX-License-Identifier: UNLICENSED

import "./checker.sol";

contract Voting {
    address public owner;

    bytes32 public electionName;

    address public electionCreator;

    mapping(address => bool) public voters;
    mapping(address => uint) public votes;

    bytes32[] public voteOptions;

    address[] public allowedVoters;

    struct voterAndVotes {
        address validVoter;
        uint votedFor;
    }

    struct votesForVoteOptions {
        bytes32 voteOption;
        uint voteCount;
    }

    constructor(bytes32 _electionName, address electionCretor) {
        owner = msg.sender;
        electionName = _electionName;
        electionCreator = electionCretor;
    }

    modifier onlyOwnerOrSecondary() {
        require(
            msg.sender == owner || msg.sender == electionCreator,
            "Caller is not authorized."
        );
        _;
    }

    event newVote(address voter, bytes32 voteOption);

    event newVoterAdded(address[] voterAddress);

    event voterRemoved(address voterAddress);

    event addedVoteOption(bytes32 voteOption);

    function setElectionDetails(
        bytes32 _electionName
    ) public onlyOwnerOrSecondary returns (bytes32, address) {
        electionName = _electionName;
        electionCreator = msg.sender;
        return (electionName, electionCreator);
    }

    function getElectionDetails() public view returns (bytes32, address) {
        return (electionName, electionCreator);
    }

    function addAllowedVoter(address newVoter) internal {
        allowedVoters.push(newVoter);
    }

    function registerVoter(
        address[] memory newVoter
    ) public onlyOwnerOrSecondary {
        for (uint i = 0; i < newVoter.length; i++) {
            if (!voters[newVoter[i]]) {
                voters[newVoter[i]] = true;

                addAllowedVoter(newVoter[i]);
            } else {
                revert("Voter already registered");
            }
        }

        emit newVoterAdded(newVoter);
    }

    function viewVoters() public view returns (address[] memory) {
        return (allowedVoters);
    }

    function unregisterVoter(address voter) public onlyOwnerOrSecondary {
        require(voters[voter]);
        voters[voter] = false;

        for (uint i = 0; i < allowedVoters.length; i++) {
            if (allowedVoters[i] == voter) {
                allowedVoters[i] = allowedVoters[allowedVoters.length - 1];
                allowedVoters.pop();
            }
        }
        emit voterRemoved(voter);
    }

    function addVoteOption(bytes32 option) internal {
        for (uint i = 0; i < voteOptions.length; i++) {
            require(voteOptions[i] != option, "Option already exists.");
        }
        voteOptions.push(option);
        emit addedVoteOption(option);
    }

    function viewVoteOptions() public view returns (bytes32[] memory) {
        return (voteOptions);
    }

    function addVoteOptions(
        bytes32[] memory newOptions
    ) public onlyOwnerOrSecondary {
        for (uint i = 0; i < newOptions.length; i++) {
            addVoteOption(newOptions[i]);
        }
    }

    // castVotes
    function castVote(bytes32 option) public {
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

        voterAndVotes[] memory voterVotesArray = new voterAndVotes[](
            voterVoteCount
        );

        uint count = 0;

        // for loop to iterate through the allowedVoters arrays,
        // for loop to check if the users gotten from the allowedVoters have voted, with votes mapping
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

    function getVoteOptionVoteCount(bytes32 option) public view returns (uint) {
        // use checker library to check if user option is valid
        checker.isValidOption(voteOptions, option);
        // get the index of the options in voteOptions array
        uint optionIndex = checker.getOptionIndex(voteOptions, option);
        // Add one to option index to prevent index from starting from 0
        optionIndex + 1;

        // variable to keep track of vote count
        uint voteCount = 0;

        // votes[msg.sender] = optionIndex + 1;
        // for loop to loop through allowedVoters array and votes mapping
        for (uint i = 0; i < allowedVoters.length; i++) {
            if (votes[allowedVoters[i]] == optionIndex + 1) {
                voteCount++;
            }
        }
        return voteCount;
    }

    function getElectionWinner() public view returns (bytes32) {
        // struct array of votes and vote Options
        votesForVoteOptions[]
            memory votesForVoteOptionsArray = new votesForVoteOptions[](
                voteOptions.length
            ); //= new votesForVoteOptions[]

        // loop count
        uint count = 0;

        for (uint i = 0; i < voteOptions.length; i++) {
            bytes32 currentOption = voteOptions[i];
            uint optionVoteCount = getVoteOptionVoteCount(voteOptions[i]);
            votesForVoteOptionsArray[count] = votesForVoteOptions(
                currentOption,
                optionVoteCount
            );

            count++;
        }

        // Find the option with the highest vote count
        bytes32 winner = "";
        uint maxVotes = 0;
        bool isTie = false;
        for (uint i = 0; i < votesForVoteOptionsArray.length; i++) {
            if (votesForVoteOptionsArray[i].voteCount > maxVotes) {
                maxVotes = votesForVoteOptionsArray[i].voteCount;
                winner = votesForVoteOptionsArray[i].voteOption;
                isTie = false;
            } else if (votesForVoteOptionsArray[i].voteCount == maxVotes) {
                isTie = true;
            }
        }

        if (isTie) {
            return "Tie between top vote options";
        } else {
            return winner;
        }
    }
}
