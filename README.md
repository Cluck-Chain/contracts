# Blockchain Chicken Farm

A full stack application for tracking chickens and eggs on the blockchain. This application demonstrates tracking the lifecycle of chickens and eggs in a farm using blockchain technology for transparency and traceability.

## Architecture

This project consists of:

1. **Smart Contracts**: Solidity smart contracts for tracking chickens and eggs
2. **Backend**: Node.js REST API for interacting with the blockchain
3. **Frontend**: React-based UI for viewing and managing farm data
4. **Docker**: Multi-container application setup

## Smart Contracts

The core blockchain functionality is implemented with the following contracts:
- `ChickenEggTracker.sol`: Main contract for registering and tracking chickens and eggs
- `Farm.sol`: Contract for farm ownership and management
- `AuthorityCenter.sol`: Contract for verifying authorities

## Running the Application

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Starting the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd blockchain-chicken-farm
   ```

2. Start all services using Docker Compose:
   ```bash
   docker-compose up
   ```

This will start:
- Hardhat node (local blockchain)
- Smart contract deployment
- Backend API (http://localhost:3001)
- Frontend UI (http://localhost:80)

### Available Services

You can start individual services:

- Start only the blockchain: `docker-compose up run`
- Start only the backend: `docker-compose up backend`
- Start only the frontend: `docker-compose up frontend`
- Deploy contracts: `docker-compose up deploy`

## Development

For development, you can run each component separately:

### Running the Smart Contracts
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat node
```

### Running the Backend
```bash
cd backend
npm install
npm run dev
```

### Running the Frontend
```bash
cd frontend
npm install
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
