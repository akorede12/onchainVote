import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Votingabi from "../artifacts/contracts/voting.sol/Voting.json";
import { useContract, useContractWrite, usePrepareContractWrite } from "wagmi";

export default function Vote({ address }) {
  const { Address } = address;
  // voting contract state variables
  const [electionCreator, setElectionCreator] = useState("");
  const [voteOption, setVoteOptions] = useState([]);
  const [newVoteOption, setNewVoteOption] = useState("");
  const [allowedVotters, setAllowedVotters] = useState([]);
  const [newElectionName, setNewElectionName] = useState("");
  const [electionDetails, setElectionDetails] = useState({
    Name: "",
    Creator: "",
  });
  // for register voter
  const [newVoter, setNewVoter] = useState("");
  // for unregister voter
  const [voter, setVoter] = useState("");

  // const [allVotes, setAllVotes] = useState([
  //     { address: "", optionNumber: ""}]);

  // vote option for cast vote function
  const [castVoteOption, setCastVoteOption] = useState("");
  const [contractAddress, setContractAddress] = useState("");

  // useEffect(() => {
  //     voteOptions,
  //     allowedVoters
  // }, [voteOption, allowedVotters]);

  useEffect(() => {
    let newAddress = Address.toString();
    setContractAddress(newAddress);
  }, [Address]);

  // Write functions: Wagmi
  // setElectionDetails
  const { config: setElectionDetailsconfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: Votingabi.abi,
    functionName: "setElectionDetails",
    args: [newElectionName],
  });

  const { write: setElectionDetailsWrite } = useContractWrite(
    setElectionDetailsconfig
  );

  // registerVoter
  const { config: registerVoterConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: Votingabi.abi,
    functionName: "registerVoter",
    args: [newVoter],
  });

  const { write: registerVoterWrite } = useContractWrite(registerVoterConfig);

  // unregisterVoter
  const { config: unregisterVoterConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: Votingabi.abi,
    functionName: "unregisterVoter",
    args: [voter],
  });

  const { write: unregisterVoterWrite } = useContractWrite(
    unregisterVoterConfig
  );

  // addVoteOption
  const { config: addVoteOptionConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: Votingabi.abi,
    functionName: "addVoteOption",
    args: [newVoteOption],
  });

  const { write: addVoteOptionWrite } = useContractWrite(addVoteOptionConfig);

  // castVote
  const { config: castVoteConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: Votingabi.abi,
    functionName: "castVote",
    args: [castVoteOption],
  });

  const { write: castVoteWrite } = useContractWrite(castVoteConfig);

  // Read Function: Ethers
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mumbai.matic.today"
  );
  const ethersVoting = new ethers.Contract(
    contractAddress,
    Votingabi.abi,
    provider
  );

  // getElectionDetails
  const getElectionDetails = async () => {
    const electionData = await ethersVoting.getElectionDetails();
    setElectionDetails({
      Name: electionData.electionName,
      creator: electionData.electionCreator,
    });
  };

  // // getVotes
  // const getVotes = async () => {
  //     const votesArray = await ethersVoting.getVotes()
  //     setAllVotes({address: votesArray.validVoter.toString(), optionNumber: votesArray.votedFor.toString()})
  // }

  // allowed voters
  const allowedVoters = async () => {
    const allowedVotersArray = await ethersVoting.allowedVoters();
    setAllowedVotters(allowedVotersArray);
  };

  // voteOptions
  const voteOptions = async () => {
    const voteOptionsArray = await ethersVoting.voteOptions();
    setVoteOptions(voteOptionsArray);
  };
  return (
    <div>
      <main>
        <div>
          <h2> Election address: {contractAddress}</h2>
          <h2>Set election details</h2>
          <input
            type="text"
            placeholder=" enter election name"
            onChange={(e) => setNewElectionName(e.target.value)}
          />
          <button onClick={() => setElectionDetailsWrite?.()}>
            set election name
          </button>
        </div>

        <div>
          <h2> Register Voters</h2>
          <input
            type="text"
            placeholder="enter voter address"
            onChange={(e) => setNewVoter(e.target.value)}
          />
          <button onClick={() => registerVoterWrite?.()}>register voter</button>
        </div>

        <div>
          <h2> Unregister Voters</h2>
          <input
            type="text"
            placeholder="enter voter address"
            onChange={(e) => setVoter(e.target.value)}
          />
          <button onClick={() => unregisterVoterWrite?.()}>
            Unregister voter
          </button>
        </div>

        <div>
          <input
            type="text"
            placeholder="enter vote option"
            onChange={(e) => setNewVoteOption(e.target.value)}
          />
          <button onClick={() => addVoteOptionWrite?.()}>
            Add vote option
          </button>
        </div>

        <div>
          <h2>vote options </h2>
          <ul>
            {voteOption.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>

        <div>
          <input
            type="text"
            placeholder="enter vote option"
            onChange={(e) => setCastVoteOption(e.target.value)}
          />
          <button onClick={() => castVoteWrite?.()}>cast vote</button>
        </div>
        <div>
          {getElectionDetails}
          <button onClick={() => getElectionDetails()}>
            get election details
          </button>
          <h2> Election details</h2>
          <p> Name: {electionDetails.Name} </p>
          <p> creator: {electionDetails.Creator}</p>
        </div>

        <div>
          <h2> get all votes, not working</h2>

          {/* <button onClick={() => getVotes()}> 
                 get all votes data 
                </button>
                <ul>
                    {allVotes.map((add, option, index) => (
                        <li key={index}>Address:{add} option:{option}</li>
                    ))
                    }
                </ul> */}
        </div>

        <div>
          <h2> Allowed Voters </h2>
          <ul>
            {allowedVotters.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
          <form
            noValidate
            //onSubmit={handleSubmit}
          >
            <Stack direction="row" spacing={5}>
              {voteOptions.map((option, index) => (
                <Chip
                  key={index}
                  label={option}
                  clickable
                  onClick={() => setVoteChip(option)}
                  color={voteChip === option ? "primary" : "default"}
                  size="large"
                />
              ))}
            </Stack>
            <br />
            <Typography variant="p"> selected option: {voteChip}</Typography>
            <br />
            <br />
            <Button type="submit" variant="contained">
              Vote
            </Button>
          </form>

          <br />
        </div>
      </main>
    </div>
  );
}

//    export default Vote()
