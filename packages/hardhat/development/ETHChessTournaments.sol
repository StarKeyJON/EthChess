//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// ETHChess - Trustless chess competitions, tournaments and decentralized payouts.

// ~~~ 1v1 Matches ~~~
// ~~~ DeathMatch Competitions ~~~
// ~~~ League Tournaments ~~~

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

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/IETHChess.sol";

contract ETHChessTournaments is ReentrancyGuard {

  /*~~~>
    State Address Variables
  <~~~*/

  address public ethChessNFTs; 
  address public ethLeagues;
  address public treasury;
  uint public tourIds;
  uint public matchIds;
  uint public roundIds;
  uint public delta; // Minimum wait period for winning claim
  uint public tourMin; // Tournament entrance fee minimum
  uint public fee; // Platform fee set at 5%
  uint public baseSecurity; // Security needed for a winning claim

  string private constant errMessage1 = "Insufficient security deposit";
  string private constant errMessage2 = "Not a participant!";
  
  struct Player {
    uint playerId;
    bool inLeague;
    uint leagueId;
    address playersAddress;
  }

  struct Match {
    uint matchId;
    uint league1;
    uint league2;
    address player1;
    address player2;
    uint startTime;
    string startHash;
    string endHash;
    uint winningLeagueId;
  }

  struct Claim {
    uint matchId;
    uint claimStart;
    uint security;
    uint league;
    address claimant;
    string startHash;
    string endHash;
    bool contested;
    bool p1Refunded;
    bool p2Refunded;
  }

    struct Dispute {
    uint matchId;
    uint claimStart;
    uint dSecurity;
    uint league;
    address disputer;
    string startHash;
    string endHash;
    string contestedHash;
    bool tally;
    address[] votedFor;
    address[] votedAgainst;
  }

  struct Tournament {
    uint tourId;
    uint entrancePrice;
    uint pot;
    uint tourstart;
    uint tourSize;
    mapping(uint => League) private leagues;
    mapping(uint => Round) private rounds;
    uint[] leagues;
    uint[] rounds;
    uint tourRounds;
    uint remaining;
    bool touring;
    address initiator;
  }

  struct Round {
    uint roundId;
    uint tourId;
    string IPFSHash;
    bool active;
    bool[] init;
    uint[] matchIds;
    mapping(uint => uint) private matchIds;
    mapping(uint => League) private leagues;
    uint[] claimIds;
    uint[] leagues;
    uint[] winners;
  }

  mapping(address => Player) public addressToPlayer;
  mapping(uint => Match) public idToMatch;
  mapping(uint => Claim) public idToClaim;
  mapping(uint => Dispute) public idToDispute;
  mapping(uint => Tournament) public idToTournament;
  mapping(uint => Round) public idToRound;

  event MatchSet(address player1, address player2, uint amount, uint matchId);
  event ClaimStarted(address claimant, uint matchId);
  event ClaimContested(address disputer, uint matchId, uint claimId);
  event DisputeResolved(uint matchId, bool truth);
  event MatchEnd(address winner, string ipfsHash);
  event MatchRefunded(uint matchId);
  event TournamentStarted(uint[] leagues, address starter, uint reward, uint roundId);
  event TournamentAdvanced(uint[] leagues, uint roundId);
  event TournamentEnded(uint tourId, uint winner);

  address private DEV;

  modifier isDev(){
    require(msg.sender == DEV, "DOES NOT HAVE DEV ROLE");
    _;
  }
  modifier hasChessNFT(){
    uint balance = IERC721(ethChessNFTs).balanceOf(msg.sender);
    require(balance >= 1, "Not an ETH-Chess NFT holder!");
    _;
  }

  constructor(address devAddress, address NFTs) {
    ethChessNFTs = NFTs;
    DEV = devAddress;
    delta = 7;
    fee = 500;
    baseSecurity = 1e17;
  }

  function changeDelta(uint newDelta) public isDev returns(bool) {
    delta = newDelta;
    return true;
  }

  function changeSecurity(uint newSecurity) public isDev returns(bool){
    baseSecurity = newSecurity;
    return true;
  }

  function newNFTAddress(address newAddress) public isDev returns(bool){
    ethChessNFTs = newAddress;
    return true;
  }

  function newTreasuryAddress(address newTreasury) public isDev returns(bool){
    treasury = newTreasury;
    return true;
  }

  function newLeagueAddress(address newLeague) public isDev returns(bool){
    ethLeagues = newLeague;
    return true;
  }

  /// @notice Initiates a new tournament. 
  /// @dev Only league members are allowed to create.
  /// @param leagueId Id of the league
  /// @param entrancePrice Price for each league to enter; goes towards rewards pot
  /// @param tourSize Size of the tour; 8, 16 or 32
  /// @return Bool success or failure
  function initTournament(uint leagueId, uint entrancePrice, uint tourSize) public payable hasChessNFT returns(bool) {
    require(IETHLeagues(ethLeagues).fetchInLeague(msg.sender, leagueId), "Not in the league!");
    require(IETHLeagues(ethLeagues).canTour(msg.sender), "Already in a Tournament!");
    require(entrancePrice >= tourMin, "Entrance price is less than Tour min!");
    require(msg.value == entrancePrice, "Must supply entrance price to initiate Tour!");
    require(tourSize == 8 || tourSize == 16 || tourSize == 32, "Tour size must be 8, 16 or 32!");
    require(IETHLeagues(ethLeagues).updateLeague(leagueId, true, 1));
    tourIds++;
    uint[] memory eleagues;
    idToTournament[tourIds] = Tournament(
      tourIds,
      entrancePrice,
      entrancePrice,
      block.timestamp,
      tourSize,
      eleagues,
      eleagues,
      0,
      tourSize,
      false,
      msg.sender
    );
    idToTournament[tourIds].leagues.push(leagueId);
    return true;
  }
  
  /// @notice Allows leagues to join tours.
  /// @dev Any .
  /// @param tourId The ID of the tour
  /// @param leagueId Id of the league
  /// @return Bool success or failure
  function joinTour(uint tourId, uint leagueId) payable public returns(bool){
    Tournament storage tour = idToTournament[tourId];
    require(IETHLeagues(ethLeagues).fetchInLeague(msg.sender, leagueId), "Not in the league!");
    require(IETHLeagues(ethLeagues).canTour(msg.sender), "Already in a Tournament!");
    require(msg.value == tour.entrancePrice, "Requires entrance price!");
    require(tour.leagues.length < tour.tourSize, "Tournament is full!");
    require(IETHLeagues(ethLeagues).updateLeague(leagueId, true, 1));
    tour.pot += msg.value;
    tour.leagues.push(leagueId);
    return true;
  }

  /// @notice Executed when the tour is set to begin.
  /// @dev Tours must be minimum of 8 leagues.
  /// @param tourId The ID of the tour
  /// @return Bool success or failure
  function startTour(uint tourId) public returns(bool){
    Tournament storage tour = idToTournament[tourId];
    require(msg.sender == tour.initiator, "Not tour initiator!");
    require(!tour.touring, "Tour already started!");
    require(tour.leagues.length == tour.tourSize, "Tournament roster is not full!");
    roundIds++;
    tour.rounds.push(roundIds);
    tour.tourRounds = tour.tourSize == 8 ? 3 : tour.tourSize == 16 ? 4 : 5;
    tour.touring = true;
    Round storage round = idToRound[roundIds];
    round.active = true;
    round.leagues = tour.leagues;
    /// Need to refactor iterator!

    // for(uint i=0; i < tour.leagues.length; i+2){
    //   matchIds++;
    //   round.matchIds.push(matchIds);
      // round.leagues.push(tour.leagues[i]);
      // round.leagues.push(tour.leagues[i+1]);
    // }

    emit TournamentStarted(tour.leagues, msg.sender, tour.pot, roundIds);
    return true;
  }

  /// @notice Initiates a new match.
  /// @dev Initiating player must be a member of league1 in the match
  /// @param matchId Id of the Tour round to initiate the match
  /// @return bool Success
    function initTourMatch(uint matchId) public returns(bool){
    uint leagueId = IETHLeagues(ethLeagues).fetchPlayerLeagueId(msg.sender);
    require(leagueId >= 0, "Must be in a league!");
    // Round memory matchRound = idToRound[roundId];
    
    Match memory tourmatch = idToMatch[matchId];
    require(leagueId == tourmatch.league1, "Not a participant!");
    require(tourmatch.player1 == address(0x0), "Match already initiated!");
    require(tourmatch.startTime == 0, "Match already started!");
    idToMatch[matchIds] = Match(
      matchIds,
      tourmatch.league1,
      tourmatch.league2,
      msg.sender,
      address(0x0),
      0,
      "",
      "",
      0
      );
      return true;
  }

  /// @notice Starts a tour match
  /// @dev Player starts a tour match with an ipfsHash
  /// msg.sender must be a member of league2 in the match
  function startTourMatch(uint matchId, string memory ipfsHash) payable public returns(bool) {
    Match memory startmatch = idToMatch[matchId];
    require(startmatch.player1 != address(0x0), "Match not initiated!");
    require(startmatch.player2 == address(0x0), "Match already started!");
    uint leagueId = IETHLeagues(ethLeagues).fetchPlayerLeagueId(msg.sender);
    require(leagueId >= 0, "Must be in a league!");
    require(leagueId == startmatch.league2, "Not a participant!");
    idToMatch[matchId] = Match(
      matchId,
      startmatch.league1,
      startmatch.league2,
      startmatch.player1,
      msg.sender,
      startmatch.startTime,
      ipfsHash,
      "",
      0
    );
    emit MatchSet(startmatch.player1, msg.sender, 0, matchId);
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param leagueId The ID of the league
  /// @param startIpfsHash The start IPFSHash of the match
  /// @param endIpfsHash The end IPFSHash of the match
  /// @return Bool success or failure
  function startClaim(uint matchId, uint leagueId, string memory startIpfsHash, string memory endIpfsHash, uint security) payable public returns(bool) {
    Match memory startmatch = idToMatch[matchId];
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(security == baseSecurity, errMessage1);
    idToClaim[matchId] = Claim(
      matchIds,
      block.number,
      security,
      leagueId,
      msg.sender,
      startIpfsHash,
      endIpfsHash,
      false,
      false,
      false
    );
    emit ClaimStarted(msg.sender, matchId);
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param leagueId Id of the league
  /// @param startIpfsHash The start Ipfs hash of the final game state
  /// @param endIpfsHash The contested Ipfs hash of the final game state
  /// @return Bool success or failure
  function disputeClaim(uint matchId, uint leagueId, string memory startIpfsHash, string memory endIpfsHash, uint dSecurity) public payable returns(bool) {
    Match memory startmatch = idToMatch[matchId];
    Claim memory claim = idToClaim[matchId];
    require(!claim.contested, "Claim already contested!");
    require(claim.claimStart + delta > block.number, "Dispute period over!");
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(dSecurity == claim.security + baseSecurity, errMessage1);
    address[] memory voters;
    idToDispute[matchId] = Dispute(
      matchId,
      claim.claimStart,
      dSecurity,
      leagueId,
      msg.sender,
      startIpfsHash,
      claim.endHash,
      endIpfsHash,
      false,
      voters,
      voters
    );
    emit ClaimContested(msg.sender, matchId, matchId);
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param vote Boolean vote for(true) or against(false)
  /// @return Bool success or failure
  function resolveDispute(uint matchId, bool vote) public hasChessNFT returns(bool) {
    Dispute storage dispute = idToDispute[matchId];
    address[] storage votedFor = dispute.votedFor;
    address[] storage votedAgainst = dispute.votedAgainst;
    if(vote){
      votedFor.push(msg.sender);
    } else {
      votedAgainst.push(msg.sender);
    }
    /// If tally is true, the claim is true, else the claim is false.
    bool tally = votedFor.length > votedAgainst.length;
    idToDispute[matchId] = Dispute(
      matchId,
      dispute.claimStart,
      dispute.dSecurity,
      dispute.league,
      dispute.disputer,
      dispute.startHash,
      dispute.endHash,
      dispute.contestedHash,
      tally,
      votedFor,
      votedAgainst
    );
    emit DisputeResolved(matchId, tally);
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param ipfsHash The start Ipfs hash of the final game state
  /// @return Bool success or failure
  function endTourMatch(uint matchId, uint roundId, string memory ipfsHash) payable public returns(bool) {
    Match memory startmatch = idToMatch[matchId];
    Claim memory claim = idToClaim[matchId];
    Dispute memory dispute = idToDispute[matchId];
    Round storage round = idToRound[roundId];
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(block.number > claim.claimStart + delta, "Dispute period ongoing.");
    if(claim.contested){
      require(block.timestamp + .5 days <= startmatch.startTime);
      if(!dispute.tally){
            sendEther(claim.claimant, claim.security);
            sendEther(treasury, dispute.dSecurity);
            round.winners.push(claim.league);
      } else {
            sendEther(dispute.disputer, dispute.dSecurity);
            sendEther(treasury, claim.security);
            round.winners.push(dispute.league);
      }
    } else {
      sendEther(claim.claimant, claim.security);
      round.winners.push(claim.league);
    }
    uint lId = IETHLeagues(ethLeagues).fetchPlayerLeagueId(msg.sender);
    idToMatch[matchId] = Match(
      matchId,
      startmatch.league1,
      startmatch.league2,
      startmatch.player1,
      startmatch.player2,
      startmatch.startTime,
      startmatch.startHash,
      ipfsHash,
      lId
    );
    round.claimIds.push(matchId);
    emit MatchEnd(msg.sender, ipfsHash);
    return true;
  }

  /// @notice Executed when the tour round advances.
  /// @dev All past round matches must have finished.
  /// @param tourId The ID of the tour
  /// @return Bool success or failure
  function advanceTour(uint tourId) public returns(bool){
    Tournament storage tour = idToTournament[tourId];
    uint rId = tour.rounds[tour.rounds.length-1];
    Round storage round = idToRound[rId];
    require(round.claimIds.length == (tour.remaining / 2), "Matches still remaining!");
    uint remaining = tour.remaining / 2;
    if(remaining == 1){
      tour.touring = false;
      Claim memory lastmatch = idToClaim[round.matchIds[0]];
      if(lastmatch.contested){
        Dispute memory dispute = idToDispute[round.matchIds[0]];
        if(dispute.tally){
            require(msg.sender == dispute.disputer);
        } else {
            require(msg.sender == lastmatch.claimant);
        }
      } else {
        require(msg.sender == lastmatch.claimant);
      }
      uint lId = IETHLeagues(ethLeagues).fetchPlayerLeagueId(msg.sender);
      (address[] memory members, uint id) = IETHLeagues(ethLeagues).fetchLeagueData(lId);
      endTour(tour.pot, tour.tourSize, members);
      emit TournamentEnded(tourId, id);
    } else {
      roundIds++;
      tour.rounds.push(roundIds);
      tour.leagues = round.winners;
      tour.remaining = round.winners.length;
      for(uint i=0; i < round.winners.length; i+2){
        matchIds++;
        idToMatch[matchIds] = Match(
        matchIds,
        round.winners[i],
        round.winners[i+1],
        address(0x0),
        address(0x0),
        0,
        "",
        "",
        0
      );
        round.leagues.push(round.winners[i]);
        round.leagues.push(round.winners[i+1]);
        round.matchIds.push(matchIds);
    }
      emit TournamentAdvanced(tour.leagues, roundIds);
    }
    return true;
  }

  /// @notice Executed when the tour is set to end.
  /// @param rewards The rewards of the tour winner.
  /// @param size How many leagues entered the tour.
  /// @param winners Array of the winning league members.
  /// @return Bool success or failure
  function endTour(uint rewards, uint size, address[] memory winners) internal returns(bool){
    uint pot = IETHTreasury(treasury).viewHoldings();
    if(size == 8){
      rewards = rewards + (pot/8);
    } else if(size == 16){
      rewards = rewards + (pot/4);
    } else {
      rewards = rewards + (pot/2);
    }
    uint rfee = calcFee(rewards);
    uint amt = winners.length;
    uint finalWinnings = rewards - rfee;
    uint winnings = finalWinnings / amt;
    for(uint i; i<amt; i++){
      IETHTreasury(treasury).disperseWinnings(winners[i], rewards - winnings);
    }
    return true;
  }

  /// @notice 
  /*~~~> 
    Calculating the platform fee, 
      Base fee set at 5% (i.e. value * 500 / 10,000) 
      Future fees can be set by the controlling DAO 
    <~~~*/
  /// @return platform fee
  function calcFee(uint256 value) public view returns (uint256)  {
      uint256 percent = ((value * fee) / 10000);
      return percent;
    }

    /// @notice
  /*~~~> 
    Internal function for sending ether
  <~~~*/
  /// @return Bool
  function sendEther(address recipient, uint ethvalue) internal returns (bool){
    (bool success,) = address(recipient).call{value: ethvalue}("");
    return(success);
  }

  receive() external payable {
    sendEther(treasury, msg.value);
  }
  fallback() external payable {}
}
