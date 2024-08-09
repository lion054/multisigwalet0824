const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Upgradeable MultisigWallet", function () {
    let multisigWallet;
    let owner, signer1, signer2, signer3;

    beforeEach(async function () {
        [owner, signer1, signer2, signer3, _] = await ethers.getSigners();
        const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
        multisigWallet = await upgrades.deployProxy(MultisigWallet, [[owner.address, signer1.address, signer2.address], 2], { initializer: 'initialize' });
    });

    it("should initialize with correct parameters", async function () {
        expect(await multisigWallet.requiredSignatures()).to.equal(2);
        expect(await multisigWallet.isSigner(owner.address)).to.be.true;
        expect(await multisigWallet.isSigner(signer1.address)).to.be.true;
        expect(await multisigWallet.isSigner(signer2.address)).to.be.true;
        expect(await multisigWallet.isSigner(signer3.address)).to.be.false;
    });

    it("should allow proposing transactions", async function () {
        const tx = await multisigWallet.proposeTransaction(signer3.address, ethers.utils.parseEther("1"), "0x");
        await tx.wait();
        const transaction = await multisigWallet.transactions(0);
        expect(transaction.to).to.equal(signer3.address);
    });

    it("should require 2 signatures to execute", async function () {
        const tx = await multisigWallet.proposeTransaction(signer3.address, ethers.utils.parseEther("1"), "0x");
        await tx.wait();
        await multisigWallet.signTransaction(0);
        await multisigWallet.connect(signer1).signTransaction(0);
        const transaction = await multisigWallet.transactions(0);
        expect(transaction.executed).to.be.true;
    });

    it("should not execute with less than 2 signatures", async function () {
        const tx = await multisigWallet.proposeTransaction(signer3.address, ethers.utils.parseEther("1"), "0x");
        await tx.wait();
        await multisigWallet.signTransaction(0);
        const transaction = await multisigWallet.transactions(0);
        expect(transaction.executed).to.be.false;
    });

    it("should be protected against reentrancy", async function () {
        // Deploy a reentrancy attack contract
        const ReentrancyAttack = await ethers.getContractFactory("ReentrancyAttack");
        const attackContract = await ReentrancyAttack.deploy(multisigWallet.address);
        await attackContract.deployed();

        // Propose and approve a transaction to the attack contract
        const tx = await multisigWallet.proposeTransaction(attackContract.address, ethers.utils.parseEther("1"), "0x");
        await tx.wait();
        await multisigWallet.signTransaction(0);
        await multisigWallet.connect(signer1).signTransaction(0);

        // Fund the multisig wallet
        await owner.sendTransaction({
            to: multisigWallet.address,
            value: ethers.utils.parseEther("1")
        });

        // Attempt to execute the transaction (should fail due to reentrancy protection)
        await expect(multisigWallet.executeTransaction(0)).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("should upgrade the contract and retain state", async function () {
        const MultisigWalletV2 = await ethers.getContractFactory("MultisigWalletV2");
        const upgraded = await upgrades.upgradeProxy(multisigWallet.address, MultisigWalletV2);

        expect(await upgraded.version()).to.equal("v2");
        expect(await upgraded.requiredSignatures()).to.equal(2);
        expect(await upgraded.isSigner(owner.address)).to.be.true;
        expect(await upgraded.isSigner(signer1.address)).to.be.true;
        expect(await upgraded.isSigner(signer2.address)).to.be.true;
    });
});
