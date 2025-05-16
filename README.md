# Blockchain Farm Management

A full stack application for managing farms and tracking chickens and eggs on the blockchain. This application demonstrates farm certification and livestock tracking using Ethereum blockchain technology for transparency and traceability.

## Architecture

This project consists of:

1. **Smart Contracts**: Solidity smart contracts for managing farms, chickens, and eggs
2. **Frontend**: Next.js based UI for viewing and managing farms, chickens, and eggs

## Smart Contracts

The core blockchain functionality is implemented with the following contracts:
- `Farm.sol`: Contract for farm management, tracking chickens and eggs
- `AuthorityCenter.sol`: Contract for certifying farms and managing authorities

### Farm Contract
The Farm contract allows farm owners to:
- Register and track chickens
- Register eggs produced by chickens
- Update farm information
- Remove chickens when needed

### AuthorityCenter Contract
The AuthorityCenter contract enables:
- Registration of certified farms
- Adding and removing authorities
- Verifying farm certification status

## Running the Application

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Hardhat](https://hardhat.org/) for local blockchain development
- [MetaMask](https://metamask.io/) for wallet connectivity

### Config MetaMask

To connect MetaMask to your local Hardhat network, follow these steps:

1. Open MetaMask, click on the network selection dropdown, then click "Add Network"
2. Click "Add a network manually"
3. Fill in the network details:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545/`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

4. Save and select the newly added "Hardhat Local" network

5. Import a Hardhat account (optional):
   - When you run `npx hardhat node`, the console displays 10 pre-configured accounts with their private keys
   - In MetaMask, click on your account icon -> Import Account
   - Copy the first and some of the rest from the Hardhat console (without the 0x prefix)
   - Paste it into MetaMask's private key input field and import

Now when you access the frontend website, MetaMask should be connected to your local Hardhat network.

### Starting the Application

1. Clone the repository:

2. Compile and run the hardhat Node:
```bash
./setup.sh
cd contracts
npx hardhat node
```

3. In a separate terminal, deploy the contracts:
```bash
cd contracts
npx hardhat ignition deploy ignition/modules/AuthorityCenterModule.ts --network localhost
```

4. Install and run the frontend:
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

## License

This project is licensed under the MIT License - see the LICENSE file for details.
