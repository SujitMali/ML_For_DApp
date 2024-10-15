
const { expect } = require("chai");
const { ethers } = require("hardhat");

function dateinSec(date) {

   const dateInSecs = Math.floor(new Date(date).getTime() / 1000);
   
   return dateInSecs;
   }
describe ("Sharkblock",  function () {
  let sharkblock, owner, addr1, addr2;
  beforeEach(async () => {
     [owner, addr1, addr2,] = await ethers.getSigners();
    const SharkBlock = await ethers.getContractFactory("Sharkblock");
    console.log();
     sharkblock = await SharkBlock.deploy(
        "category",
        "title",
        "description",
        100000,
        dateinSec("2022-05-01"),
        dateinSec("2022-05-05"),
        ["imagelinks"],
        owner.address
     );
    await sharkblock.deployed();
  });

    it("Should have correct campaign Deatils", async function () {
        const campaign = await sharkblock.getCampaignDetails();
        expect(campaign.category).to.equal("category");
        expect(campaign.title).to.equal("title");
        expect(campaign.description).to.equal("description");
        expect(campaign.goal).to.equal(100000);
        expect(campaign.startDate).to.equal(dateinSec("2022-05-01"));
        expect(campaign.endDate).to.equal(dateinSec("2022-05-05"));
    });

    it("should have correct image links", async () => {
         const getImages = await sharkblock.getImages();
            expect(getImages.length).to.equal(1);
    });

    it("Should have correct campaign owner", async function () {
        const campaignOwner = await sharkblock.owner();
        expect(campaignOwner).to.equal(owner.address);
    });

    it("Should accept fund", async () => {
        await sharkblock.connect(owner).investNow({value: 10000});
        const balanceofContract = await sharkblock.getMyCampaignFund();
        expect(balanceofContract).to.equal(10000);
    });

    it("should show how much fund user invested", async () => {
        await sharkblock.connect(owner).investNow({value: 10000});
         const getMyinvestment = await sharkblock.connect(owner).getMyinvestment();
            expect(getMyinvestment.amount).to.equal(10000);
            expect(getMyinvestment.addr).to.equal(owner.address);
    });

    it("should have correct transaction details", async () => {
        await sharkblock.connect(owner).investNow({value: 10000});
        const transaction = await sharkblock.getTransactions();
        expect(transaction.length).to.equal(1);
    });

    it("showuld have correct status", async () => {
        const status = await sharkblock.status();
        expect(status).to.equal(1);
    });

    it("should have close status", async () => {
       await sharkblock.closeCampaign();
       const status = await sharkblock.status();
        expect(status).to.equal(2);
    });

    it("should not fund if status is closed", async () => {
        await sharkblock.closeCampaign();
        await expect(sharkblock.connect(owner).investNow({value: 10000})).to.be.revertedWith("Campaign is Closed, Try Next time!");
    });

    it("should mutate campaign details", async () => {
        await sharkblock.init(
            "category1",
            "title1",
            "description1",
            100000,
            dateinSec("2022-01-01"),
            dateinSec("2022-02-02"),
            ["imagelinks"],
            owner.address
        );
        const campaign = await sharkblock.getCampaignDetails();
        expect(campaign.category).to.equal("category1");
        expect(campaign.title).to.equal("title1");
        expect(campaign.description).to.equal("description1");
        expect(campaign.goal).to.equal(100000);
        expect(campaign.startDate).to.equal(dateinSec("2022-01-01"));
        expect(campaign.endDate).to.equal(dateinSec("2022-02-02"));
    });
     
    it("should not mutate campaign details if status is closed", async () => {
        await sharkblock.closeCampaign();
        await expect(sharkblock.init(
            "category1",
            "title1",
            "description1",
            100000,
            dateinSec("2022-01-01"),
            dateinSec("2022-02-02"),
            ["imagelinks"],
            owner.address
        )).to.be.revertedWith("Campaign is Closed, Try Next time!");
    });

    it("should not fund if campign is matured", async () => {
        await sharkblock.init(
            "category1",
            "title1",
            "description1",
            100000,
            dateinSec("2022-01-01"),
            dateinSec("2022-02-02"),
            ["imagelinks"],
            owner.address
        );
        await expect(sharkblock.connect(owner).investNow({value: 100000})).to.be.revertedWith("Campaign is Ended!");
    });

    it("should not fund if goal is reached", async () => {
        await sharkblock.init(
            "category1",
            "title1",
            "description1",
            100000,
            dateinSec("2022-01-01"),
            dateinSec("2022-05-05"),
            ["imagelinks"],
            owner.address
        );
        await sharkblock.connect(owner).investNow({value: 10000});
        await expect(sharkblock.connect(addr1).investNow({value: 100000})).to.be.revertedWith("Goal Reached");
    });

    it("should tranfer funds from campaign to owner", async () => {
        await sharkblock.init(
            "category1",
            "title1",
            "description1",
            ethers.utils.parseEther("100"),
            dateinSec("2022-01-01"),
            dateinSec("2022-05-05"),
            ["imagelinks"],
            owner.address
        );
        await sharkblock.connect(owner).investNow({value: ethers.utils.parseEther("50")});
        await sharkblock.connect(owner).tranferFromCampaign();
        const campaignFundAfter = await sharkblock.getMyCampaignFund();
        expect(campaignFundAfter).to.equal(0);
    });
});