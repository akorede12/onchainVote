import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "../styles/Home.module.css";
import { Box, CardContent, Grid } from "@mui/material";
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
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Head from "next/head";
import {
  LastDeployedElection,
  AllElections,
  ViewElectionAddress,
  GetElectionCount,
} from "../components/elections";
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
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ALert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import ButtonGroup from "@mui/material/ButtonGroup";

export default function ModifyVote() {
  // Modify Elections
  // Mui stepper.
  const [activeStep, setActiveStep] = useState(0);

  // Contract interactions

  const router = useRouter();
  const { Address } = router.query;
  const formAddress = ethers.utils.getAddress(Address);
  const [errorMessage, setErrorMessage] = useState("");

  const [votingContractAddress, setVotingContractAddress] = useState("");

  const { data: signer } = useSigner();

  const { address } = useAccount();

  const [modElectionName, setModElectionName] = useState("");

  const provider = new ethers.providers.JsonRpcProvider();

  // create modify election
  async function modifyElection() {
    if (modElectionName.trim() === "") {
      setErrorMessage(
        "Election Name required!, Please input a name for the Eleaction"
      );
      return;
    }

    // Reset error message if there was a previous one
    setErrorMessage("");

    const formattedName = ethers.utils.formatBytes32String(modElectionName);

    const contract = new ethers.Contract(
      votingContractAddress,
      Votingabi.abi,
      signer
    );
    console.log(modElectionName, formattedName);
    try {
      const tx = await contract.setElectionDetails(formattedName, {
        from: address,
      });
      await tx.wait();
      // Call the electionInfo function after transaction has been successful
      await electionInfo();
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while creating the election.");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    modifyElection();
  };

  // Add voters

  const [voters, setVoters] = useState([]);
  const [voterChips, setVoterChips] = useState([]);

  const handleChange = (voterChips) => {
    setVoterChips(voterChips);
  };

  const addVoters = async (e) => {
    if (e) {
      e.preventDefault();
    }
    console.log(voterChips);
    const ethersVote = new ethers.Contract(
      votingContractAddress,
      Votingabi.abi,
      signer
    );

    try {
      const tx = await await ethersVote.registerVoter(voterChips);
      await tx.wait();
      // Call the viewVoters function after transaction has been successful
      await viewVoters();
    } catch (error) {
      console.error(error);
    }
  };

  // Add vote options
  const [optionChips, setOptionChips] = useState([]);

  const handleOptions = (optionChips) => {
    setOptionChips(optionChips);
  };

  async function uploadOptions(e) {
    e.preventDefault();
    const ethersVote = new ethers.Contract(
      votingContractAddress,
      Votingabi.abi,
      signer
    );
    const optionChipsToBytes = optionChips.map((str) =>
      ethers.utils.formatBytes32String(str)
    );

    try {
      const upload = await ethersVote.addVoteOptions(optionChipsToBytes);
      console.log(optionChipsToBytes);
      await viewVoteOptions();
    } catch (error) {
      console.error(error);
    }
  }

  const handleNext = () => {
    router.push({
      pathname: "/Election",
      query: { Address: votingContractAddress },
    });
  };

  // Receive Address
  const [electionCreator, setElectionCreator] = useState();

  const [newElectionName, setNewElectionName] = useState("");

  const electionInfo = async () => {
    // const address = await LastDeployedElection();

    const provider = new ethers.providers.JsonRpcProvider();

    // const ethersVote = new ethers.Contract(address, Votingabi.abi, provider);
    const ethersVote = new ethers.Contract(
      formAddress, //votingContractAddress,
      Votingabi.abi,
      provider
    );

    const details = await ethersVote.getElectionDetails(); // { name, creator}
    console.log(details); // log the details object
    const name = details[0];
    const formatName = await ethers.utils.parseBytes32String(name);
    console.log(name, formatName);
    setNewElectionName(formatName.toString());
    setElectionCreator(details[1]);
  };

  // view vote options
  const [viewOptions, setViewOptions] = useState([]);

  async function viewVoteOptions() {
    const provider = new ethers.providers.JsonRpcProvider();
    const ethersVote = new ethers.Contract(
      formAddress, //votingContractAddress,
      Votingabi.abi,
      provider
    );
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
    const ethersVote = new ethers.Contract(
      votingContractAddress,
      Votingabi.abi,
      signer
    );
    const formatVote = ethers.utils.formatBytes32String(vote);

    try {
      const castVote = await ethersVote.castVote(formatVote);
      console.log(vote);
    } catch (error) {
      console.error(error);
    }
  }

  // view voters

  const [allowedVoters, setAllowedVoters] = useState([]);

  const viewVoters = async () => {
    const ethersVote = new ethers.Contract(
      formAddress, //votingContractAddress,
      Votingabi.abi,
      provider
    );
    const getVoters = await ethersVote.viewVoters();
    setAllowedVoters(getVoters);
  };

  useEffect(() => {
    viewVoters();
    viewVoteOptions();
    electionInfo();
    setVotingContractAddress(formAddress);
  }, [formAddress]);

  return (
    <div>
      <Head>
        <title>OnChain Votes - Vote</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ height: "100%", width: "100%" }}>
        <Stepper activeStep={activeStep}>
          <Step>
            <StepLabel> Modify Election</StepLabel>
          </Step>
          <Step>
            <StepLabel>Add Voters</StepLabel>
          </Step>
          <Step>
            <StepLabel>Add Vote Options</StepLabel>
          </Step>
        </Stepper>
        <Container>
          <Grid
            container
            spacing={2}
            columns={16}
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Grid item>
              <Card sx={{ boxShadow: "none" }}>
                <CardContent>
                  <Typography
                    color="primary"
                    variant="h9"
                    md={2}
                    sx={{ fontSize: 14 }}
                  >
                    Election Name:
                  </Typography>
                  <Typography>{newElectionName}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card sx={{ boxShadow: "none" }}>
                <CardContent>
                  <Typography
                    color="primary"
                    variant="h9"
                    md={5}
                    sx={{ fontSize: 14 }}
                  >
                    Election Address:
                  </Typography>
                  <Typography sx={{ fontSize: 14 }}>
                    {votingContractAddress}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card sx={{ boxShadow: "none" }}>
                <CardContent>
                  <Typography
                    color="primary"
                    variant="h9"
                    md={5}
                    sx={{ fontSize: 14 }}
                  >
                    Election Creator:
                  </Typography>
                  <Typography sx={{ fontSize: 14 }}>
                    {electionCreator}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        {activeStep === 0 && (
          <div>
            {/* Code for Step 1 goes here */}
            <Box component="div" sx={{ textAlign: "center" }}>
              <Paper sx={{ boxShadow: "none" }}>
                <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                  <Typography variant="h3" color="primary">
                    Change Election Name
                  </Typography>
                  <TextField
                    onChange={(e) => setModElectionName(e.target.value)}
                    label="New Election Name"
                    variant="outlined"
                    required
                    sx={{ mt: 2 }}
                  />
                  <br />
                  <br />
                  <Button type="submit" variant="contained">
                    Change Election Name
                  </Button>
                  {errorMessage && (
                    <ALert severity="error" sx={{ mt: 2 }}>
                      {errorMessage}
                    </ALert>
                  )}
                </form>
              </Paper>
              <br />
              <br />

              <Button
                color="primary"
                onClick={() => setActiveStep(1)}
                variant="outlined"
                sx={{ marginLeft: "auto" }}
              >
                Next
              </Button>
            </Box>
          </div>
        )}
        {activeStep === 1 && (
          <div>
            {/* Code for Step 2 goes here */}
            <Box component="div" sx={{ textAlign: "center" }}>
              <Paper sx={{ boxShadow: "none" }}>
                <Typography variant="h3" color="primary">
                  Add Voters to Election{" "}
                </Typography>
                <br />
                <MuiChipsInput value={voterChips} onChange={handleChange} />
                <br />
                <br />
                <Button onClick={addVoters} variant="contained">
                  Upload Voters
                </Button>
                <br />
                <br />
              </Paper>
              <br />
              <br />
              <ButtonGroup
                variant="outlined"
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  onClick={() => setActiveStep(0)}
                  sx={{ marginRight: "auto" }}
                >
                  Back
                </Button>
                <Button
                  color="primary"
                  onClick={() => setActiveStep(2)}
                  sx={{ marginLeft: "auto" }}
                >
                  Next
                </Button>
              </ButtonGroup>
            </Box>
          </div>
        )}
        {activeStep === 2 && (
          <div>
            {/* Code for Step 3 goes here */}
            <Box component="div" sx={{ textAlign: "center" }}>
              <Paper sx={{ boxShadow: "none" }}>
                <Typography variant="h3" color="primary">
                  Add Vote Options to Election
                </Typography>
                <br />
                <MuiChipsInput value={optionChips} onChange={handleOptions} />
                <br />
                <br />
                <Button onClick={uploadOptions} variant="contained">
                  Upload Vote option
                </Button>
                <br />
                <br />
              </Paper>
              <br />
              <br />
              <ButtonGroup
                variant="outlined"
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  onClick={() => setActiveStep(1)}
                  sx={{ marginRight: "auto" }}
                >
                  Back
                </Button>
                <Button
                  color="primary"
                  onClick={handleNext}
                  sx={{ marginLeft: "auto" }}
                >
                  Go to Election Menu
                </Button>
              </ButtonGroup>
              <br />
            </Box>
          </div>
        )}
      </div>
      <br />

      <Container>
        <Container>
          <Grid container spacing={10} justifyContent="center">
            <Grid item md={6}>
              <Paper sx={{ boxShadow: "none" }}>
                <br />
                <Typography variant="h5" color="primary" textAlign="left">
                  Voters
                </Typography>
                {/*Table*/}
                <TableContainer component={Paper}>
                  <Table aria-label="Voter Table">
                    <TableBody>
                      {allowedVoters.map((voters, index) => (
                        <TableRow
                          key={index}
                          hover
                          style={{ cursor: "pointer" }}
                          button
                        >
                          <TableCell align="left" hover role="checkbox">
                            {voters}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item md={6}>
              <Paper sx={{ boxShadow: "none" }}>
                <br />
                <Typography variant="h5" color="primary" textAlign="right">
                  Vote Options
                </Typography>

                {/*Table*/}
                <TableContainer component={Paper}>
                  <Table aria-label="Options Table">
                    <TableBody>
                      {viewOptions.map((option, index) => (
                        <TableRow
                          key={index}
                          hover
                          style={{ cursor: "pointer" }}
                          button
                        >
                          <TableCell align="left" hover role="checkbox">
                            {option}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Container>
    </div>
  );
}
