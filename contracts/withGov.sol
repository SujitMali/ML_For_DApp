// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Sharkblock {
 struct Shark {
    uint256 date;
    uint256 amount;
    address addr;
    bool hasVoted;  // New flag to track voting status
}

    struct Campaign {
        string category;
        string title;
        string description;
        uint256 goal;
        uint256 startDate;
        uint256 endDate;
    }
    enum Status {
        ACTIVE,
        CLOSED
    }
    Status public status = Status.ACTIVE;
    bool public gov = false;
    uint256 public spendApprovals;
    address public owner ;
    Shark[] public sharks;
    Campaign public campaign;
    string[] public images;
    mapping(address => Shark) public balances;

    event Investment(address addr, uint256 amount);
    event Transfer(address addr, uint256 amount);
    event VoteCast(address indexed voter, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only Owner Have Access");
        _;
    }
    modifier isGoalreach() {
        require(campaign.goal > address(this).balance, "Goal Reached");
        _;
    }

    modifier isMature() {
        require(campaign.endDate > block.timestamp, "Campaign is Ended!");
        _;
    }

    modifier isClosed() {
        require(status != Status.CLOSED, "Campaign is Closed, Try Next time!");
        _;
    }


    constructor(
        string memory _category,
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _startDate,
        uint256 _endDate,
        string[] memory _images,
        address _owner
    ) {
        images = _images;
        owner = _owner;
        Campaign memory newCamp = Campaign(
            _category,
            _title,
            _description,
            _goal,
            _startDate,
            _endDate
        );
        campaign = newCamp;
    }

    function isMaturedFunction() public view returns (bool) {
        if (campaign.endDate > block.timestamp) return true;
        return false;
    }

    function closeCampaign() public isClosed {
        status = Status.CLOSED;
    }

    function startGov () public onlyOwner {
        gov = true;
    }

    function getCampaignDetails() public view returns (
    string memory, 
    string memory, 
    string memory, 
    uint256, 
    uint256, 
    uint256, 
    string[] memory, 
    address, 
    uint256, 
    uint256, 
    uint256
) {
    return (
        campaign.category,
        campaign.title,
        campaign.description,
        campaign.goal,
        campaign.startDate,
        campaign.endDate,
        images,
        owner,
        sharks.length,
        spendApprovals,
        address(this).balance
    );
}

function getTotalInvestors() public view returns (Shark[] memory) {
    return sharks;
}




  function getSpendApprovals () public view returns (uint256) {
    return spendApprovals;
}


    function spendApproval() public {
        Shark storage shark = balances[msg.sender];
        require(shark.amount > 0, "You are not allowed to vote.");
    require(!shark.hasVoted, "You have already voted.");

        spendApprovals++;
        shark.hasVoted = true;  // Mark the Shark as having voted
        emit VoteCast(msg.sender, shark.amount);
    }
    function investNow() public payable isClosed isMature isGoalreach {
        Shark memory newShark = Shark(block.timestamp, msg.value, msg.sender, false);
        sharks.push(newShark);
        balances[msg.sender] = newShark;
        emit Investment(msg.sender, msg.value);
    }

    function getMyinvestment() public view returns (Shark memory) {
        return balances[msg.sender];
    }

    function getDaysDiff() public view isMature isClosed returns (uint256) {
        return (campaign.endDate - campaign.startDate) / 60 / 60 / 24;
    }

    function getImages() public view returns (string[] memory) {
        return images;
    }

    function getTransactions() public view returns (Shark[] memory) {
        return sharks;
    }

    function getCampaignBasic() public view returns (Campaign memory) {
        return campaign;
    }

    function getMyCampaignFund() public view returns (uint256) {
        return address(this).balance;
    }

    function tranferFromCampaign() public onlyOwner {
        require(spendApprovals > sharks.length/2, "need more approvals");
        address payable addr = payable(owner);
        uint256 amount = address(this).balance;
        addr.transfer(amount);
        emit Transfer(addr, amount);
    }

    function init(
        string memory _category,
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _startDate,
        uint256 _endDate,
        string[] memory _images,
        address _owner
    ) public isClosed {
        images = _images;
        owner = _owner;
        Campaign memory newCamp = Campaign(
            _category,
            _title,
            _description,
            _goal,
            _startDate,
            _endDate
        );
        campaign = newCamp;
    }
}
