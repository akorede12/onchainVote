import Head from "next/head";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Votingabi from "../artifacts/contracts/voting.sol/Voting.json";
import { useContract, useContractWrite, usePrepareContractWrite } from "wagmi";

export default function Vote({ address }) {
  const { config } = usePrepareContractWrite({
    address: ElectionContract,
    abi: Votingabi.abi,
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
    Votingabi.abi,
    provider
  );
}
