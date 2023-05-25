import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "../../styles/Home.module.css";
import { CardContent } from "@mui/material";
import ListItem from "@mui/material/ListItem";

import { useRouter } from "next/router";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Head from "next/head";

import { ethers } from "ethers";
import Votingabi from "../../artifacts/contracts/voting.sol/Voting.json";

import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";

export default function Results() {
  // Receive Address
  const router = useRouter();
  // Receive Address from next router.
  const { Address } = router.query;
  // format Contract Address
  const formAddress = useMemo(() => {
    if (Address) return ethers.utils.getAddress(Address);
    else return null;
  }, [Address]);

  const provider = useRef(new ethers.providers.JsonRpcProvider());

  const [votingContractAddress, setVotingContractAddress] = useState("");

  const [newElectionName, setNewElectionName] = useState("");

  const [viewOptions, setViewOptions] = useState([]);

  const [allowedVoters, setAllowedVoters] = useState([]);

  const [electionCreator, setElectionCreator] = useState();

  const [option, setOption] = useState();

  const [optionCount, setOptionCount] = useState(0);

  const [errorMessage2, setErrorMessage2] = useState("");

  const [selectedOption, setSelectedOption] = useState(null);

  const [winOption, setWinOption] = useState();

  const [winOptionCount, SetWinOptionCount] = useState(0);

  const [errorMessage, setErrorMessage] = useState("");

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
      const formatName = ethers.utils.parseBytes32String(name);
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
        formAddress, //votingContractAddress,
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
        formAddress, //votingContractAddress,
        Votingabi.abi,
        provider.current
      );
      const getVoters = await ethersVote.viewVoters();
      setAllowedVoters(getVoters);
    };
    if (formAddress) fn();
  }, [formAddress, provider]);

  // Get Option Vote Count:

  const voteCount = async () => {
    if (!option) {
      setErrorMessage2("No option selected");
      return;
    }
    setErrorMessage2("");
    const ethersVote = new ethers.Contract(
      formAddress,
      Votingabi.abi,
      provider.current
    );
    const formatOption = await ethers.utils.formatBytes32String(option);
    const getCount = await ethersVote.getVoteOptionVoteCount(formatOption);
    setOptionCount(getCount.toNumber());
  };

  const handleCount = (option) => {
    setOption(option);
    setSelectedOption(option);
    console.log(option);
  };

  // Election Winner

  const winner = async () => {
    // function getVoteOptionVoteCount(bytes32 option) public view returns(uint)
    const ethersVote = new ethers.Contract(
      formAddress,
      Votingabi.abi,
      provider.current
    );
    try {
      const Winner = await ethersVote.getElectionWinner();
      const getCount = await ethersVote.getVoteOptionVoteCount(Winner);

      const formatWinner = ethers.utils.parseBytes32String(Winner);
      setWinOption(formatWinner);
      SetWinOptionCount(getCount.toNumber());
    } catch (error) {
      if (error.message.includes("getVoteOptionVoteCount(bytes32)")) {
        // (error.code === "CALL_EXCEPTION") {
        setErrorMessage("No Winner Yet");
        console.log(error.message);
      }
      console.log(error);
    }
  };

  useEffect(() => {
    setVotingContractAddress(formAddress);
    electionInfo();
  }, [formAddress]);

  useEffect(() => {
    viewVoters();
  }, []);

  useEffect(() => {
    viewVoteOptions();
  }, []);

  return (
    <div>
      <Head>
        <title>OnChain Votes - Vote</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Grid container spacing={2} direction="row" justifyContent="center">
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
                  md={4}
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
                  md={4}
                  sx={{ fontSize: 14 }}
                >
                  Election Creator:
                </Typography>
                <Typography sx={{ fontSize: 14 }}>{electionCreator}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Container>
        <Container>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <Paper sx={{ boxShadow: "none" }}>
                <Typography variant="h5" color="primary">
                  ELECTION WINNER
                </Typography>
                <br />
                <Button variant="outlined" onClick={winner}>
                  Get Election Winner
                </Button>
              </Paper>
            </Grid>
            <Grid item md={6}>
              <Paper sx={{ boxShadow: "none" }}>
                <Typography variant="h5" color="primary">
                  THE WINNING OPTION IS
                </Typography>
                <Typography variant="h1" color="primary">
                  {winOption}
                </Typography>
                {errorMessage && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage}
                  </Alert>
                )}
                <Typography variant="h9" color="primary">
                  with {winOptionCount} number of vote(s) !
                </Typography>
              </Paper>
            </Grid>
            <Grid item md={12}>
              <Paper sx={{ boxShadow: "none" }}>
                <br />
                <Typography variant="h3" color="primary">
                  Check Vote Count
                </Typography>
                <Typography variant="p">
                  To check the vote count of each option, select the option then
                  click the{" "}
                  <Typography variant="p" color="primary">
                    CHECK VOTE COUNT
                  </Typography>{" "}
                  button.
                </Typography>
                <br />
                <br />
                <Typography variant="h7" color="primary">
                  Vote Options
                </Typography>
                <br />
                <br />
                {viewOptions.length === 0 ? (
                  <Typography variant="h6" textAlign="left" color="grey">
                    No Options Added
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={5}>
                    {viewOptions.map((option, index) => {
                      const isOptionSelected = selectedOption === option;
                      return (
                        <ListItem key={index}>
                          <Chip
                            label={option}
                            onClick={() => handleCount(option)}
                            color={isOptionSelected ? "primary" : "default"}
                          />
                        </ListItem>
                      );
                    })}
                  </Stack>
                )}

                <br />
                <Stack direction="row" spacing={10}>
                  <Button variant="outlined" onClick={voteCount}>
                    Check Vote Count
                  </Button>

                  <Typography variant="h5" color="primary">
                    {optionCount} Vote(s)!
                  </Typography>
                </Stack>
                {errorMessage2 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage2}
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Container>
    </div>
  );
}
