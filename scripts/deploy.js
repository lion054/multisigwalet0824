const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const signers = [
        deployer.address, // Deployer address
        '0xfA1C731d2b808ba08261A098badf43171F955C43', // Signer 1
        '0x9B5bE804aDFAfBAb8015519F633BFC81cF6cd8DD'  // Signer 2
        '0x9B5bE804aDFAfBAb8015519F633BFC81cF6cLAZY'  // Signer 3
    ];

    console.log("Deploying contracts with the account:", deployer.address);


    const MultisigWallet = await ethers.getContractFactory("MultisigWallet");

  
    const multisigWallet = await upgrades.deployProxy(
        MultisigWallet, 
        [signers, 2],  
        { initializer: 'initialize' }
    );

    await multisigWallet.deployed(); 

    console.log("MultisigWallet deployed to:", multisigWallet.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
