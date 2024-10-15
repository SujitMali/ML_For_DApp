
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe ("SharkBlockFactory",  function () {
  let factory, owner, addr1, addr2, masterAddress;
  beforeEach(async () => {
     [owner, addr1, addr2, masterAddress] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Sharkblockfactory");
     factory = await Factory.deploy(masterAddress.address);
    await factory.deployed();
  });

        it("Should have correct master address", async function () {
        const masterAddresss = await factory.masterContract();
        expect(masterAddresss).to.equal(masterAddress.address);
        })

        it('Should NOT create campaign if not master', async () => {
            await factory.setNewmastercontract('0x0000000000000000000000000000000000000000');
            await expect(factory.createCampaign(
                "category",
                "title",
                "description",
                100000,
                3516546,
                4654453,
                ["imagelinks"],
                owner.address
            )).to.be.revertedWith("Master contract not set");
        });

        it('Should create campaign', async () => {
     
             await factory.createCampaign(
                "category",
                "title",
                "description",
                100000,
                3516546,
                4654453,
                ["imagelinks"],
                owner.address
            );
            
            const sharkblocks = await factory.sharkblocks(0);
            expect(sharkblocks).to.properAddress;
        });

      it('should assign new masterAddress', async () => {
        await factory.setNewmastercontract(addr1.address);
        const masterAddresss = await factory.masterContract();
        expect(masterAddresss).to.equal(addr1.address);
      });

      it("should create new user", async ()=> {
        await factory.createNewUser("Anil", "avatar",addr1.address);
        const user = await factory.users(0);
        expect(user.addr).to.equal(addr1.address);
        expect(user.name).to.equal("Anil");
        expect(user.avatar).to.equal("avatar");
      });

      it("should show all users", async () => {
        await factory.createNewUser("Anil", "avatar",addr1.address);
        await factory.createNewUser("Anil2", "avatar2",addr2.address);
        const users = await factory.showAlluser();
        expect(users.length).to.equal(2);
        expect(users[0].addr).to.equal(addr1.address);
        expect(users[1].addr).to.equal(addr2.address);
      });

        it("should show all campaigns", async () => {
        await factory.createCampaign(
            "category",
            "title",
            "description",
            100000,
            3516546,
            4654453,
            ["imagelinks"],
            owner.address
        );
        await factory.createCampaign(
            "category",
            "title",
            "description",
            100000,
            3516546,
            4654453,
            ["imagelinks"],
            owner.address
        );
        const campaigns = await factory.getAllCampaignAddress();
        expect(campaigns.length).to.equal(2);
        expect(campaigns[0]).to.properAddress;
        expect(campaigns[1]).to.properAddress;
      });

      it("should delete user", async () => {
        await factory.createNewUser("Anil", "avatar",addr1.address);
        const users = await factory.showAlluser();
        const beforeuser = await factory.users(0);
        expect(beforeuser.addr).to.equal(addr1.address);
        expect(beforeuser.name).to.equal("Anil");
        expect(beforeuser.avatar).to.equal("avatar");
        
       await factory.deleteUser(0);
       const afteruser = await factory.users(0);
       expect(afteruser.addr).to.equal("0x0000000000000000000000000000000000000000");
       expect(afteruser.name).to.equal("");
       expect(afteruser.avatar).to.equal("");
      });

        it("should delete campaign", async () => {
        await factory.createCampaign(
            "category",
            "title",
            "description",
            100000,
            3516546,
            4654453,
            ["imagelinks"],
            owner.address
        );
        const campaigns = await factory.getAllCampaignAddress();
        const beforecampaign = await factory.sharkblocks(0);
        expect(beforecampaign).to.properAddress;
        await factory.deleteCampaign(0);
        const aftercampaign = await factory.sharkblocks(0);
        expect(aftercampaign).to.equal("0x0000000000000000000000000000000000000000");
      });
});
