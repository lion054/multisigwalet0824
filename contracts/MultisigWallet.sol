// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MultisigWallet is Initializable, OwnableUpgradeable {
    address[] public signers;
    uint256 public requiredSignatures;
    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 signatureCount;
        mapping(address => bool) signatures;
    }

    event TransactionProposed(uint256 indexed transactionId, address indexed proposer);
    event TransactionSigned(uint256 indexed transactionId, address indexed signer);
    event TransactionExecuted(uint256 indexed transactionId);

    modifier onlySigner() {
        require(isSigner(msg.sender), "Not a signer");
        _;
    }

    function initialize(address[] memory _signers, uint256 _requiredSignatures) public initializer {
        // Directly initialize OwnableUpgradeable
        __Ownable_init();
        
        require(_signers.length == 3, "Requires exactly 3 signers");
        require(_requiredSignatures == 2, "Requires exactly 2 signatures");
        
        signers = _signers;
        requiredSignatures = _requiredSignatures;
    }

    function isSigner(address account) public view returns (bool) {
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == account) {
                return true;
            }
        }
        return false;
    }

    function proposeTransaction(address to, uint256 value, bytes memory data) public onlySigner returns (uint256) {
        uint256 transactionId = transactionCount++;
        Transaction storage transaction = transactions[transactionId];
        transaction.to = to;
        transaction.value = value;
        transaction.data = data;
        transaction.executed = false;
        transaction.signatureCount = 0;

        emit TransactionProposed(transactionId, msg.sender);
        return transactionId;
    }

    function signTransaction(uint256 transactionId) public onlySigner {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.to != address(0), "Transaction does not exist");
        require(!transaction.executed, "Transaction already executed");
        require(!transaction.signatures[msg.sender], "Transaction already signed");

        transaction.signatures[msg.sender] = true;
        transaction.signatureCount++;

        emit TransactionSigned(transactionId, msg.sender);

        if (transaction.signatureCount >= requiredSignatures) {
            executeTransaction(transactionId);
        }
    }

    function executeTransaction(uint256 transactionId) public onlySigner {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.to != address(0), "Transaction does not exist");
        require(transaction.signatureCount >= requiredSignatures, "Not enough signatures");
        require(!transaction.executed, "Transaction already executed");

        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction execution failed");

        emit TransactionExecuted(transactionId);
    }

    receive() external payable {}
}
