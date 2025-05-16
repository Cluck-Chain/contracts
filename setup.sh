cd contracts
npm install
npx hardhat compile
cp -r artifacts typechain ../frontend/src/
npx hardhat test

