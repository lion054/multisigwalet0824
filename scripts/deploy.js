const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const signers = [deployer.address, '0xSignerAddress1', '0xSignerAddress2'];

    console.log("Deploying contracts with the account:", deployer.address);

    const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
    const multisigWallet = await upgrades.deployProxy(MultisigWallet, [signers, 2], { initializer: 'initialize' });

    console.log("Multisig Wallet deployed to:", multisigWallet.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
