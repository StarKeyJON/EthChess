
//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
        .=********+:      :+***********-       +********+:                    
        -%@@%%%%%@@+      +%@@%%%%%%%@@#.     .@@@%%%%%@@*.                   
        -%@*....-%@%++++++#@@#......=@@%*+++++*@@+....-@@*.                   
        -%@*    .*%%%%%%%%%%#=      :*%%%%%%%%%%#-    :@@*.                   
        -%@*                                          :@@*.                   
        -%@#------------------------------------------+@@*.                   
        .+@@@%*++++++++++++++++++++++++++++++++++++*#@@@#-                    
          :#@@%=.                                 :*@@%=                      
            -#@@%*+++++++++++++++++++++++++++++++#@@%+:                       
             .+%@*:.::::::::::::::::::::::::::::+@@#-                         
              =%@+                              =@@*.                         
              =%@+                              =@@*.                         
              =%@+                              =@@*.                         
              =%@+                              =@@*.                         
              =%@+  ETHChess ETHChess ETHChess  =@@*.                         
              =%@+                              =@@*.                         
              =%@+                              =@@*.                         
              =%@+                              =@@*.                         
              =%@+                              =@@*.                         
              =%@+                              =@@*.                         
              -%@*:............................:+@@*.                         
             .+@@#++++++++++++++++++++++++++++++#@@#-                         
            .*@@#:                              .+@@%=                        
          .+%@@@%********************************#@@@@*:                      
          -@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@*                      
          -@@*:         Jeremiah Nolet             .=#@*                      
          -@@+.                                     -#@*                      
    .+****#@@%**************************************#@@%****+-                
    =%@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@*.               
  .=@@*:.................................................=%@#.               
    =@@%################################################*#%@@#.               
    :*#######################################################=   
 */

// import "hardhat/console.sol";
// import "@openzeppelin/contracts/access/Ownable.sol"; 
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

// Access controlled contract to enable trustless
// chess tournaments and payouts.

// ~~~ Players enter 1v1 matches ~~~
// ~~~ Players enter tournament matches ~~~
// ~~~ NFT Leagues created and entered for elite Tournaments ~~~
// ~~~ Fans can bet on players/leagues and receive portions of payouts ~~~

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ETHChessLeagues is ReentrancyGuard {

  address public ethChessNFTs; 
  uint public playerIds;
  uint public leagueIds;

  struct Player {
    uint playerId;
    bool inLeague;
    uint leagueId;
    address playersAddress;
  }

  struct League {
    uint leagueId;
    bool inTour;
    bool isPublic;
    string name;
    uint id;
    uint maxCapacity;
    uint joined;
    uint tours;
    address initiator;
    address[] invites;
    address[] members;
  }

  mapping(address => Player) public addressToPlayer;
  mapping(uint => League) public idToLeague;
  mapping(address => uint) public addressToLeagueId;

  event LeagueCreated(uint leagueId, string name, address initiator);
  event LeagueJoined(uint leagueId, address member);

  address private DEV;

  constructor (address nftAddress){
    ethChessNFTs = nftAddress;
  }

  modifier isDev(){
    require(msg.sender == DEV, "DOES NOT HAVE DEV ROLE");
    _;
  }

  modifier hasChessNFT(){
    uint balance = IERC721(ethChessNFTs).balanceOf(msg.sender);
    require(balance >= 1, "Not an ETH-Chess NFT holder!");
    _;
  }

  modifier canCreateLeague(){
    uint balance = IERC721(ethChessNFTs).balanceOf(msg.sender);
    require(balance >= 6, "Must hold 6 ETH-Chess NFTs!");
    _;
  }

  /// @notice Executed to create a new league.
  /// @dev Must hold >= 6 ETHChess NFTs && not currently in a league.
  /// @param name Name of the league
  /// @param capacity Capacity of the league
  /// @param isPublic Is the league public
  /// @param invites [] array of invites, left empty if league is public
  /// @param members [] msg.sender starts membership array
  /// @return Bool success or failure
  function createLeague(string memory name, uint capacity, bool isPublic, address[] calldata invites, address[] calldata members) public canCreateLeague returns(bool){
    Player memory player = addressToPlayer[msg.sender];
    require(!player.inLeague, "Already in a league!");
    require(capacity >= 3, "You need to have at least 3 members!");
    leagueIds++;
    idToLeague[leagueIds] = League(
      leagueIds,
      false,
      isPublic,
      name,
      leagueIds,
      capacity,
      1,
      0,
      msg.sender,
      invites,
      members
    );
    addressToLeagueId[msg.sender] = leagueIds;
    emit LeagueCreated(leagueIds, name, msg.sender);
    return true;
  }

  /// @notice Executed to join a league.
  /// @dev Must hold >= 6 ETHChess NFTs && not currently in a league.
  /// @param leagueId Id of the league
  /// @return Bool success or failure
  function joinLeague(uint leagueId) public hasChessNFT returns(bool) {
    Player memory player = addressToPlayer[msg.sender];
    League storage league = idToLeague[leagueId];
    require(!player.inLeague, "Already in a league!");
    require(league.joined < league.maxCapacity, "League is full!");
    if(!league.isPublic){
      bool invited;
      for(uint i; i>league.invites.length; i++){
        if(league.invites[i] == msg.sender){
          invited = true;
        }
      }
      require(invited, "Private league!");
      league.joined++;
      league.members.push(msg.sender);
      player.leagueId = leagueId;
      player.inLeague = true;
    } else {
      league.joined++;
      league.members.push(msg.sender);
      player.leagueId = leagueId;
      player.inLeague = true;
    }
    addressToLeagueId[msg.sender] = leagueId;
    emit LeagueJoined(leagueId, msg.sender);
    return true;
  }
  
  function fetchLeague(uint leagueId) external view returns(League memory){
    return idToLeague[leagueId];
  }

  function fetchInLeague(address player, uint leagueId) external view returns (bool) {
    return (addressToLeagueId[player] == leagueId);
  }

  function fetchLeagueData(uint leagueId) public view returns(address[] memory members, uint id){
    League storage league = idToLeague[leagueId];
    return (league.members, league.leagueId);
  }

  function canTour(address player) public view returns(bool){
    uint leagueId = addressToLeagueId[player];
    League memory league = idToLeague[leagueId];
    return !league.inTour;
  }

  function fetchPlayerLeagueId(address player) public view returns(uint leagueId){
    uint id = addressToLeagueId[player];
    return id;
  }

  function updateLeague(uint leagueId, bool inTour, uint tours) external returns(bool){
    League storage league = idToLeague[leagueId];
    league.inTour = inTour;
    league.tours = league.tours + tours;
    return true;
  }
  }