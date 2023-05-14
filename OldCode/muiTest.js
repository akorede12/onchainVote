import Typography from "@mui/material/Typography";
// or import {Typography} from "@mui/material";  doing this is a bit less performant
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Container, FormControlLabel, Paper } from "@mui/material";
import { display } from "@mui/system";
import ButtonGroup from "@mui/material/ButtonGroup";
import { makeStyles } from "@mui/material";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TextField from "@mui/material/TextField";
import { useState, useEffect } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Layout from "../components/layout";
import styles from "../styles/Home.module.css";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { useRouter } from "next/router";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import ViewListIcon from "@mui/icons-material/ViewList";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import { MuiChipsInput } from "mui-chips-input";
// wagmi/ ethers/ contract
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { ElectionContract } from "../config";
import Electionabi from "../artifacts/contracts/election.sol/Election.json";
import Votingabi from "../artifacts/contracts/voting.sol/Voting.json";
import { useContract, useContractWrite, usePrepareContractWrite } from "wagmi";
import {
  LastDeployedElection,
  AllElections,
  ViewElectionAddress,
  GetElectionCount,
} from "../components/elections";
import { useContractRead } from "wagmi";

// cannot be imported like; import makeStyles from "@mui/material/makeStyles";
// because it is a function not a component

// define hook outside component, call the function from a variable in the component
// const useStyles = makeStyles({
//     btn: {
//         fontSize: 60,
//         backgroundColor: 'green',
//           // add hover effect
//             '&:hover': {
//              backgroundColor: 'blue'
//             }
//     },
//     title: {
//           textDecoration: 'underline',
//           marginBottom: 20
//      }
// })

// const useStyles = makeStyles({
//     field
// })

export default function Test() {
  // makeStyles function
  // const classes = useStyles()

  // the default actions of a form when it is submitted is to refresh to page
  /*to prevent the page from refreshing
    const handleSubmit = (e) => {
        e.preventDefault()
    }
    */

  const [formInput1, setFormInput1] = useState("");
  const [formInput2, setFormInput2] = useState("");

  // define error state
  const [formInput1Error, setFormInput1Error] = useState(false);
  const [formInput2Error, setFormInput2Error] = useState(false);

  // radio input
  const [radioInput, setRadioInput] = useState("test1");

  // const handleRadio = (e) => {
  //     setRadioInput(e.target.value)
  //     console.log(radioInput)
  // }

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormInput1Error(false);
    setFormInput2Error(false);

    // check if form input is empty
    if (formInput1 == "") {
      setFormInput1Error(true);
    }

    if (formInput2 == "") {
      setFormInput2Error(true);
    }

    if (formInput1 && formInput2) {
      console.log(formInput1, formInput2, radioInput);
    }
  };

  const [optionChips, setOptionChips] = useState([]);
  const [voterChips, setVoterChips] = useState([]);

  const [votingContractAddress, setVotingContractAddress] = useState("");
  const [electionName, setElectionName] = useState("");
  const [newElectionName, setNewElectionName] = useState("");
  const [electionCreator, setElectionCreator] = useState("");
  const [clicked, setClicked] = useState(false);

  const electionInfo = async () => {
    const address = await LastDeployedElection();

    const provider = new ethers.providers.JsonRpcProvider();
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const ethersVote = new ethers.Contract(address, Votingabi.abi, provider);

    const details = await ethersVote.getElectionDetails(); // { name, creator}
    setNewElectionName(details[0]);
    setElectionCreator(details[1]);
    setVotingContractAddress(address.toString());
  };

  // frontend interactions: Add Vote Options
  const handleOptions = (optionChips) => {
    setOptionChips(optionChips);
    console.log(optionChips);
  };

  // // wagmi set up: Create Election.
  // const { config2 } = usePrepareContractWrite({
  //   address: votingContractAddress,
  //   abi: Votingabi.abi,
  //   functionName: "addVoteOption",
  //   args: [optionChips],
  // });

  // const { write: Add } = useContractWrite(config2);

  // async function AddVoteOptions() {
  //   try {
  //     const upload = await Add?.();
  //     const tx = upload?.wait();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  //
  // const handleVoters = (voterChips) => {
  //   setVoterChips(voterChips);
  // };

  // function Tester() {
  //   return (
  //     <div>
  //       <Typography
  //         variant="h6"
  //         align="center"
  //         gutterBottom // add margin below the element
  //       >
  //         Election name: {newElectionName}
  //       </Typography>
  //       <Typography
  //         variant="h6"
  //         align="center"
  //         gutterBottom // add margin below the element
  //       >
  //         Contract Address: {votingContractAddress}
  //       </Typography>
  //       <Typography
  //         variant="h6"
  //         align="center"
  //         gutterBottom // add margin below the element
  //       >
  //         Creator Address: {electionCreator}
  //       </Typography>
  //     </div>
  //   );
  // }
  //   <Button
  //   onClick={() => {
  //     setClicked(true); //(electionInfo ? <tester /> : "get info");
  //     electionInfo;
  //   }}
  // >
  //   {clicked ? <Tester /> : "get info"}
  // </Button>

  // msg.sender function set up with wagmi
  const [nameInput, setNameInput] = useState("");

  // const [write] = useContractWrite(
  //   {
  //     addressOrName: ElectionContract,
  //     contractInterface: Electionabi.abi,
  //   },
  //   "createElection",
  //   {
  //     args: Array.from([nameInput]),
  //   },
  //   {
  //     overrides: { from: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" },
  //   }
  // );

  const create = async () => {
    try {
      const Add = await write?.();
      console.log("Add:", Add);
      console.log("write:", write);
      const tx = Add?.wait();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit2 = (e) => {
    e.preventDefault();
    create();
  };

  return (
    <Layout>
      <Container
        sx={{
          bgcolor: "white",
          // display: "flex",
          // flexDirection: "column"
          // alignItems: "center",
          // justifyContent: "center"
          ml: -8,
        }}
      >
        <Typography
          variant="h1"
          color="primary"
          align="center"
          gutterBottom // add margin below the element
        >
          {" "}
          A Tester testing testosterone
          <AccessibilityNewIcon color="error" fontSize="large" />
        </Typography>

        <Typography
          // noWrap
          color="secondary"
        >
          A Tease tester teasing a test with test tubes containing testosterone,
          A Tease tester teasing a test with test tubes containing testosterone,
          A Tease tester teasing a test with test tubes containing testosterone,
          A Tease tester teasing a test with test tubes containing testosterone,
          A Tease tester teasing a test with test tubes containing testosterone,
          A Tease tester teasing a test with test tubes containing testosterone,
          A Tease tester teasing a test with test tubes containing testosterone,
        </Typography>
        <Paper>
          <Box
            sx={
              {
                // display: "flex",
                // flexDirection: "column",
                // m: 3,
                // mt: 2,
                // alignItems: "center",
                // justifyContent: "center"
              }
            }
          >
            <Button
              // className={classes.btn}  // using makeStyles function
              sx={{
                m: 3,
                mt: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
              startIcon={
                <AccessibilityNewIcon color="error" fontSize="large" />
              }
              endIcon={<AccountCircleIcon />}
            >
              default button
            </Button>

            <Button
              variant="contained"
              sx={{
                m: 3,
                mt: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              default contained button
            </Button>

            <Button
              variant="outlined"
              sx={{
                m: 3,
                mt: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              default outlined button
            </Button>

            <Button
              variant="contained"
              color="primary"
              sx={{
                ":hover": { bgcolor: "darkblue" },
                m: 3,
                mt: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Primary Color Button
            </Button>

            <Button
              variant="contained"
              color="secondary"
              sx={{
                m: 3,
                mt: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              secondary color Button
            </Button>

            <Button
              variant="contained"
              color="primary"
              href="/test"
              sx={{
                m: 3,
                mt: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Link Button
            </Button>

            <Button
              variant="contained"
              color="primary"
              href="/test"
              disabled
              sx={{
                m: 3,
                mt: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Disabled Link Button
            </Button>
          </Box>
        </Paper>
        <Button
          onClick={() => {
            electionInfo;
            setClicked(true);
          }}
        >
          {clicked ? (
            <div>
              <Typography
                variant="h6"
                align="center"
                gutterBottom // add margin below the element
              >
                Election name: {newElectionName}
              </Typography>
              <Typography
                variant="h6"
                align="center"
                gutterBottom // add margin below the element
              >
                Contract Address: {votingContractAddress}
              </Typography>
              <Typography
                variant="h6"
                align="center"
                gutterBottom // add margin below the element
              >
                Creator Address: {electionCreator}
              </Typography>
            </div>
          ) : (
            "get info"
          )}
        </Button>

        <form noValidate autoComplete="off" onSubmit={handleSubmit2}>
          <TextField
            onChange={(e) => setNameInput(e.target.value)}
            label="Election Name"
            variant="outlined"
            fullWidth
            required
            sx={{ mt: 2 }}
          />
          <Button> Create Election</Button>
        </form>

        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <MuiChipsInput value={optionChips} onChange={handleOptions} />
          <Button> Upload Vote option</Button>
          <TextField
            onChange={(e) => setFormInput1(e.target.value)}
            label="Label"
            variant="outlined"
            fullWidth
            required
            error={formInput1Error}
            sx={{ mt: 2 }}
          />
          <TextField
            onChange={(e) => setFormInput2(e.target.value)}
            label="Label2"
            variant="outlined"
            multiline
            rows={4}
            error={formInput2Error}
            sx={{ mt: 2 }}
          />
          <br />
          <FormControl>
            <FormLabel>Radio Test</FormLabel>
            <RadioGroup
              value={radioInput}
              onChange={(e) => setRadioInput(e.target.value)}
              row
            >
              <FormControlLabel
                value="test1"
                control={<Radio />}
                label="Test1"
              />
              <FormControlLabel
                value="test2"
                label="Test2"
                control={<Radio />}
              />
              <FormControlLabel
                value="test3"
                label="Test3"
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>
          <br />
          <Button type="submit" variant="contained">
            submit
          </Button>
        </form>

        <ButtonGroup
          color="secondary"
          variant="outlined"
          sx={{
            mt: 10,
          }}
        >
          <Button>one</Button>
          <Button>two</Button>
          <Button>three</Button>
        </ButtonGroup>
      </Container>
    </Layout>
  );
}
