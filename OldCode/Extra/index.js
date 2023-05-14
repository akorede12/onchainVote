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
import { useContract, useContractWrite, usePrepareContractWrite } from "wagmi";
import {
  LastDeployedElection,
  AllElections,
  ViewElectionAddress,
  GetElectionCount,
} from "../components/elections";

export default function Create() {
  // Contract interactions
  const [votingContractAddress, setVotingContractAddress] = useState("");
  const [electionName, setElectionName] = useState("");
  const [optionChips, setOptionChips] = useState([]);
  const [voterChips, setVoterChips] = useState([]);

  // useEffect(() => {
  //   lastDeployedElection;
  // }, [votingContractAddress]);

  // wagmi set up: Create Election.
  const { config } = usePrepareContractWrite({
    address: ElectionContract,
    abi: Electionabi.abi,
    functionName: "createElection",
    args: [electionName],
  });

  const { write } = useContractWrite(config);

  async function CreateElection() {
    try {
      const create = await write?.();
      const tx = create?.wait();
    } catch (error) {
      console.error(error);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    CreateElection(electionName);
  };
  //

  const lastDeployedElection = async () => {
    const address = await LastDeployedElection();
    setVotingContractAddress(address);
  };

  const details = async () => {
    GetElectionDetails();
  };

  // frontend interactions
  const handleOptions = (optionChips) => {
    setOptionChips(optionChips);
  };
  const handleVoters = (voterChips) => {
    setVoterChips(voterChips);
  };
  //

  return (
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
          <Button variant="outlined" onClick={lastDeployedElection}>
            <Typography variant="h5" color="primary">
              Election Details{" "}
            </Typography>
          </Button>
          <br />
          <Typography variant="h7" color="secondary">
            Election Name: {}{" "}
          </Typography>
          <Typography variant="h7" color="secondary">
            Election Address: {votingContractAddress}
          </Typography>
          <Typography variant="h7" color="secondary">
            Election Creator: {}{" "}
          </Typography>
        </Paper>
      </Box>
      <br />
      <Box component="div">
        <Paper sx={{ boxShadow: "none" }}>
          <Typography variant="h3" color="primary">
            Modify Voting Criteria
          </Typography>
          <form noValidate autoComplete="off">
            <br />
            <Typography variant="h5" color="secondary">
              Add Vote Options
            </Typography>
            <Typography variant="p">
              {" "}
              (To upload vote options simply type each option into text box
              below, press enter after.)
            </Typography>
            <br />
            <MuiChipsInput value={optionChips} onChange={handleOptions} />
            {/* <Button> Upload Vote option</Button> */}
            <br />
            <br />
            <Typography variant="h5" color="secondary">
              Upload Voter List
            </Typography>
            <Typography variant="p">
              {" "}
              (To upload voter addresses simply copy and paste each address into
              the text box below, press after pasting.)
            </Typography>
            <br />
            <MuiChipsInput value={voterChips} onChange={handleVoters} />
            <br />
            <br />
            <Typography variant="p">
              {" "}
              Confirm information before clicking submit
            </Typography>
            <br />
            <br />
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
