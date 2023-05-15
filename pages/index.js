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
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import ButtonGroup from "@mui/material/ButtonGroup";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Snackbar from "@mui/material/Snackbar";

export default function Create() {
  const router = useRouter();
  // Mui stepper.
  const [activeStep, setActiveStep] = useState(0);

  // Contract interactions
  const [votingContractAddress, setVotingContractAddress] = useState("");
  const [electionName, setElectionName] = useState("");
  const [newElectionName, setNewElectionName] = useState("");
  const [electionCreator, setElectionCreator] = useState("");
  //
  const [errorMessage, setErrorMessage] = useState("");

  const [createError, setCreateError] = useState("");
  // addVoter errors
  const [noElectError, setNoElectError] = useState("");

  const [NopermitError, setNoPermitError] = useState("");

  const [inputVoterError, setInputVoterError] = useState("");

  const [alreadyAddedError, setalreadyAddedError] = useState("");

  // addVote option error
  const [noElectionError2, setNoElectionError2] = useState("");

  const [optionInputError, setOptionInputError] = useState("");

  const [NopermitError2, setNoPermitError2] = useState("");

  const [alreadyAddedError2, setAlreadyAddedError2] = useState("");
  // create election success message
  const [successMessage, setSuccessMessage] = useState("");

  const [successMessage2, setSuccessMessage2] = useState("");

  const [successMessage3, setSuccessMessage3] = useState("");

  const { data: signer } = useSigner();

  const provider = new ethers.providers.JsonRpcProvider();

  const { address } = useAccount();

  // create election error snackbar controls
  const [open, setOpen] = useState(false);

  const snackbarOpen = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  // create election success snackbar controls
  const [open2, setOpen2] = useState(false);

  const snackbarOpen2 = () => {
    setOpen2(true);
  };

  const handleClose2 = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  // addVoter success snackbar controls
  const [open3, setOpen3] = useState(false);

  const addVoterSnackbar = () => {
    setOpen3(true);
  };

  const handleClose3 = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen3(false);
  };

  // addOption success snackbar controls
  const [open4, setOpen4] = useState(false);

  const addOptionSnackbar = () => {
    setOpen4(true);
  };

  const handleClose4 = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen4(false);
  };

  // create  a new election
  async function createNewElection() {
    // If the User typed in an election name
    if (electionName.trim() === "") {
      setCreateError(
        "Election Name required!, Please input a name for the Election"
      );
      return;
    }

    // Reset error message if there was a previous one
    setCreateError("");

    const formattedName = ethers.utils.formatBytes32String(electionName);

    const contract = new ethers.Contract(
      ElectionContract,
      Electionabi.abi,
      signer
    );
    console.log(electionName, formattedName);
    try {
      const tx = await contract.createElection(formattedName, {
        from: address,
      });
      const rc = await tx.wait();
      const event = rc.events.find(
        (event) => event.event === "newElectionCreated"
      );
      const [count, name, creator, address2] = event.args;
      console.log(count.toNumber(), name, creator, address2);
      setVotingContractAddress(ethers.utils.getAddress(address2));
      setNewElectionName(ethers.utils.parseBytes32String(name));
      setElectionCreator(creator);
      setSuccessMessage(
        `New ${ethers.utils.parseBytes32String(
          name
        )} election created, add voters and options in the next screens`
      );
      snackbarOpen2();
    } catch (error) {
      console.error(error);
      setCreateError("An error occurred while creating the election.");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    createNewElection();
  };

  // Add voters

  const [voterChips, setVoterChips] = useState([]);

  const handleChange = (voterChips) => {
    setVoterChips(voterChips);
  };

  const addVoters = async (e) => {
    setNoPermitError("");
    setalreadyAddedError("");

    if (electionName.trim() === "") {
      setNoElectError(
        "No Election created!, create an election before adding voters"
      );
      return;
    }
    setNoElectError("");

    if (voterChips.length === 0) {
      setInputVoterError("Input Voters");
      return;
    }
    setInputVoterError("");
    if (e) {
      e.preventDefault();
    }
    console.log(voterChips);
    // const address = await LastDeployedElection();

    const ethersVote = new ethers.Contract(
      votingContractAddress,
      Votingabi.abi,
      signer
    );

    try {
      const tx = await ethersVote.registerVoter(voterChips);
      await tx.wait();
      // Call the viewVoters function after transaction has been successful
      await viewVoters();
      setSuccessMessage2(`New voter(s) added.`);
      addVoterSnackbar();
    } catch (error) {
      if (error.message.includes("Caller is not authorized.")) {
        setNoPermitError("You do not have permission to add voters");
      }
      if (error.message.includes("Voter already registered")) {
        setalreadyAddedError("Voter(s) have already been registered");
      }

      console.error(error);
    }
  };

  // view voters

  const [allowedVoters, setAllowedVoters] = useState([]);

  const viewVoters = async () => {
    const ethersVote = new ethers.Contract(
      votingContractAddress,
      Votingabi.abi,
      provider
    );
    const getVoters = await ethersVote.viewVoters();
    setAllowedVoters(getVoters);
  };

  // Add vote options
  const [optionChips, setOptionChips] = useState([]);

  const handleOptions = (optionChips) => {
    setOptionChips(optionChips);
  };

  async function uploadOptions(e) {
    setNoPermitError2("");
    setAlreadyAddedError2("");

    if (electionName.trim() === "") {
      setNoElectionError2(
        "No Election created!, create an election before adding options"
      );
      return;
    }
    setNoElectionError2("");

    if (optionChips.length === 0) {
      setOptionInputError("Input Options");
      return;
    }
    setOptionInputError("");
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
      setSuccessMessage3(`New option(s) added.`);
      addOptionSnackbar();
    } catch (error) {
      if (error.message.includes("Caller is not authorized.")) {
        setNoPermitError2("You do not have permission to add voters");
      }
      console.error(error);
      if (error.message.includes("Option already exists.")) {
        setAlreadyAddedError2("Vote option has already been added");
      }
    }
  }

  // view vote options
  const [viewOptions, setViewOptions] = useState([]);

  async function viewVoteOptions() {
    // const address = await LastDeployedElection();
    const provider = new ethers.providers.JsonRpcProvider();
    const ethersVote = new ethers.Contract(
      votingContractAddress,
      Votingabi.abi,
      provider
    );
    const voteOptions = await ethersVote.viewVoteOptions();
    const formatetOptions = voteOptions.map((opt) =>
      ethers.utils.parseBytes32String(opt)
    );

    setViewOptions(formatetOptions);
    console.log(formatetOptions);
  }

  const handleNext = () => {
    if (electionName.trim() === "") {
      setErrorMessage(
        "You need to create an Election to proceed, go back to the first step."
      );
      snackbarOpen();
      return;
    }

    try {
      // Reset error message if there was a previous one
      setErrorMessage("");
      router.push({
        pathname: "/Election",
        query: { Address: votingContractAddress },
      });
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while creating the election.");
    }
  };

  return (
    <div>
      <Head>
        <title>OnChain Votes - Create Elections</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ height: "100%", width: "100%" }}>
        <Stepper activeStep={activeStep}>
          <Step>
            <StepLabel>Create a New Election</StepLabel>
          </Step>
          <Step>
            <StepLabel>Add Voters</StepLabel>
          </Step>
          <Step>
            <StepLabel>Add Voting Options</StepLabel>
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
                    Enter Election Name
                  </Typography>

                  <TextField
                    onChange={(e) => setElectionName(e.target.value)}
                    label="New Election Name"
                    variant="outlined"
                    required
                    sx={{ mt: 2 }}
                  />
                  <br />
                  <br />
                  <Button type="submit" variant="contained">
                    Create a New Election
                  </Button>
                  {createError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {createError}
                    </Alert>
                  )}
                  <Snackbar
                    open={open2}
                    autoHideDuration={6000}
                    onClose={handleClose2}
                  >
                    <Alert
                      onClose={handleClose2}
                      severity="success"
                      sx={{ width: "100%" }}
                    >
                      {successMessage}
                    </Alert>
                  </Snackbar>
                </form>
              </Paper>
              <br />
              <br />

              <Button
                color="primary"
                onClick={() => setActiveStep(1)}
                variant="outlined"
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
                {noElectError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {noElectError}
                  </Alert>
                )}
                {NopermitError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {NopermitError}
                  </Alert>
                )}
                {inputVoterError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {inputVoterError}
                  </Alert>
                )}
                {alreadyAddedError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {alreadyAddedError}
                  </Alert>
                )}
                <Snackbar
                  open={open3}
                  autoHideDuration={6000}
                  onClose={handleClose3}
                >
                  <Alert
                    onClose={handleClose3}
                    severity="success"
                    sx={{ width: "100%" }}
                  >
                    {successMessage2}
                  </Alert>
                </Snackbar>

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
                {noElectionError2 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {noElectionError2}
                  </Alert>
                )}
                {optionInputError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {optionInputError}
                  </Alert>
                )}
                {NopermitError2 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {NopermitError2}
                  </Alert>
                )}
                {alreadyAddedError2 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {alreadyAddedError2}
                  </Alert>
                )}
                <Snackbar
                  open={open4}
                  autoHideDuration={6000}
                  onClose={handleClose4}
                >
                  <Alert
                    onClose={handleClose4}
                    severity="success"
                    sx={{ width: "100%" }}
                  >
                    {successMessage3}
                  </Alert>
                </Snackbar>
                <br />
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
                <Snackbar
                  open={open}
                  autoHideDuration={6000}
                  onClose={handleClose}
                >
                  <Alert
                    onClose={handleClose}
                    severity="error"
                    sx={{ width: "100%" }}
                  >
                    {errorMessage}
                  </Alert>
                </Snackbar>
              </ButtonGroup>
              <br />
            </Box>
          </div>
        )}
      </div>
      <Container>
        <Grid
          container
          spacing={10}
          justifyContent="center"
          // sx={{ display: "flex" }}
        >
          <Grid item md={6}>
            <Paper sx={{ boxShadow: "none" }}>
              <br />
              <Typography variant="h5" color="primary" textAlign="left">
                Voters
              </Typography>
              {/*Table*/}
              {allowedVoters.length === 0 ? (
                <Typography variant="h6" textAlign="left" color="grey">
                  No voters Added
                </Typography>
              ) : (
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
              )}
            </Paper>
          </Grid>
          <Grid item md={5}>
            <Paper sx={{ boxShadow: "none" }}>
              <br />
              <Typography variant="h5" color="primary" textAlign="right">
                Vote Options
              </Typography>
              {viewOptions.length === 0 ? (
                <Typography variant="h6" textAlign="right" color="grey">
                  No Options Added
                </Typography>
              ) : (
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
                          <TableCell align="right" hover role="checkbox">
                            {option}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
