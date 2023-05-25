import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "../../styles/Home.module.css";
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
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
} from "../../components/elections";
import { ethers } from "ethers";
import { ElectionContract } from "../../config";
import Electionabi from "../../artifacts/contracts/election.sol/Election.json";
import Votingabi from "../../artifacts/contracts/voting.sol/Voting.json";
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
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
// import

export default function Election() {
  const [votingContractAddress, setVotingContractAddress] = useState("");

  const [newElectionName, setNewElectionName] = useState("");
  // Disable modifyVotes button if user is not election creator
  const [isDisabled, setIsDisabled] = useState(true);

  const [viewOptions, setViewOptions] = useState([]);

  const [allowedVoters, setAllowedVoters] = useState([]);

  const [electionCreator, setElectionCreator] = useState();

  // zero address
  const zeroAdd = ethers.constants.AddressZero;
  // Receive Address
  const router = useRouter();
  // Receive Address from next router.
  const { Address } = router.query;

  // format Contract Address
  const formAddress = useMemo(() => {
    if (Address) return ethers.utils.getAddress(Address);
    else return null;
  }, [Address]);

  // console.log(" This jiggy", formAddress);

  const { address } = useAccount();

  const provider = useRef(new ethers.providers.JsonRpcProvider());

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
  }, [formAddress]);

  // Disable ModifyElection button if user is not election creator

  const creatorCheck = useCallback(() => {
    const fn = async () => {
      if (address === electionCreator) {
        setIsDisabled(false);
      }
    };
    if (address) fn();
    console.log("just called creatorCheck");
  }, [address, electionCreator]);

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
  }, [formAddress]);

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
  }, [formAddress]);

  const ViewResults = async (address) => {
    console.log(address);
    router.push({
      pathname: "./Results",
      query: { Address: address },
    });
  };

  const GoToVote = async (address) => {
    console.log(address);
    if (address) {
      try {
        router.push({
          pathname: "./vote",
          query: { Address: address },
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const GoToModify = async (address) => {
    console.log(address);
    try {
      router.push({
        pathname: "./modifyVote",
        query: { Address: address },
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (formAddress) setVotingContractAddress(formAddress);
    console.log("useEffect called to setVotingContractAddress ");
  }, [formAddress]);

  useEffect(() => {
    electionInfo();
  }, [electionInfo]);

  useEffect(() => {
    viewVoteOptions();
    viewVoters();
    creatorCheck();
  }, [viewVoteOptions, creatorCheck, viewVoters]);

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
      <br />
      <Container>
        <br />
        <Stack direction={"row"} spacing={12}>
          <br />
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={isDisabled}
            onClick={() => GoToModify(formAddress)}
          >
            Modify Election
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => GoToVote(formAddress)}
          >
            Go to Vote Menu
          </Button>
          <br />
          <br />
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => ViewResults(formAddress)}
          >
            View Results
          </Button>
          <br />
        </Stack>

        <br />
      </Container>
    </div>
  );
}
