# OnChaim Votes: Secure and Transparent Voting Made Easy

Experience the future of voting with OnChain Votes. My Next.js dapp that interacts with an EVM Election/Voting smart contract to enable seamless and secure elections. Create elections, add voters, define vote options, and cast votes effortlessly. Gain access to election details, allowed voters, and comprehensive reports on voter participation and choices. With OnChain Votes, you can trust in the integrity of your elections, thanks to a built-in "checker" library that validates vote options. 

## Requirements

- Node.js v14.0 or later
- Metamask
- Git
- Hardhat

## Installation

1. Clone the repository: `git clone https://github.com/akorede12/onchainVote`
2. Navigate to the project directory: `cd onchainVote`
3. Install dependencies: `npm install`

## Usage

1. start up a local hardhat node: ` npx hardhat node`
2. import one of the test accounts into your metamask wallet.
3. deploy the smart contract: `npx hardhat run scripts/deploy.js --network localhost`
4. Start the Next.js development server: `npm run dev`
5. Open a web browser and navigate to `http://localhost:3000`
6. Connect your MetaMask wallet to the app
7. Interact with the smart contract using the user interface

## Smart Contract

The smart contract used by this dapp can be found in the `contracts` directory. It was written in Solidity and compiled using the `solc` compiler. By ABOABA AKOREDE.

## Smart Contract Summary

This is a smart contract for a voting DApp. The contract allows for the creation of an election, addition of voters, addition of vote options, and casting of votes. The contract also provides methods for getting the election details, getting the list of allowed voters, getting the list of vote options, getting the list of voters and the votes they cast, and getting the vote count for a specific vote option.

The contract has several state variables, including the address of the owner of the contract, the name of the election, the address of the creator of the election, a mapping of voters to whether or not they have voted, a mapping of voters to the vote option they cast, a list of vote options, and a list of allowed voters.

The contract has several functions, including a constructor that sets the initial values for the contract, a function for setting the election details, a function for getting the election details, a function for adding allowed voters, a function for registering voters, a function for viewing the list of voters, a function for unregistering voters, a function for adding vote options, a function for viewing the list of vote options, a function for casting votes, a function for getting the list of voters and the votes they cast, and a function for getting the vote count for a specific vote option.

The contract also uses a library called "checker" to check the validity of vote options and get the index of a vote option in the list of vote options.

## Acknowledgements

This project was inspired by my will to complete 1 blockchain project every month of the year 2023, this
is suppossed to be my project for the month of january, however this is May, things didn't go exactly as planned but we move.

## License

This project is licensed under the [MIT License](LICENSE).
