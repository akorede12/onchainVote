import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "../styles/Home.module.css";
import { Box } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { useRouter } from "next/router";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import ViewListIcon from "@mui/icons-material/ViewList";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import TextField from "@mui/material/TextField";
import { useState, useEffect } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import { MuiChipsInput } from "mui-chips-input";
import Chip from "@mui/material/Chip";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { ElectionContract } from "../config";
import Electionabi from "../artifacts/contracts/election.sol/Election.json";
import Votingabi from "../artifacts/contracts/voting.sol/Voting.json";
import {
  useContract,
  useContractWrite,
  usePrepareContractWrite,
  useAccount,
  useSigner,
} from "wagmi";

import {
  LastDeployedElection,
  AllElections,
  ViewElectionAddress,
  GetElectionCount,
} from "../components/elections";
import Head from "next/head";
import { parseBytes, createBytes } from "../components/bytesTranform";

export default function Create() {
  // Contract interactions
  const [votingContractAddress, setVotingContractAddress] = useState("");
  const [electionName, setElectionName] = useState("");
  const [newElectionName, setNewElectionName] = useState("");
  const [electionCreator, setElectionCreator] = useState("");

  const [newElectionCreator, setNewElectionCreator] = useState("");

  const { address } = useAccount();

  useEffect(() => {
    setNewElectionCreator(address);
  }, [address]);

  // format inputs and outputs
  const formatedName = ethers.utils.formatBytes32String(electionName);
  // const formatedBytes = ethers.utils.parseBytes32String(newElectionName);

  async function createNewElection() {
    const formattedName = ethers.utils.formatBytes32String(electionName);

    const contract = new ethers.Contract(
      ElectionContract,
      Electionabi.abi,
      signer
    );
    try {
      const tx = await contract.createElection(
        formattedName,
        newElectionCreator
      );
      await tx.wait();
      // Call the electionInfo function after transaction has been successful
      await electionInfo;
    } catch (error) {
      console.error(error);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    createNewElection();
  };

  // testing wagmi useProvider with ethers

  const { data: signer } = useSigner();

  const [Details, setDetails] = useState([]);
  const [clicked, setClicked] = useState(false);

  const electionTest = async () => {
    const provider = new ethers.providers.JsonRpcProvider();

    const ethersVote = new ethers.Contract(
      ElectionContract,
      Electionabi.abi,
      signer // provider
    );

    const Details = await ethersVote.allElections(); // { name, creator}
    setDetails(Details);
    setClicked(true);
  };

  // Election Details

  const electionInfo = async () => {
    const address = await LastDeployedElection();

    const provider = new ethers.providers.JsonRpcProvider();

    const ethersVote = new ethers.Contract(address, Votingabi.abi, provider);

    const details = await ethersVote.getElectionDetails(); // { name, creator}
    console.log(details); // log the details object
    const name = details[0];
    const formatName = ethers.utils.parseBytes32String(name);
    console.log(name, formatName);
    setNewElectionName(formatName.toString());
    setElectionCreator(details[1]);
    setVotingContractAddress(address);
  };

  // Add voters

  const [voters, setVoters] = useState([]);
  const [voterChips, setVoterChips] = useState([]);

  const handleChange = (voterChips) => {
    setVoterChips(voterChips);
  };

  const addVoters = async (e) => {
    e.preventDefault();
    console.log(voterChips);
    const address = await LastDeployedElection();

    const ethersVote = new ethers.Contract(address, Votingabi.abi, signer);

    const newVoters = await ethersVote.registerVoter(voterChips);
  };

  // view voters

  const [allowedVoters, setAllowedVoters] = useState([]);

  const viewVoters = async () => {
    const address = await LastDeployedElection();
    const ethersVote = new ethers.Contract(address, Votingabi.abi, signer);
    const getVoters = await ethersVote.viewVoters();
    setAllowedVoters(getVoters);
  };

  // Add vote options
  const [optionChips, setOptionChips] = useState([]);

  const optionChipsToBytes = optionChips.map((str) =>
    ethers.utils.formatBytes32String(str)
  );
  const handleOptions = (optionChips) => {
    setOptionChips(optionChipsToBytes);
  };
  async function uploadOptions(e) {
    e.preventDefault();
    const address = await LastDeployedElection();
    const ethersVote = new ethers.Contract(address, Votingabi.abi, signer);

    try {
      const upload = await ethersVote.addVoteOptions(optionChipsToBytes);
      console.log(optionChipsToBytes);
    } catch (error) {
      console.error(error);
    }
  }

  // view vote options
  const [viewOptions, setViewOptions] = useState([]);

  async function viewVoteOptions() {
    const address = await LastDeployedElection();
    const provider = new ethers.providers.JsonRpcProvider();
    const ethersVote = new ethers.Contract(address, Votingabi.abi, provider);
    const voteOptions = await ethersVote.viewVoteOptions();
    const formatetOptions = voteOptions.map((opt) =>
      ethers.utils.parseBytes32String(opt)
    );

    setViewOptions(formatetOptions);
  }

  // Vote

  const [selectedOption, setSelectedOption] = useState(null);

  const [vote, setVote] = useState();

  const handleVote = (option) => {
    setVote(option);
    setSelectedOption(option);
    console.log(option);
  };

  async function Vote() {
    const address = await LastDeployedElection();
    const ethersVote = new ethers.Contract(address, Votingabi.abi, signer);
    const formatVote = ethers.utils.formatBytes32String(vote);

    try {
      const castVote = await ethersVote.castVote(formatVote);
      console.log(vote);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    viewVoteOptions();
  }, []);

  // get vote counts

  const [selectedOption2, setSelectedOption2] = useState(null);

  const [vote2, setVote2] = useState();

  const [voteCount, setVoteCount] = useState();

  async function getVotesCount() {
    const address = await LastDeployedElection();
    const ethersVote = new ethers.Contract(address, Votingabi.abi, signer);
    const formatVote = ethers.utils.formatBytes32String(vote2);
    const getVote = await ethersVote.getVoteOptionVoteCount(formatVote);
    setVoteCount(getVote.toString());
  }

  const checkVote = (option) => {
    setVote2(option);
    setSelectedOption2(option);
    console.log(option);
  };

  useEffect(() => {
    if (vote2) {
      getVotesCount();
    }
  }, [vote2]);

  // get all Votes

  const [allVotes, setAllVotes] = useState([]);
  async function getVotes() {
    const address = await LastDeployedElection();
    const ethersVote = new ethers.Contract(address, Votingabi.abi, signer);
    const Votes = await ethersVote.getVotes();
    console.log(Votes);

    // Map over the returned array of objects and format the data
    const formattedVotes = Votes.map((vote) => {
      const voter = vote[0];
      const voterVoteCount = vote[1] ? vote[1].toString() : "0";
      return `voter address: ${voter} - option number: ${voterVoteCount}`;
    });
    console.log(formattedVotes);
    setAllVotes(formattedVotes);
  }

  const [winner, setWinner] = useState();
  async function getWinner() {
    const address = await LastDeployedElection();
    const ethersVote = new ethers.Contract(address, Votingabi.abi, signer);
    const winner = await ethersVote.getElectionWinner();
    const formatWinner = ethers.utils.parseBytes32String(winner);
    setWinner(formatWinner);
    console.log(winner, formatWinner);
  }

  return (
    <div>
      <Head>
        <title>OnChain Votes - Create Elections</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Box component="div">
          <ConnectButton showBalance={false} />

          <Paper sx={{ boxShadow: "none" }}>
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
              <Typography variant="h3" color="primary">
                Create a New Election
              </Typography>
              <br />
              <br />
              <Typography variant="h5" color="secondary">
                Enter Election Name{" "}
              </Typography>
              <TextField
                onChange={(e) => setElectionName(e.target.value)}
                label="Election Name"
                variant="outlined"
                required
                sx={{ mt: 2 }}
              />
              <br />
              <br />
              <Button type="submit" variant="contained">
                Create new Election
              </Button>
            </form>
          </Paper>
        </Box>
        <br />

        <Box>
          <Paper sx={{ boxShadow: "none" }}>
            <Button variant="outlined" onClick={electionInfo}>
              <Typography variant="h5" color="primary">
                Election Details
              </Typography>
            </Button>
            <br />
            <br />
            <Typography variant="h7" color="secondary">
              Election Name: {newElectionName}
            </Typography>
            <br />
            <Typography variant="h7" color="secondary">
              Election Address: {votingContractAddress}
            </Typography>
            <br />
            <Typography variant="h7" color="secondary">
              Election Creator: {electionCreator}
            </Typography>
            <br />
          </Paper>
        </Box>

        <br />
        <Box component="div">
          <Paper sx={{ boxShadow: "none" }}>
            <Typography variant="h3" color="primary">
              Modify Voting Criteria
            </Typography>
            <br />
            <Typography variant="h5" color="secondary">
              Add Voters to Election
            </Typography>
            <MuiChipsInput value={voterChips} onChange={handleChange} />
            <br />
            <Button onClick={addVoters}> Upload Voters</Button>
            <br />
          </Paper>
        </Box>

        <br />
        <Button variant="outlined" onClick={viewVoters}>
          get voters
        </Button>
        {allowedVoters.map((voter, index) => (
          <li key={index}>{voter}</li>
        ))}
        <br />

        <br />
        <Box component="div">
          <Paper sx={{ boxShadow: "none" }}>
            <Typography variant="h3" color="primary">
              Add Voting Options
            </Typography>
            <br />
            <Typography variant="h5" color="secondary">
              Add Vote Options to Election
            </Typography>
            <MuiChipsInput value={optionChips} onChange={handleOptions} />
            <br />
            <Button onClick={uploadOptions}> Upload Vote option</Button>
            <br />
            <br />
            <Button variant="outlined" onClick={viewVoteOptions}>
              view VoteOptions
            </Button>
            {viewOptions.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </Paper>
        </Box>
        <br />
        <Box component="div">
          <Paper sx={{ boxShadow: "none" }}>
            <Typography variant="h3" color="primary">
              Vote
            </Typography>
            <br />
            <Typography variant="h5" color="secondary">
              show vote options for voting
            </Typography>
            <br />
            <br />
            <Typography variant="h5" color="secondary">
              Cast Your Vote
            </Typography>
            {viewOptions.map((option, index) => {
              const isOptionSelected = selectedOption === option;
              return (
                <ListItem key={index}>
                  <Chip
                    label={option}
                    onClick={() => handleVote(option)}
                    color={isOptionSelected ? "primary" : "default"}
                  />
                </ListItem>
              );
            })}

            <Button variant="outlined" onClick={Vote}>
              Cast Vote
            </Button>
            <br />

            <br />
            <Typography variant="h5" color="secondary">
              Check Vote Count
            </Typography>
            {viewOptions.map((option, index) => {
              const isOptionSelected = selectedOption2 === option;
              return (
                <ListItem key={index}>
                  <Chip
                    label={option}
                    onClick={() => checkVote(option)}
                    color={isOptionSelected ? "primary" : "default"}
                  />
                </ListItem>
              );
            })}

            <br />
            {voteCount}
          </Paper>
          <Button variant="outlined" onClick={getVotes}>
            Get all Votes
          </Button>
          {allVotes.map((voter, index) => (
            <li key={index}>{voter}</li>
          ))}
          <br />
          <br />
          <Typography variant="h3" color="secondary">
            {" "}
            Election Winner
          </Typography>
          <br />
          <Button variant="outlined" onClick={getWinner}>
            {" "}
            Get Election Winner
          </Button>
          <br />
          <br />
          <Typography color="primary">
            The election Winner is : {winner}
          </Typography>
          <br />
        </Box>
        <br />
        <Button variant="outlined" onClick={electionTest}>
          {" "}
          {clicked ? (
            <ul>
              {Details.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            "Show all election"
          )}
        </Button>
        <br />
      </Container>
    </div>
  );
}
