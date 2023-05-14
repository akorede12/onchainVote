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
// wagmi/ ethers/ contract
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
// import { useAccount } from "wagmi";
import {
  LastDeployedElection,
  AllElections,
  ViewElectionAddress,
  GetElectionCount,
} from "../components/elections";
import Head from "next/head";

export default function Create() {
  // Contract interactions
  const [votingContractAddress, setVotingContractAddress] = useState("");
  const [electionName, setElectionName] = useState("");
  const [newElectionName, setNewElectionName] = useState("");
  const [electionCreator, setElectionCreator] = useState("");

  const [newElectionCreator, setNewElectionCreator] = useState("");

  const { data: signer } = useSigner();

  const provider = new ethers.providers.JsonRpcProvider();

  const { address } = useAccount();

  useEffect(() => {
    setNewElectionCreator(address);
  }, [address]);

  // create  a new election
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

  //Get  Election Details

  const electionInfo = async () => {
    const address = await LastDeployedElection();

    const ethersVote = new ethers.Contract(address, Votingabi.abi, provider);

    const details = await ethersVote.getElectionDetails();
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

  return (
    <div>
      <Head>
        <title>OnChain Votes - Create Elections</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Box component="div">
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
      </Container>
    </div>
  );
}
