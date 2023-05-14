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
import ALert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
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

  // Get Option Vote Count:
  const [option, setOption] = useState();

  const [optionCount, setOptionCount] = useState(0);

  const voteCount = async () => {
    // function getVoteOptionVoteCount(bytes32 option) public view returns(uint)
    const ethersVote = new ethers.Contract(
      formAddress,
      Votingabi.abi,
      provider
    );
    const formatOption = await ethers.utils.formatBytes32String(option);
    const getCount = await ethersVote.getVoteOptionVoteCount(formatOption);
    setOptionCount(getCount.toNumber());
  };

  const [selectedOption, setSelectedOption] = useState(null);

  const handleCount = (option) => {
    setOption(option);
    setSelectedOption(option);
    console.log(option);
  };

  // Election Winner
  const [winOption, setWinOption] = useState();

  const [winOptionCount, SetWinOptionCount] = useState(0);

  const winner = async () => {
    // function getVoteOptionVoteCount(bytes32 option) public view returns(uint)
    const ethersVote = new ethers.Contract(
      formAddress,
      Votingabi.abi,
      provider
    );
    const Winner = await ethersVote.getElectionWinner();
    const getCount = await ethersVote.getVoteOptionVoteCount(Winner);

    const formatWinner = ethers.utils.parseBytes32String(Winner);
    setWinOption(formatWinner);
    SetWinOptionCount(getCount.toNumber());
  };

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
                <br />
                <Stack direction="row" spacing={10}>
                  <Button variant="outlined" onClick={voteCount}>
                    Check Vote Count
                  </Button>

                  <Typography variant="h5" color="primary">
                    {optionCount} Vote(s)!
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Container>
    </div>
  );
}
