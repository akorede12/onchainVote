import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Votingabi from "../artifacts/contracts/voting.sol/Voting.json";
import { useContract, useContractWrite, usePrepareContractWrite } from "wagmi";
import { ElectionContract } from "../config";
import Electionabi from "../artifacts/contracts/election.sol/Election.json";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

/*
contract interactions
2 components, maybe 1;
A way to interact with the election contract;
I just need to call the contract functions, I could just store all the functions in Election.js

after creating the election it should push the user to the vote page
*/
export default function Election() {
  const [electionName, setElectionName] = useState();
  const [lastElectionAddress, setLastElectionAddress] = useState();
  const [selectAddress, setSelectAddress] = useState();
  const [allElections, setAllElection] = useState([]);
  const [electionCount, setElectionCount] = useState(0);

  useEffect(() => {
    async function lastAddress() {
      const address = await ethersElection.viewLastDeployedElection();
      setLastElectionAddress(address);
      const count = await ethersElection.getElectionCount();
      setElectionCount(electionCount);
    }
    lastAddress();
  }, [electionName, electionCount]);

  const LastDeployedElection = () => {
    lastElectionAddress;
    return <p>{lastElectionAddress}</p>;
  };

  const ElectionCount = () => {
    return <p>{electionCount}</p>;
  };

  const viewElection = async (number) => {
    const address = await ethersElection.viewElectionAddress(number);
    setSelectAddress(address);
    return <p>{selectAddress}</p>;
  };

  const viewAllElection = async () => {
    const elections = await ethersElection.allElections();
    setAllElection(elections);
    return (
      <div>
        <List>
          {allElections.map((index, address) => (
            <ListItem
              key={index}
              button
              // onClick={() => history.push(item.path)}
            >
              <ListItemText primary={address} />
            </ListItem>
          ))}
        </List>
      </div>
    );
  };
  // wagmi set up
  const { config } = usePrepareContractWrite({
    address: ElectionContract,
    abi: Electionabi.abi,
    functionName: "createElection",
    args: [electionName],
  });

  const { write } = useContractWrite(config);

  // ethers set up
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mumbai.matic.today"
  );
  const ethersElection = new ethers.Contract(
    ElectionContract,
    Electionabi.abi,
    provider
  );

  const onCreateElection = async ({ electionName }) => {
    try {
      setElectionName(electionName);
      const create = await write?.();
      const tx = create?.wait();
      tx();
    } catch (error) {
      console.error(error);
    }
  };
}
