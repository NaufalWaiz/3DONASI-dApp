// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DonasiChain
 * @dev Menyimpan donasi ETH secara transparan dan hanya owner yang bisa menarik dana.
 */
contract DonasiChain {
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    address public owner;
    uint256 public totalDonations;
    Donation[] private donations;

    mapping(address => uint256) private donorTotals;

    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);

    bool private lock;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier nonReentrant() {
        require(!lock, "Reentrancy");
        lock = true;
        _;
        lock = false;
    }

    constructor() {
        owner = msg.sender;
    }

    function donate() external payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");

        totalDonations += msg.value;
        donorTotals[msg.sender] += msg.value;

        donations.push(Donation({donor: msg.sender, amount: msg.value, timestamp: block.timestamp}));

        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdraw failed");

        emit FundsWithdrawn(owner, balance, block.timestamp);
    }

    function getTotalDonations() external view returns (uint256) {
        return totalDonations;
    }

    function getDonorTotal(address donor) external view returns (uint256) {
        return donorTotals[donor];
    }

    function getDonationsCount() external view returns (uint256) {
        return donations.length;
    }

    function getDonation(uint256 index) external view returns (address donor, uint256 amount, uint256 timestamp) {
        require(index < donations.length, "Invalid index");
        Donation memory d = donations[index];
        return (d.donor, d.amount, d.timestamp);
    }

    function getAllDonations() external view returns (Donation[] memory) {
        return donations;
    }
}
