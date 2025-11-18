pragma solidity ^0.8.21;

import "./Market.sol";

interface IMarket {
    function resolved() external view returns (bool);
    function winningOutcomeIndex() external view returns (uint256);
    function creator() external view returns (address);
    function addChildMarket(address child) external;
}

contract MarketFactory {
    address[] public markets;

    event MarketCreated(address indexed market, address indexed creator, string question);
    event SubMarketSpawned(address indexed parent, address indexed child, string question);

    function marketsCount() external view returns (uint256) {
        return markets.length;
    }

    function getAllMarkets() external view returns (address[] memory) {
        return markets;
    }

    function createMarket(
        string memory question,
        string[] memory outcomes,
        uint256 expiryTime,
        address parentMarket
    ) external returns (address) {
        Market market = new Market(address(this), msg.sender, parentMarket, question, outcomes, expiryTime);
        markets.push(address(market));

        if (parentMarket != address(0)) {
            IMarket(parentMarket).addChildMarket(address(market));
        }

        emit MarketCreated(address(market), msg.sender, question);
        return address(market);
    }

    function spawnSubMarket(
        address parent,
        string memory newQuestion,
        string[] memory newOutcomes,
        uint256 newExpiryTime
    ) external returns (address) {
        require(parent != address(0), "No parent");
        require(IMarket(parent).resolved(), "Parent not resolved");

        Market child = new Market(address(this), msg.sender, parent, newQuestion, newOutcomes, newExpiryTime);
        markets.push(address(child));

        IMarket(parent).addChildMarket(address(child));
        emit SubMarketSpawned(parent, address(child), newQuestion);
        return address(child);
    }
}