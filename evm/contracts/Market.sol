pragma solidity ^0.8.21;

contract Market {
    address public factory;
    address public creator;
    address public parentMarket;

    string public question;
    string[] public outcomes;
    uint256 public expiryTime;

    mapping(address => mapping(uint256 => uint256)) public stakes;
    mapping(uint256 => uint256) public outcomeStakes;
    uint256 public totalStaked;

    bool public resolved;
    uint256 public winningOutcomeIndex;

    address[] public childMarkets;

    event BetPlaced(address indexed bettor, uint256 indexed outcomeIndex, uint256 amount);
    event MarketResolved(uint256 indexed winningOutcomeIndex);
    event ChildMarketAdded(address indexed child);

    constructor(
        address _factory,
        address _creator,
        address _parentMarket,
        string memory _question,
        string[] memory _outcomes,
        uint256 _expiryTime
    ) {
        require(_outcomes.length >= 2, "Invalid outcomes");
        factory = _factory;
        creator = _creator;
        parentMarket = _parentMarket;
        question = _question;
        outcomes = _outcomes;
        expiryTime = _expiryTime;
    }

    function outcomesCount() external view returns (uint256) {
        return outcomes.length;
    }

    function childMarketsCount() external view returns (uint256) {
        return childMarkets.length;
    }

    function placeBet(uint256 outcomeIndex) external payable {
        require(!resolved, "Market resolved");
        require(block.timestamp <= expiryTime, "Market expired");
        require(outcomeIndex < outcomes.length, "Invalid outcome");
        require(msg.value > 0, "No stake");

        stakes[msg.sender][outcomeIndex] += msg.value;
        outcomeStakes[outcomeIndex] += msg.value;
        totalStaked += msg.value;

        emit BetPlaced(msg.sender, outcomeIndex, msg.value);
    }

    function resolve(uint256 _winningOutcomeIndex) external {
        require(msg.sender == creator, "Unauthorized");
        require(!resolved, "Already resolved");
        require(_winningOutcomeIndex < outcomes.length, "Invalid outcome");

        resolved = true;
        winningOutcomeIndex = _winningOutcomeIndex;

        emit MarketResolved(_winningOutcomeIndex);
    }

    function addChildMarket(address child) external {
        require(msg.sender == factory, "Only factory");
        childMarkets.push(child);
        emit ChildMarketAdded(child);
    }

    // Accept direct funding if needed (not counted towards any outcome)
    receive() external payable {
        totalStaked += msg.value;
    }
}