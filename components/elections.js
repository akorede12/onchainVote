import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import Votingabi from "../artifacts/contracts/voting.sol/Voting.json";
import { useContract, useContractWrite, usePrepareContractWrite } from "wagmi";
import { ElectionContract } from "../config";
import Electionabi from "../artifacts/contracts/election.sol/Election.json";

// ethers set up "http://127.0.0.1:8545/" //"https://rpc-mumbai.matic.today"
async function LastDeployedElection() {
  const provider = new ethers.providers.JsonRpcProvider();
  const ethersElection = new ethers.Contract(
    ElectionContract,
    Electionabi.abi,
    provider
  );

  return await ethersElection.viewLastDeployedElection();
}

async function AllElections() {
  const provider = new ethers.providers.JsonRpcProvider();
  const ethersElection = new ethers.Contract(
    ElectionContract,
    Electionabi.abi,
    provider
  );

  return await ethersElection.allElections();
}

async function ViewElectionAddress(index) {
  const provider = new ethers.providers.JsonRpcProvider();
  const ethersElection = new ethers.Contract(
    ElectionContract,
    Electionabi.abi,
    provider
  );

  return await ethersElection.viewElectionAddress(index);
}

async function GetElectionCount(index) {
  const provider = new ethers.providers.JsonRpcProvider();
  const ethersElection = new ethers.Contract(
    ElectionContract,
    Electionabi.abi,
    provider
  );

  return await ethersElection.getElectionCount(index);
}

async function GetElectionDetails() {
  const provider = new ethers.providers.JsonRpcProvider();
  const ethersElection = new ethers.Contract(
    ElectionContract,
    Electionabi.abi,
    provider
  );

  return await ethersElection.getElectionDetails();
}

export {
  //LastDeployedElection,
  AllElections,
  ViewElectionAddress,
  GetElectionCount,
};
