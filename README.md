# Upgradeable Multisig Wallet

This project implements an upgradeable multisig wallet smart contract using Solidity. The wallet requires 2 out of 3 signers to approve transactions and supports upgrades via a proxy pattern.

The `MultisigWallet` contract is a secure and upgradeable multisig wallet that requires 2 out of 3 signers to approve transactions. It uses OpenZeppelin's `Ownable` for access control and `Initializable` for upgradeability, allowing signers to propose, approve, and execute transactions while ensuring unauthorized actions are prevented. The contract includes measures to protect against common vulnerabilities and maintains state integrity during upgrades using proxy patterns. Comprehensive tests cover all essential functions, including transaction proposals, approvals, executions, and upgrades, ensuring the contract works reliably and securely.

## Features

- 2/3 Multisig functionality
- Upgradeable using OpenZeppelin's proxy pattern
- Secure against common vulnerabilities

## Requirements

- Node.js
- Hardhat
- OpenZeppelin Contracts and Upgrades

## Setup

1. Clone the repository.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Deploy the contract:
    ```bash
    npx hardhat run scripts/deploy.js
    ```
4. Run tests:
    ```bash
    npx hardhat test
    ```

## Contract Details

- `MultisigWallet.sol`: The main wallet contract.
- Uses OpenZeppelin's `Initializable` for proxy initialization.

## Security Considerations

- The contract is protected against reentrancy and other common vulnerabilities.
- Upgrades are restricted to the owner only.

## Upgrading

1. Implement the new logic in a new contract.
2. Deploy the new logic contract.
3. Use the `upgradeProxy` function from OpenZeppelin to upgrade:
    ```javascript
    const upgraded = await upgrades.upgradeProxy(proxyAddress, NewImplementation);
    ```
