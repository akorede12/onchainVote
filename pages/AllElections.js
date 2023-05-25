import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import { ethers } from "ethers";
import { ElectionContract } from "../config";
import Electionabi from "../artifacts/contracts/election.sol/Election.json";
// Mui Table imports
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function Elections() {
  const router = useRouter();

  const [electionInfo, setElectionInfo] = useState([]);

  const electionTest = async () => {
    const provider = new ethers.providers.JsonRpcProvider();

    const ethersVote = new ethers.Contract(
      ElectionContract,
      Electionabi.abi,
      provider
    );

    const details = await ethersVote.allElections();

    const elections = await Promise.all(
      details.map(async (i) => {
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
  };

  useEffect(() => {
    electionTest();
  }, []);

  const handleNext = async (address) => {
    console.log(address);
    try {
      router.push({
        pathname: "./subPages/Election",
        query: { Address: address },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Head>
        <title>OnChain Votes - All Elections</title>
        <meta name="description" content=" Blockchain voting made easy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Paper sx={{ boxShadow: "none" }}>
          <Typography variant="h5" color="secondary">
            All Elections
          </Typography>

          {/*Table*/}
          <TableContainer component={Paper}>
            <Table aria-label="All Elctions Table" stickyHeader>
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
                  >
                    <TableCell align="right" role="checkbox">
                      {election.ElectionId}
                    </TableCell>
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
