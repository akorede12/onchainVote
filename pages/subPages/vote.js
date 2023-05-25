import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "../../styles/Home.module.css";
import { CardContent } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Head from "next/head";
import { ethers } from "ethers";
import Votingabi from "../../artifacts/contracts/voting.sol/Voting.json";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import { useSigner } from "wagmi";

export default function Vote() {
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

  const { data: signer } = useSigner();

  const [votingContractAddress, setVotingContractAddress] = useState("");

  const [newElectionName, setNewElectionName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [viewOptions, setViewOptions] = useState([]);

  const [selectedOption, setSelectedOption] = useState(null);

  const [vote, setVote] = useState();

  const [errorMessage3, setErrorMessage3] = useState("");

  const [allowedVoters, setAllowedVoters] = useState([]);

  const [electionCreator, setElectionCreator] = useState();

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

  useEffect(() => {
    setVotingContractAddress(formAddress);
    electionInfo();
  }, [formAddress]);

  // view vote options

  const viewVoteOptions = useCallback(() => {
    const fn = async () => {
      const ethersVote = new ethers.Contract(
        formAddress, //votingContractAddress,
        Votingabi.abi,
        provider.currrent
      );
      const voteOptions = await ethersVote.viewVoteOptions();
      const formatetOptions = voteOptions.map((opt) =>
        ethers.utils.parseBytes32String(opt)
      );

      setViewOptions(formatetOptions);
    };
    if (formAddress) fn();
  }, [formAddress, provider]);

  // Vote

  const handleVote = (option) => {
    setVote(option);
    setSelectedOption(option);
    console.log(option);
  };

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

  useEffect(() => {
    viewVoters();
  }, []);

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
                if (selectedOption) {
                  const isOptionSelected = selectedOption === option;
                }
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
