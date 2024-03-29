import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "../../styles/Home.module.css";
import { Box, CardContent, Grid } from "@mui/material";
import { useRouter } from "next/router";
import TextField from "@mui/material/TextField";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { MuiChipsInput } from "mui-chips-input";
import Card from "@mui/material/Card";
import Head from "next/head";
import { ethers } from "ethers";
import Votingabi from "../../artifacts/contracts/voting.sol/Voting.json";
import { useAccount, useSigner } from "wagmi";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import ButtonGroup from "@mui/material/ButtonGroup";
import Snackbar from "@mui/material/Snackbar";

export default function ModifyVote() {
  // Modify Elections
  // Mui stepper.
  const [activeStep, setActiveStep] = useState(0);

  // Contract interactions

  const router = useRouter();
  const { Address } = router.query;
  const formAddress = useMemo(() => {
    if (Address) return ethers.utils.getAddress(Address);
    else return null;
  }, [Address]);

  const provider = useRef(new ethers.providers.JsonRpcProvider());
  //
  const [errorMessage, setErrorMessage] = useState("");
  // error message for addVoters
  const [errorMessage2, setErrorMessage2] = useState("");

  const [votingContractAddress, setVotingContractAddress] = useState("");

  const { data: signer } = useSigner();

  const { address } = useAccount();

  const [modElectionName, setModElectionName] = useState("");

  // addVoter errors

  const [inputVoterError, setInputVoterError] = useState("");

  const [alreadyAddedError, setalreadyAddedError] = useState("");

  // addVote option error

  const [optionInputError, setOptionInputError] = useState("");

  const [NopermitError2, setNoPermitError2] = useState("");

  const [alreadyAddedError2, setAlreadyAddedError2] = useState("");

  // create election success message
  const [successMessage, setSuccessMessage] = useState("");

  const [successMessage2, setSuccessMessage2] = useState("");

  const [successMessage3, setSuccessMessage3] = useState("");

  const [voterChips, setVoterChips] = useState([]);

  const [optionChips, setOptionChips] = useState([]);

  const [electionCreator, setElectionCreator] = useState();

  const [newElectionName, setNewElectionName] = useState("");

  const [viewOptions, setViewOptions] = useState([]);

  const [allowedVoters, setAllowedVoters] = useState([]);

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

  // create modify election
  async function modifyElection() {
    // Reset error message if there was a previous one
    setErrorMessage("");

    if (modElectionName.trim() === "") {
      setErrorMessage(
        "Election Name required!, Please input a name for the Eleaction"
      );
      return;
    }

    const formattedName = ethers.utils.formatBytes32String(modElectionName);

    const contract = new ethers.Contract(formAddress, Votingabi.abi, signer);
    console.log(modElectionName, formattedName);
    try {
      const tx = await contract.setElectionDetails(formattedName, {
        from: address,
      });
      await tx.wait();
      // Call the electionInfo function after transaction has been successful
      await electionInfo();
      setSuccessMessage(`Election name is now ${modElectionName}`);
      snackbarOpen2();
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

  const handleChange = (voterChips) => {
    setVoterChips(voterChips);
  };

  const addVoters = async (e) => {
    setalreadyAddedError("");
    setErrorMessage2("");

    if (voterChips.length === 0) {
      setInputVoterError("Input Voters");
      return;
    }
    setInputVoterError("");

    if (e) {
      e.preventDefault();
    }
    console.log(voterChips);
    const ethersVote = new ethers.Contract(formAddress, Votingabi.abi, signer);

    try {
      const tx = await ethersVote.registerVoter(voterChips);
      await tx.wait();
      // Call the viewVoters function after transaction has been successful
      await viewVoters();
      setSuccessMessage2(`New voter(s) added.`);
      addVoterSnackbar();
    } catch (error) {
      if (error.message.includes("Caller is not authorized.")) {
        setErrorMessage2("You do not have permission to add voters");
        console.log(error.message);
      }
      if (error.message.includes("Voter already registered")) {
        setalreadyAddedError("This Voter(s) have already been registered");
      }
      console.error(error);
    }
  };

  // Add vote options

  const handleOptions = (optionChips) => {
    setOptionChips(optionChips);
  };

  async function uploadOptions(e) {
    setAlreadyAddedError2("");
    setNoPermitError2("");

    if (optionChips.length === 0) {
      setOptionInputError("Input Options");
      return;
    }
    setOptionInputError("");

    e.preventDefault();
    const ethersVote = new ethers.Contract(formAddress, Votingabi.abi, signer);
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
      console.error(error);
      if (error.message.includes("Caller is not authorized.")) {
        setNoPermitError2("You do not have permission to add options");
      }
      console.error(error);
      if (error.message.includes("Option already exists.")) {
        setAlreadyAddedError2("Vote option has already been added");
      }
    }
  }

  const handleNext = () => {
    router.push({
      pathname: "./Election",
      query: { Address: formAddress },
    });
  };

  // Receive Address

  const electionInfo = useCallback(() => {
    const fn = async () => {
      const ethersVote = new ethers.Contract(
        formAddress,
        Votingabi.abi,
        provider.current
      );

      const details = await ethersVote.getElectionDetails(); // { name, creator}
      console.log(details); // log the details object
      const name = details[0];
      const formatName = await ethers.utils.parseBytes32String(name);
      console.log(name, formatName);
      setNewElectionName(formatName.toString());
      setElectionCreator(details[1]);
    };
    if (formAddress) fn();
  }, [formAddress, provider]);

  // view vote options

  const viewVoteOptions = useCallback(() => {
    const fn = async () => {
      const ethersVote = new ethers.Contract(
        formAddress,
        Votingabi.abi,
        provider.current
      );
      const voteOptions = await ethersVote.viewVoteOptions();
      const formatetOptions = voteOptions.map((opt) =>
        ethers.utils.parseBytes32String(opt)
      );

      setViewOptions(formatetOptions);
    };
    if (formAddress) fn();
  }, [formAddress, provider]);

  // view voters

  const viewVoters = useCallback(() => {
    const fn = async () => {
      const ethersVote = new ethers.Contract(
        formAddress,
        Votingabi.abi,
        provider.current
      );
      const getVoters = await ethersVote.viewVoters();
      setAllowedVoters(getVoters);
    };
    if (formAddress) fn();
  }, [formAddress, provider]);

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
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errorMessage}
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
                  Add Voters to Election
                </Typography>
                <br />
                <MuiChipsInput value={voterChips} onChange={handleChange} />
                <br />
                <br />
                <Button onClick={addVoters} variant="contained">
                  Upload Voters
                </Button>
                {errorMessage2 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage2}
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
            <Grid item md={6}>
              <Paper sx={{ boxShadow: "none" }}>
                <br />
                <Typography variant="h5" color="primary" textAlign="right">
                  Vote Options
                </Typography>

                {/*Table*/}
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
      </Container>
    </div>
  );
}
