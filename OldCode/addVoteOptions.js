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

export default function AddOptions() {
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
    </div>
  );
}
