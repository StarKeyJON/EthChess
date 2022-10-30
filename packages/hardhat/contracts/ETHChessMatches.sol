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

contract ETHChessMatches is ReentrancyGuard {

  /*~~~>
    State Address Variables
  <~~~*/

  address public ethChessNFTs;
  uint public rewardsPot;
  uint public leagueIds;
  uint public matchIds;
  uint public deathmatchIds;
  uint public delta;
  uint public fee;
  uint public rewardsFee;

  string private constant errMessage1 = "Insufficient amount";
  string private constant errMessage2 = "Not a participant!";
  
  struct Player {
    uint playerId;
    bool inLeague;
    uint matches;
    uint wins;
    uint losses;
    uint leagueId;
    address playersAddress;
  }

  struct Match {
    uint matchId;
    address player1;
    address player2;
    uint startTime;
    string startHash;
    string endHash;
    uint p1amount;
    uint p2amount;
  }

  struct Claim {
    uint matchId;
    uint claimBlock;
    uint security;
    address claimant;
    string startHash;
    string endHash;
    bool contested;
    bool p1Refunded;
    bool p2Refunded;
    address[] refunds;
  }

    struct Dispute {
    uint matchId;
    uint claimStart;
    uint dSecurity;
    address disputer;
    string startHash;
    string endHash;
    string contestedHash;
    bool tally;
    address[] votedFor;
    address[] votedAgainst;
  }

  struct DeathMatch {
    uint deathmatchId;
    uint entranceFee;
    uint pot;
    uint reign;
    uint comp;
    uint[] matches;
    address reigningChamp;
  }

  mapping(address => Player) public addressToPlayer;
  mapping(uint => Match) public idToMatch;
  mapping(uint => Claim) public idToClaim;
  mapping(uint => Dispute) public idToDispute;
  mapping(uint => DeathMatch) public idToDeathMatch;

  event MatchInitiated(address player1, uint amount, uint matchId);
  event ChallengeInitiated(address player1, uint amount, uint matchId);
  event MatchSet(address player1, address player2, uint amount, uint matchId, string ipfsHash, uint startTime);
  event ClaimStarted(address claimant, uint matchId, string startIpfsHash, string endIpfsHash, uint security);
  event ClaimContested(address disputer, uint matchId, uint claimId, string startIpfsHash, string endIpfsHash, uint security);
  event DisputeVoted(address voter, uint matchId, bool vote);
  event DisputeResolved(uint matchId, bool truth);
  event MatchEnd(uint matchId, address winner, string ipfsHash);
  event MatchRefunded(uint matchId);
  event MatchRefundStarted(uint matchId, address refundStarted, address refundConfirmed);
  event DeathMatchStarted(uint id, address reign, uint entranceFee);
  event DeathMatchAdvanced(uint id, address winner, string ipfsHash, uint entranceFee);
  event DeathMatchEnded(uint id, address winner, string ipfsHash, uint winnings);

  address private ADMIN;

  modifier isAdmin(){
    require(msg.sender == ADMIN, "DOES NOT HAVE ADMIN ROLE");
    _;
  }
  modifier hasChessNFT(){
    uint balance = IERC721(ethChessNFTs).balanceOf(msg.sender);
    require(balance >= 1, "Not an ETH-Chess NFT holder!");
    _;
  }

  constructor(address devAdd){
    ADMIN = devAdd;
    delta = 7;
    fee = 1000; // 10%
    rewardsFee = 5000; // 50%
  }

  function newFee(uint newFe) public isAdmin returns(bool){
    fee = newFe;
    return true;
  }
  
  function newRFee(uint newRFe) public isAdmin returns(bool){
    rewardsFee = newRFe;
    return true;
  }

  function changeDelta(uint newDelta) public isAdmin returns(bool){
    delta = newDelta;
    return true;
  }

  function newNFTAddress(address newAddress) public isAdmin returns(bool){
    ethChessNFTs = newAddress;
    return true;
  }

  //~~~> initMatch => startMatch, ?claimRefunds => startClaim, ?disputeClaim, ?resolveDispute => endMatch

  /// @notice Initiates a new 1v1 match with a set wager value.
  /// @dev Player initiates a new match that anybody can start by matching the wager
  /// @return matchId Id of the initiated match
  function initMatch() payable public returns(uint matchId){
      require(msg.value > 1e13, errMessage1);
      matchIds++;
      idToMatch[matchIds] = Match(
        matchIds,
        msg.sender,
        address(0x0),
        0,
        "",
        "",
        msg.value,
        0
        );
      emit MatchInitiated(msg.sender, msg.value, matchIds);
      return matchIds;
  }

  /// @notice Initiates a new match with a set wager value between specific challengers.
  /// @dev Player initiates a new match that only the challenger can start by matching the wager
  /// @return matchId Id of the initiated match
  function initChallengeMatch(address comp) payable public returns(uint matchId){
      require(msg.value > 1e13, errMessage1);
      matchIds++;
      idToMatch[matchIds] = Match(
        matchIds,
        msg.sender,
        comp,
        0,
        "",
        "",
        msg.value,
        0
        );
      emit ChallengeInitiated(msg.sender, msg.value, matchIds);
      return matchIds;
  }

  /// @notice Starts an initiated match by matching the wagered value and entering the initial gamestate.
  /// @dev ipfsHash will contain the gameplay FEN, board and any metadata 
  /// @param matchId The ID of the match, increments with each match
  /// @param ipfsHash The hash of the game start
  /// @return Bool success or failure
  function startMatch(uint matchId, string memory ipfsHash) payable public returns(bool){
    Match memory startmatch = idToMatch[matchId];
    require(msg.value == startmatch.p1amount, errMessage1);
    uint totalValue = startmatch.p1amount + msg.value;
    if (startmatch.player2 != address(0x0)) {
      require(msg.sender == startmatch.player2, "Not the Challenger!");
    }
    idToMatch[matchId] = Match(
      matchId,
      startmatch.player1,
      msg.sender,
      block.timestamp,
      ipfsHash,
      startmatch.endHash,
      startmatch.p1amount,
      msg.value
    );
    emit MatchSet(startmatch.player1, msg.sender, totalValue, matchId, ipfsHash, block.timestamp);
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param startIpfsHash The start IPFSHash of the match
  /// @param endIpfsHash The end IPFSHash of the match
  /// @return Bool success or failure
  function startClaim(uint matchId, string memory startIpfsHash, string memory endIpfsHash, uint security) payable public returns(bool){
    Match memory startmatch = idToMatch[matchId];
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(security == startmatch.p1amount, "Must enter security deposit = to wager");
    address[] memory refunds;
    idToClaim[matchId] = Claim(
      matchIds,
      block.number,
      security,
      msg.sender,
      startIpfsHash,
      endIpfsHash,
      false,
      false,
      false,
      refunds
    );
    emit ClaimStarted(msg.sender, matchId, startIpfsHash, endIpfsHash, security);
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param startIpfsHash The start Ipfs hash of the final game state
  /// @param endIpfsHash The contested Ipfs hash of the final game state
  /// @return Bool success or failure
  function disputeClaim(uint matchId, string memory startIpfsHash, string memory endIpfsHash, uint dSecurity) public payable returns(bool){
    Match memory startmatch = idToMatch[matchId];
    Claim memory claim = idToClaim[matchId];
    require(!claim.contested, "Claim already contested!");
    require(claim.claimBlock + delta > block.number, "Dispute period over!");
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(dSecurity == startmatch.p1amount + startmatch.p2amount, errMessage1);
    address[] memory voters;
    claim.contested = true;
    idToDispute[matchId] = Dispute(
      matchId,
      claim.claimBlock,
      dSecurity,
      msg.sender,
      startIpfsHash,
      claim.endHash,
      endIpfsHash,
      false,
      voters,
      voters
    );
    emit ClaimContested(msg.sender, matchId, matchId, startIpfsHash, endIpfsHash, dSecurity);
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param vote Boolean vote for(true) or against(false)
  /// @return Bool success or failure
  function resolveDispute(uint matchId, bool vote) public hasChessNFT returns(bool){
    Dispute storage dispute = idToDispute[matchId];
    address[] storage votedFor = dispute.votedFor;
    address[] storage votedAgainst = dispute.votedAgainst;
    if(vote && votedFor.length < 10){
      votedFor.push(msg.sender);
      emit DisputeVoted(msg.sender, matchId, vote);
      return true;
    } else if(!vote && votedAgainst.length < 10){
      votedAgainst.push(msg.sender);
      emit DisputeVoted(msg.sender, matchId, vote);
      return true;
    }
    /// If tally is true, the claim is true, else the claim is false.
    bool tally = votedFor.length > votedAgainst.length;
    idToDispute[matchId] = Dispute(
      matchId,
      dispute.claimStart,
      dispute.dSecurity,
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
  function endMatch(uint matchId, string memory ipfsHash) payable public returns(bool){
    Match memory startmatch = idToMatch[matchId];
    Claim memory claim = idToClaim[matchId];
    Dispute memory dispute = idToDispute[matchId];
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(block.number > claim.claimBlock + delta, "Dispute period ongoing.");
    uint pfee = calcFee(startmatch.p1amount + startmatch.p2amount, fee);
    if(claim.contested){
      require(block.timestamp + .5 days <= startmatch.startTime);
      if(msg.sender != dispute.disputer && !dispute.tally){
        uint voters = dispute.votedFor.length;
        for(uint i; i < voters; i++){
          uint voteReward = (dispute.dSecurity / 2) / voters;
          sendEther(dispute.votedFor[i], voteReward);
        }
        rewardsPot += (dispute.dSecurity / 2) + pfee;
        sendEther(msg.sender, (startmatch.p1amount + startmatch.p2amount + claim.security) - pfee);
      } else if(msg.sender == dispute.disputer && dispute.tally){
        uint voters = dispute.votedAgainst.length;
        for(uint i; i < voters; i++){
          uint voteReward = claim.security / voters;
          sendEther(dispute.votedAgainst[i], voteReward);
        }
        rewardsPot += pfee;
        sendEther(msg.sender, (startmatch.p1amount + startmatch.p2amount + dispute.dSecurity) - pfee);
      }
    } else {
      rewardsPot += pfee;
      sendEther(msg.sender, (startmatch.p1amount + startmatch.p2amount + claim.security) - pfee);
    }
    idToMatch[matchId] = Match(
      matchId,
      startmatch.player1,
      startmatch.player2,
      startmatch.startTime,
      startmatch.startHash,
      ipfsHash,
      startmatch.p1amount,
      startmatch.p2amount
    );
    emit MatchEnd(matchId, msg.sender, ipfsHash);
    return true;
  }

  /// @notice Executed when the match is a draw or no play. Each player must accept refund and then claim refund.
  /// @dev Claim must not be made and one tenth of a day must have passed to claim refund.
  /// @param matchId The ID of the match
  /// @return Bool success or failure
  function claimRefund(uint matchId) public returns(bool){
    Match memory startmatch = idToMatch[matchId];
    Claim storage claim = idToClaim[matchId];
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(block.timestamp < startmatch.startTime + .1 days, "Too soon to refund.");
    require(claim.claimBlock == 0, "Claim initiated, refund cannot be made.");
    if(claim.refunds.length == 0){
      claim.refunds.push(msg.sender);
      emit MatchRefundStarted(matchId, msg.sender, address(0x0));
      return true;
    } else if(claim.refunds.length == 1 && claim.refunds[0] != msg.sender){
      claim.refunds.push(msg.sender);
      emit MatchRefundStarted(matchId, claim.refunds[0], msg.sender);
      return true;
    } 
    if(claim.refunds.length == 2 && msg.sender == startmatch.player1 && !claim.p1Refunded && startmatch.p1amount > 0 ){
      require(sendEther(startmatch.player1, startmatch.p1amount));
      startmatch.p1amount = 0;
      claim.p1Refunded = true;
    } else if(claim.refunds.length == 2 && msg.sender == startmatch.player2 && !claim.p2Refunded && startmatch.p1amount > 0){
      require(sendEther(startmatch.player2, startmatch.p2amount));
      startmatch.p2amount = 0;
      claim.p2Refunded = true;
    }
    emit MatchRefunded(matchId);
    return true;
  }

  /// @notice ~~~> initDeathMatch => startMatch => startClaim, disputeClaim, resolveDispute => endMatch => advanceDeathmatch => endDeathmatch 
  /// @dev New deathmatch initiated by any player
  /// @param entranceFee The fee for the deathmatch set by the initiator
  /// @return Bool success or failure
  function initDeathMatch(uint entranceFee) payable public returns(bool){
    require(msg.value == entranceFee);
    deathmatchIds++;
    DeathMatch storage dmatch = idToDeathMatch[deathmatchIds];
    dmatch.entranceFee = entranceFee;
    dmatch.pot = entranceFee;
    dmatch.reigningChamp = msg.sender;
    matchIds++;
    idToMatch[matchIds] = Match(
      matchIds,
      msg.sender,
      address(0x0),
      block.timestamp,
      "",
      "",
      entranceFee,
      0
    );
    dmatch.matches.push(matchIds);

    emit DeathMatchStarted(deathmatchIds, msg.sender, entranceFee);
    return true;
  }

  /// @notice advanceDeathMatch
  /// If the winner equals the reigning champion, 
  /// and has won 3 matches in a row
  /// they win the deathmatch pot!
  /// @dev Public function to advance the deathmatch
  /// @param deathmatchId Id of the deathmatch to advance
  /// @param ipfsHash String of the new match
  /// @return Success or failure
  function advanceDeathMatch(uint deathmatchId, string memory ipfsHash) public payable returns(bool){
    DeathMatch storage deathmatch = idToDeathMatch[deathmatchId];
    uint len = deathmatch.matches.length;
    require(msg.value == deathmatch.entranceFee);
    Claim memory lastmatch = idToClaim[deathmatch.matches[len - 1]];
    require(lastmatch.claimBlock > 0);
    if(lastmatch.contested){
      Dispute memory lastdispute = idToDispute[len];
      if(lastdispute.tally){
        require(msg.sender == lastdispute.disputer);
      } else {
        require(msg.sender == lastmatch.claimant);
      }
    } else {
      require(msg.sender == lastmatch.claimant);
    }
    deathmatch.pot = deathmatch.pot + msg.value;
    uint[] memory matches;
    if(msg.sender == deathmatch.reigningChamp){
      if(deathmatch.matches.length == 3){
        uint rfee = calcFee(rewardsPot, rewardsFee);
        sendEther(msg.sender, deathmatch.pot + rfee);
        emit DeathMatchEnded(deathmatchId, msg.sender, ipfsHash, deathmatch.pot + rfee);
        return true;
      } else {
        uint id = newMatch(deathmatch.entranceFee, deathmatch.reigningChamp, ipfsHash);
        deathmatch.matches.push(id);
      }
    } else {
      deathmatch.reigningChamp = msg.sender;
      deathmatch.matches = matches;
      uint id = newMatch(deathmatch.entranceFee, msg.sender, ipfsHash);
      deathmatch.matches.push(id);
    }
    emit DeathMatchAdvanced(deathmatchId, msg.sender, ipfsHash, msg.value);
    return true;
  }

  /// @notice
  /// @dev Internal function for generating a new Match
  /// @param matchfee fee for the match
  /// @param champ Winning contestant
  /// @param ipfsHash String of the new Match
  /// @return uint matchId
  function newMatch(uint matchfee, address champ, string memory ipfsHash) internal returns(uint){
    matchIds++;
    idToMatch[matchIds] = Match(
      matchIds, 
      champ,
      msg.sender,
      block.timestamp,
      ipfsHash,
      "",
      matchfee,
      matchfee
    );
    return matchIds;
  }

  /// @notice 
  /*~~~> 
    Calculating the platform fee, 
      Base fee set at 5% (i.e. value * 500 / 10,000) 
      Future fees can be set by the controlling DAO 
    <~~~*/
  /// @return platform fee
  function calcFee(uint256 value, uint256 fe) public pure returns (uint256){
      uint256 percent = ((value * fe) / 10000);
      return percent;
    }

  /// @notice
  /*~~~> 
    External function for viewing rewards holdings
  <~~~*/
  function viewHoldings() external view returns(uint256){
      return rewardsPot;
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

  // to support receiving ETH by default
  receive() external payable {
    rewardsPot+=msg.value;
  }
  fallback() external payable {}
}
