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
import ListItemButton from "@mui/material/ListItemButton";
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

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function Elections() {
  const [electionInfo, setElectionInfo] = useState([]);
  const [electionCount, setElectionCount] = useState(0);

  // const { data: User} = useSigner();
  const { address } = useAccount();
  const router = useRouter();

  const electionTest = async () => {
    const provider = new ethers.providers.JsonRpcProvider();

    const ethersVote = new ethers.Contract(
      ElectionContract,
      Electionabi.abi,
      provider
    );

    const details = await ethersVote.myElections({ from: address });
    const myCreatedElections = details[0];
    const myElectionCount = details[1];

    const elections = await Promise.all(
      myCreatedElections.map(async (i) => {
        const Id = i.electionId.toNumber();
        const Ename = i.electioName;
        const Name = ethers.utils.parseBytes32String(Ename);
        const info = {
          ElectionId: Id, //.toNumber(),
          ElectionName: Name,
          Creator: i.electionCreator,
          Address: i.electionAddress,
        };
        return info;
      })
    );
    setElectionInfo(elections);

    const count = myElectionCount.toNumber();
    setElectionCount(count);
  };

  useEffect(() => {
    electionTest();
  }, []);

  const handleNext = async (address) => {
    console.log(address);
    try {
      router.push({
        pathname: "/Election",
        query: { Address: address },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Head>
        <title>OnChain Votes - My Elections</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Paper sx={{ boxShadow: "none" }}>
          <Typography variant="h5" color="secondary">
            My Elections
          </Typography>
          <Typography variant="p" color="primary">
            Number of elections created: {electionCount}
          </Typography>

          {/*Table*/}
          <TableContainer component={Paper}>
            <Table aria-label="All Elections Table" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="right"> Election Id</TableCell>
                  <TableCell align="right"> Election Name</TableCell>
                  <TableCell align="right"> Election Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {electionInfo.map((election, index) => (
                  <TableRow
                    key={index}
                    hover
                    onClick={() => {
                      handleNext(election.Address);
                    }}
                    style={{ cursor: "pointer" }}
                    button
                  >
                    <TableCell align="right">{election.ElectionId}</TableCell>
                    <TableCell align="right">{election.ElectionName}</TableCell>
                    <TableCell align="right">{election.Address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </div>
  );
}
