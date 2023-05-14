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

export default function AddVoters() {
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
  return (
    <div>
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
    </div>
  );
}
