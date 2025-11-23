const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("DonasiChain", function () {
  async function deployFixture() {
    const [owner, donor1, donor2] = await ethers.getSigners();
    const DonasiChain = await ethers.getContractFactory("DonasiChain");
    const contract = await DonasiChain.deploy();
    await contract.waitForDeployment();
    return { contract, owner, donor1, donor2 };
  }

  it("menyimpan donasi dan mencatat total", async function () {
    const { contract, donor1 } = await loadFixture(deployFixture);
    const donationAmount = ethers.parseEther("0.5");
    await expect(contract.connect(donor1).donate({ value: donationAmount }))
      .to.emit(contract, "DonationReceived")
      .withArgs(donor1.address, donationAmount, anyValue);

    expect(await contract.getTotalDonations()).to.equal(donationAmount);
    expect(await contract.getDonorTotal(donor1.address)).to.equal(donationAmount);
    expect(await contract.getDonationsCount()).to.equal(1n);
  });

  it("mengizinkan hanya owner yang dapat menarik dana", async function () {
    const { contract, owner, donor1 } = await loadFixture(deployFixture);
    await contract.connect(donor1).donate({ value: ethers.parseEther("1") });

    await expect(contract.connect(donor1).withdraw()).to.be.revertedWith("Not owner");

    await expect(contract.connect(owner).withdraw())
      .to.emit(contract, "FundsWithdrawn")
      .withArgs(owner.address, ethers.parseEther("1"), anyValue);
  });

  it("mengembalikan data donasi yang tepat", async function () {
    const { contract, donor1, donor2 } = await loadFixture(deployFixture);
    await contract.connect(donor1).donate({ value: ethers.parseEther("0.25") });
    await contract.connect(donor2).donate({ value: ethers.parseEther("0.75") });

    const [donorAddr, amount, timestamp] = await contract.getDonation(1);
    expect(donorAddr).to.equal(donor2.address);
    expect(amount).to.equal(ethers.parseEther("0.75"));
    expect(timestamp).to.be.greaterThan(0);

    await expect(contract.getDonation(3)).to.be.revertedWith("Invalid index");
  });
});
