const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // library deployment
  const library = await hre.ethers.getContractFactory("checker");
  const libraryContract = await library.deploy();
  await libraryContract.deployed();
  console.log("checker library deployed to:", libraryContract.address);
  // contract deployment
  const election = await hre.ethers.getContractFactory("Election", {
    libraries: {
      checker: libraryContract.address,
    },
  });
  const ElectionContract = await election.deploy();
  await ElectionContract.deployed();
  console.log("Election deployed to:", ElectionContract.address);

  fs.writeFileSync(
    "./config.js",
    `
  export const ElectionContract = "${ElectionContract.address}"
  `
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
