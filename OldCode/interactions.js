import Head from "next/head";
import "../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { ElectionContract } from "../config";
import Electionabi from "../artifacts/contracts/election.sol/Election.json";
import Votingabi from "../artifacts/contracts/voting.sol/Voting.json";
import { useContract, useContractWrite, usePrepareContractWrite } from "wagmi";

export default function Home() {
  // election contract state variables
  const [electionCount, setElectionCount] = useState("");
  const [electionName, setElectionName] = useState("");
  const [newElectionAddress, setNewElectionAddress] = useState("");
  const [electionAddress, setElectionAddress] = useState("");
  const [lastElectionAddress, setLastElectionAddress] = useState("");
  const [electionOwner, setElectionOwner] = useState("");
  const [allCreatedElections, setAllCreatedElections] = useState([]);
  const [index, setIndex] = useState("");

  // I need javascript code to return the address value from a smart contract function that returns address as output, I want to return the address and render it on the frontend?

  // wagmi set up
  const { config } = usePrepareContractWrite({
    address: ElectionContract,
    abi: Electionabi.abi,
    functionName: "createElection",
    args: [electionName],
  });

  const { write } = useContractWrite(config);

  // ethers set up
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mumbai.matic.today"
  );
  const ethersElection = new ethers.Contract(
    ElectionContract,
    Electionabi.abi,
    provider
  );

  // Smart Contract Read functions
  const getElectionCount = async () => {
    const count = await ethersElection.getElectionCount();
    setElectionCount(count.toNumber());
  };

  const viewElectionAddress = async (index) => {
    const address = await ethersElection.viewElectionAddress(index);
    setElectionAddress(address);
  };

  const viewLastDeployedElection = async () => {
    const address = await ethersElection.viewLastDeployedElection();
    setLastElectionAddress(address);
  };

  const allElections = async () => {
    const addresses = await ethersElection.allElections();
    setAllCreatedElections(addresses);
  };

  // Voting contract interaction
  const VotingContract = async (address) => {
    new ethers.Contract(address, Votingabi.abi, provider);
  };

  const registerVoter = async (voterAddress) => {
    await VotingContract.registerVoter(voterAddress);
    const updatedVoters = await VotingContract.getAllVoters();
    setNewVoter(updatedVoters);
  };

  ///

  ///

  const [votingContractAddress, setVotingContractAddress] = useState("");
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
  const [allVotes, setAllVotes] = useState([{ address: "", optionNumber: "" }]);
  // vote option for cast vote function
  const [castVoteOption, setCastVoteOption] = useState("");

  const voteContractAddress = votingContractAddress.toString();

  const creator = async () => {
    contractDeployer = await ethersVoting.owner().toString();
    setElectionCreator(contractDeployer);
  };

  useEffect(() => {
    voteOptions, allowedVoters;
  }, [voteOption, allowedVotters]);

  // Write functions: Wagmi
  // setElectionDetails
  const { config: setElectionDetailsconfig } = usePrepareContractWrite({
    address: voteContractAddress,
    abi: Votingabi.abi,
    functionName: "setElectionDetails",
    args: [newElectionName],
  });

  const { write: setElectionDetailsWrite } = useContractWrite(
    setElectionDetailsconfig
  );

  // registerVoter
  const { config: registerVoterConfig } = usePrepareContractWrite({
    address: voteContractAddress,
    abi: Votingabi.abi,
    functionName: "registerVoter",
    args: [newVoter],
  });

  const { write: registerVoterWrite } = useContractWrite(registerVoterConfig);

  // unregisterVoter
  const { config: unregisterVoterConfig } = usePrepareContractWrite({
    address: voteContractAddress,
    abi: Votingabi.abi,
    functionName: "unregisterVoter",
    args: [voter],
  });

  const { write: unregisterVoterWrite } = useContractWrite(
    unregisterVoterConfig
  );

  // addVoteOption
  const { config: addVoteOptionConfig } = usePrepareContractWrite({
    address: voteContractAddress,
    abi: Votingabi.abi,
    functionName: "addVoteOption",
    args: [newVoteOption],
  });

  const { write: addVoteOptionWrite } = useContractWrite(addVoteOptionConfig);

  // castVote
  const { config: castVoteConfig } = usePrepareContractWrite({
    address: voteContractAddress,
    abi: Votingabi.abi,
    functionName: "castVote",
    args: [castVoteOption],
  });

  const { write: castVoteWrite } = useContractWrite(castVoteConfig);

  // Read Function: Ethers
  //const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today");
  const ethersVoting = new ethers.Contract(
    voteContractAddress,
    Votingabi.abi,
    provider
  );

  // getElectionDetails
  const getElectionDetails = async () => {
    const electionData = await ethersVoting.getElectionDetails();
    setElectionDetails({
      Name: electionData.electionName.toString(),
      creator: electionData.electionCreator.toString(),
    });
  };

  // getVotes
  const getVotes = async () => {
    const votesArray = await ethersVoting.getVotes();
    setAllVotes({
      address: votesArray.validVoter,
      optionNumber: votesArray.votedFor,
    });
  };
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
      <Head>
        <title>OnChain Votes - Interactions</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="page">
          <ConnectButton />
          <section>
            <h1>Election Contract Interactions</h1>

            <div>
              <input
                type="text"
                placeholder="Enter Election Name"
                onChange={(e) => setElectionName(e.target.value)}
              />
              <button onClick={() => write?.()}>Create Election</button>
            </div>

            <div>
              <button onClick={getElectionCount}>Get Election Count</button>
              <p>Election Count: {electionCount}</p>
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter Index"
                onChange={(e) => setIndex(e.target.value)}
              />
              <button onClick={() => viewElectionAddress(index)}>
                View Election Address
              </button>
              <p>election address: {electionAddress}</p>
            </div>

            <div>
              <button onClick={viewLastDeployedElection}>
                View Last Deployed Election
              </button>
              <p>Last Election Address: {lastElectionAddress}</p>
            </div>

            <div>
              <button onClick={allElections}>View All Elections</button>
              <ul>
                {allCreatedElections.map((address, index) => (
                  <li key={index}>{address}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Voting contract interaction*/}
          <h1>Voting contract interactions</h1>

          <section>
            <div>
              <input
                type="text"
                placeholder="vote contract address"
                onChange={(e) => setVotingContractAddress(e.target.value)}
              />
              <button onClick={() => voteContractAddress}>
                set vote contract address
              </button>
              <p> vote contract address: {voteContractAddress}</p>
            </div>

            <div>
              <button onClick={() => creator}> view contract creator </button>
              <p>Contract creator: {electionCreator}</p>
            </div>

            <div>
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
              <button onClick={() => registerVoterWrite?.()}>
                register voter
              </button>
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
              <h2> Add vote options </h2>
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
              <button
                onClick={() => {
                  voteOptions;
                }}
              >
                {" "}
                View vote Options
              </button>
              <ul>
                {voteOption.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2> Cast Vote </h2>
              <input
                type="text"
                placeholder="enter vote option"
                onChange={(e) => setCastVoteOption(e.target.value)}
              />
              <button onClick={() => castVoteWrite?.()}>cast vote</button>
            </div>

            <div>
              <h2> Election details</h2>
              <button onClick={() => getElectionDetails}>
                get election details
              </button>
              <p> Name: {electionDetails.Name} </p>
              <p> creator: {electionDetails.Creator}</p>
            </div>

            {/* <div>
                    <h2> get all votes </h2>
                 */}
            {/* <button onClick={() => getVotes()}> 
                 get all votes data 
                </button>
                <ul>
                    {allVotes.map((add, option, index) => (
                        <li key={index}>Address:{add} option:{option}</li>
                    ))
                    }
                </ul>
                </div> */}

            <div>
              <h2> Allowed Voters </h2>
              <ul>
                {allowedVotters.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
