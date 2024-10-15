// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Sharkblock.sol";

contract Sharkblockfactory {
    address public masterContract;
    address owner = msg.sender;
    address[] public sharkblocks;
    struct User {
        string name;
        string avatar;
        address addr;
    }
    mapping(address => User) getuser;
    User[] public users;
    event NewSharkblock(address addr);

     // Struct to hold complete campaign details
    struct CampaignData {
        address campaignAddress;
        string category;
        string title;
        string description;
        uint256 goal;
        uint256 startDate;
        uint256 endDate;
        string[] images;
        address owner;
    }

    CampaignData[] public campaigns; 

    modifier masterContractAvailable() {
      require(masterContract != address(0), "Master contract not set");
      _;
    }
    constructor(address _mastercontract) {
        masterContract = _mastercontract;
    }

    function setNewmastercontract(address _addr) public {
        masterContract = _addr;
    }

    function createNewUser(
        string memory _name,
        string memory _avatar,
        address _addr
    ) public {
        User memory newuser = User(_name, _avatar, _addr);
        getuser[msg.sender] = newuser;
        users.push(newuser);
    }

    function showAlluser() public view returns (User[] memory) {
        return users;
    }

    function getAllCampaignAddress() public view returns (address[] memory) {
        return sharkblocks;
    }

// Function to get the list of campaigns
function getCampaignsList() public view returns (CampaignData[] memory) {
    return campaigns; // Return the entire array of campaigns
}
    function deleteCampaign(uint256 index) public {
        delete sharkblocks[index];
    }

    function deleteUser(uint256 index) public {
        delete users[index];
    }

    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(
                clone,
                0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
            )
            mstore(add(clone, 0x14), targetBytes)
            mstore(
                add(clone, 0x28),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )
            result := create(0, clone, 0x37)
        }
    }


    function createCampaign(
        string memory _category,
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _startDate,
        uint256 _endDate,
        string[] memory _images,
        address _owner
    ) public masterContractAvailable {
        address clone = createClone(masterContract);
        Sharkblock(clone).init(
            _category,
            _title,
            _description,
            _goal,
            _startDate,
            _endDate,
            _images,
            _owner
        );
        sharkblocks.push(clone);

             // Store complete campaign data in the campaigns array
        campaigns.push(CampaignData({
            campaignAddress: clone,
            category: _category,
            title: _title,
            description: _description,
            goal: _goal,
            startDate: _startDate,
            endDate: _endDate,
            images: _images,
            owner: _owner
        }));
        emit NewSharkblock(clone);
    }
}
