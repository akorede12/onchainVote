import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "../styles/Home.module.css";
import { Box, CardContent } from "@mui/material";
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
  // formAddress,
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

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";

export default function Vote() {
  // Receive Address
  const router = useRouter();
  // Receive Address from next router.
  const { Address } = router.query;
  // format Contract Address
  const formAddress = ethers.utils.getAddress(Address);

  const [votingContractAddress, setVotingContractAddress] = useState("");
  const [newElectionName, setNewElectionName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const electionInfo = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const ethersVote = new ethers.Contract(Address, Votingabi.abi, provider);
    const details = await ethersVote.getElectionDetails(); // { name, creator}
    console.log(details); // log the details object
    const name = details[0];
    const formatName = ethers.utils.parseBytes32String(name);
    console.log(name, formatName);
    setNewElectionName(formatName.toString());
    setElectionCreator(details[1]);
  };

  useEffect(() => {
    setVotingContractAddress(formAddress);
    electionInfo();
  }, [formAddress]);

  const { data: signer } = useSigner();

  const provider = new ethers.providers.JsonRpcProvider();

  const [newElectionCreator, setNewElectionCreator] = useState("");

  const { address } = useAccount();

  useEffect(() => {
    setNewElectionCreator(address);
  }, [address]);

  // view vote options
  const [viewOptions, setViewOptions] = useState([]);

  async function viewVoteOptions() {
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

  const [errorMessage3, setErrorMessage3] = useState("");

  async function Vote() {
    if (!vote) {
      // vote.trim() === ""
      setErrorMessage3(
        "Select an option, before clicking the CAST VOTE button"
      );
      return;
    }
    const ethersVote = new ethers.Contract(
      formAddress, //votingContractAddress,
      Votingabi.abi,
      signer
    );

    const formatVote = ethers.utils.formatBytes32String(vote);

    try {
      const castVote = await ethersVote.castVote(formatVote);
      console.log(vote);
    } catch (error) {
      if (error.message.includes("Voter has already voted")) {
        // (error.code === "CALL_EXCEPTION") {
        setErrorMessage("You have already voted");
        console.log(error.message);
      } else if (error.message.includes("voter is not registered.")) {
        setErrorMessage("voter is not registered.");
        console.log("voter is not registered.");
      } else {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    viewVoteOptions();
  }, []);

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
  }, []);

  const [electionCreator, setElectionCreator] = useState();

  return (
    <div>
      <Head>
        <title>OnChain Votes - Vote</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Grid
          container
          spacing={2}
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
                <Typography sx={{ fontSize: 14 }}>{electionCreator}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Container>
        <br />

        <br />
        <Typography variant="h3" color="primary">
          Cast Your Vote
        </Typography>
        <br />
        <Typography variant="p">
          To vote for your preferred option, select the option below then click
          the{" "}
          <Typography variant="h7" color="primary">
            CAST VOTE
          </Typography>{" "}
          button.(You can only vote once)
        </Typography>
        <br />
        <br />
        {viewOptions.length === 0 ? (
          <Typography variant="h6" textAlign="left" color="grey">
            No Options Added
          </Typography>
        ) : (
          <Container>
            <Typography variant="h7" color="primary">
              Vote Options
            </Typography>
            <br />
            <br />
            <Stack direction="row" spacing={5}>
              <br />
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
            </Stack>
          </Container>
        )}

        <br />
        <Button variant="outlined" onClick={Vote}>
          Cast Vote
        </Button>
        {errorMessage3 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage3}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <br />

        <br />
        <br />
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
      </Container>
    </div>
  );
}
