//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @title ETHChessMatches
/// @author Jeremiah O. Nolet
/// @notice Allows for trustless chess matches, deathmatch campaigns and decentralized payouts.
/// @custom:experimental This contract is currently under development

/*

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
          -@@*:         Jeremiah O. Nolet          .=#@*                      
          -@@+.                                     -#@*                      
    .+****#@@%**************************************#@@%****+-                
    =%@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@*.               
  .=@@*:.................................................=%@#.               
    =@@%################################################*#%@@#.               
    :*#######################################################=  

 */

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ETHChessMatches is ReentrancyGuard {

  /*~~~>
    State Address Variables
  <~~~*/
  ///@notice address of ETHChessNFTs contract
  address public ethChessNFTs;
  ///@notice total rewards held by this contract
  uint public rewardsPot;
  ///@notice uint256 matchIds incremented with each match created
  uint public matchIds;
  ///@notice uint256 deathmatchIds incremented with each deathmatch created
  uint public deathmatchIds;
  ///@notice uint256 amount of blocks needed to allow dispute resolution period to pass; initiated at 7
  uint public delta;
  ///@notice uint256 platform fee for matches
  uint public fee;
  ///@notice uint256 deathMatch winner get rewardsPot / rewardsFee
  uint public rewardsFee;
  ///@notice uint256 minWager minimum amount to wager
  uint public minWager;

  string private constant errMessage1 = "Insufficient amount";
  string private constant errMessage2 = "Not a participant!";
  
  struct Match {
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
    uint entranceFee;
    uint pot;
    uint[] matches;
    address reigningChamp;
  }

  mapping(uint => Match) public idToMatch; // Each match can have a claim and dispute with the same id
  mapping(uint => Claim) public idToClaim; // Hash the same id as the match associated
  mapping(uint => Dispute) public idToDispute; // Has the same id as the match associated
  mapping(uint => DeathMatch) public idToDeathMatch;
  mapping(uint => uint) public matchIdToDeathMatchID; // To track DeathMatches

  event MatchInitiated(address player1, uint amount, uint matchId);
  event ChallengeInitiated(address player1, uint amount, uint matchId);
  event MatchSet(address player1, address player2, uint amount, uint matchId, string ipfsHash);
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
    require(balance > 0, "Not an ETH-Chess NFT holder!");
    _;
  }

  constructor(address adminAdd){
    ADMIN = adminAdd;
    delta = 7;
    fee = 100; // 10%
    rewardsFee = 500; // 50%
    minWager = 1e13;
  }

  /// @notice Allows Admin role to set a new Admin
  function newAdmin(address newAd) external isAdmin returns(bool) {
    ADMIN = newAd;
    return true;
  }

  /// @notice Allows Admin role to set a new fee
  function newFee(uint newFe) external isAdmin returns(bool){
    fee = newFe;
    return true;
  }
  
  /// @notice Allow Admin role to set a new rewardsFee
  function newRFee(uint newRFe) external isAdmin returns(bool){
    rewardsFee = newRFe;
    return true;
  }

  /// @notice Allows Admin role to set a new dispute resolution Delta
  function newDelta(uint newDel) external isAdmin returns(bool){
    delta = newDel;
    return true;
  }

  /// @notice Allows Admin role to set a new ETHChess NFT Address
  function newNFTAddress(address newAddress) external isAdmin returns(bool){
    ethChessNFTs = newAddress;
    return true;
  }

  /// @notice Allow Admin role to set a new minimum wager amount
  function newMinWager(uint newMinWa) external isAdmin returns(bool){
    minWager = newMinWa;
    return true;
  }

  //~~~> initMatch => startMatch, ?claimRefunds => startClaim, ?disputeClaim, ?resolveDispute => endMatch

  /// @notice Initiates a new 1v1 match with a set wager value.
  /// @dev Player initiates a new match that anyone can start by matching the wager
  /// @return matchId Id of the initiated match
  function initMatch() external payable returns(uint matchId){
      require(msg.value > minWager, errMessage1);
      matchIds++;
      idToMatch[matchIds] = Match(
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
  function initChallengeMatch(address comp) external payable returns(uint matchId){
      require(msg.value > minWager, errMessage1);
      matchIds++;
      idToMatch[matchIds] = Match(
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

  /// @notice Starts an initiated match by matching the wagered value and entering the initial IPFS gamestate.
  /// @dev ipfsHash will contain the gameplay FEN, board and any metadata 
  /// @param matchId The ID of the match, increments with each match
  /// @param ipfsHash The hash of the game start
  /// @return Bool success or failure
  function startMatch(uint matchId, string memory ipfsHash) external payable returns(bool){
    Match memory startmatch = idToMatch[matchId];
    require(startmatch.player1 != address(0x0), "Match not initiated!");
    require(startmatch.startTime == 0, "Match already started!"); // Ensure a match isn't started already
    uint dId = matchIdToDeathMatchID[matchId];
    if(dId > 0) {
      DeathMatch storage dMatch = idToDeathMatch[dId];
      require(msg.value == dMatch.entranceFee, errMessage1); // Ensuring DeathMatch entranceFee is met
      dMatch.pot += msg.value;
    } else {
      require(msg.value == startmatch.p1amount, errMessage1); // Ensure msg.value equals the starting wager
    }
    if (startmatch.player2 != address(0x0)) { /// Ensure the caller is the challenger, if a challenged match
      require(msg.sender == startmatch.player2, "Not the Challenger!");
    }
    idToMatch[matchId] = Match(
      startmatch.player1,
      msg.sender,
      block.timestamp,
      ipfsHash,
      startmatch.endHash,
      startmatch.p1amount,
      msg.value
    );
    emit MatchSet(startmatch.player1, msg.sender, (startmatch.p1amount + msg.value), matchId, ipfsHash);
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state along with security deposit equal to initial wager,
  /// in order to go through the claim resolution process.
  /// @param matchId The ID of the match
  /// @param startIpfsHash The start IPFSHash of the match
  /// @param endIpfsHash The end IPFSHash of the match
  /// @param security The security must equal the initial wager amount
  /// @return Bool success or failure
  function startClaim(uint matchId, string memory startIpfsHash, string memory endIpfsHash, uint security) external payable returns(bool){
    Match memory startmatch = idToMatch[matchId];
    bytes memory hashBytes = bytes(startmatch.endHash);
    uint dId = matchIdToDeathMatchID[matchId];
    require(hashBytes.length == 0, "Claim already started!");
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    if(dId > 0) {
      DeathMatch storage dMatch = idToDeathMatch[dId];
      require(msg.value == dMatch.entranceFee, errMessage1); // Ensuring DeathMatch entranceFee is met
    } else {
      require(security == startmatch.p1amount, errMessage1);
    }
    address[] memory refunds; /// Empty array used for placeholder
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

  /// @notice Executed to dispute the winning claim. Must be before *delta nummber of blocks!
  /// @dev Disputer must enter IPFS hash of final gameplay state to go through dispute resolution process.
  /// @param matchId The ID of the match
  /// @param startIpfsHash The start Ipfs hash of the final game state
  /// @param endIpfsHash The contested Ipfs hash of the final game state
  /// @param dSecurity The dispute security must equal twice the initial wager amount
  /// @return Bool success or failure
  function disputeClaim(uint matchId, string memory startIpfsHash, string memory endIpfsHash, uint dSecurity) external payable returns(bool){
    Match memory startmatch = idToMatch[matchId];
    Claim storage claim = idToClaim[matchId]; // Storage used to save claim.contested
    uint dId = matchIdToDeathMatchID[matchId];
    require(!claim.contested, "Claim already contested!"); /// Ensure claim is not contested already
    require(claim.claimBlock + delta > block.number, "Dispute period over!"); /// Ensure the call is within the dispute time window
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2); // Ensure the caller is a contestant
    if(dId > 0) {
      DeathMatch storage dMatch = idToDeathMatch[dId];
      require(msg.value == dMatch.entranceFee * 2, errMessage1); // Ensuring DeathMatch entranceFee is met
    } else {
      require(dSecurity == (startmatch.p1amount + startmatch.p2amount), errMessage1); /// Dispute security must be twice the amount of initial wager
    }
    address[] memory voters; /// Empty array used for placeholders
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

  /// @notice Only EthChessNFT holders can Execute to vote in a disputed match
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param vote Boolean vote for(true) or against(false)
  /// @return Bool success or failure
  function resolveDispute(uint matchId, bool vote) external hasChessNFT nonReentrant returns(bool) {
    Match memory disputedmatch = idToMatch[matchId];
    require(msg.sender != disputedmatch.player1 || msg.sender != disputedmatch.player2, "Illegal vote!"); // Ensuring match participants cannot vote
    Dispute storage dispute = idToDispute[matchId];
    address[] storage votedFor = dispute.votedFor;
    address[] storage votedAgainst = dispute.votedAgainst;
    if(vote && votedFor.length < 10){
      votedFor.push(msg.sender);
      emit DisputeVoted(msg.sender, matchId, vote);
    } else if(!vote && votedAgainst.length < 10){
      votedAgainst.push(msg.sender);
      emit DisputeVoted(msg.sender, matchId, vote);
    }
    /// If tally is true, the claim is true, else the claim is false.
    bool tally = votedFor.length > votedAgainst.length || votedFor.length == votedAgainst.length; // Initial claimaint is given benefit of the doubt
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
    return true;
  }

  /// @notice Executed when the match ends to claim rewards.
  /// @dev Winner must enter IPFS hash of final gameplay state to go through claim resolution process.
  /// @param matchId The ID of the match
  /// @param ipfsHash The start Ipfs hash of the final game state
  /// @return Bool success or failure
  function endMatch(uint matchId, string calldata ipfsHash) external payable nonReentrant returns(bool){
    Match storage startmatch = idToMatch[matchId];
    Claim memory claim = idToClaim[matchId];
    Dispute memory dispute = idToDispute[matchId];
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(block.number > claim.claimBlock + delta, "Dispute period ongoing.");
    uint pfee = calcFee((startmatch.p1amount + startmatch.p2amount), fee);
    if(claim.contested){ /// If tally is true, the claim is true, else the claim is false.
      emit DisputeResolved(matchId, dispute.tally);
      if(dispute.tally){ // Claim is true, caller is claimant
        require(msg.sender == claim.claimant, "Not the winner!");
        uint voters = dispute.votedFor.length;
        rewardsPot += (dispute.dSecurity / 2) + pfee; // Adjusting state before sending funds to prevent reentrancy attack
        startmatch.p1amount = 0;
        startmatch.p2amount = 0;
        uint voteReward = (dispute.dSecurity / 2) / voters; // 1/2 of dSecurity == wager amount
        for(uint i; i < voters; i++){ // Distribute voting rewards to voters
          require(sendEther(dispute.votedFor[i], voteReward)); // Ensure funds are sent
        }
        require(sendEther(msg.sender, (startmatch.p1amount + startmatch.p2amount + claim.security) - pfee)); // Ensure funds are sent
      } else { // Dispute is true, caller is disputer
        require(msg.sender == dispute.disputer, "Not the winner!");
        uint voters = dispute.votedAgainst.length; // Cache voters length
        rewardsPot += pfee; // Adjusting state before sending funds to prevent reentrancy attack
        startmatch.p1amount = 0;
        startmatch.p2amount = 0;
        uint voteReward = claim.security / voters; // security == wager amount
        for(uint i; i < voters; i++){ // Distribute voting rewards to voters
          require(sendEther(dispute.votedAgainst[i], voteReward)); // Ensure funds are sent
        }
        require(sendEther(msg.sender, (startmatch.p1amount + startmatch.p2amount + dispute.dSecurity) - pfee)); // Ensure funds are sent
      }
    } else { // Win was uncontested! Send the rewards!
      rewardsPot += pfee; // Adjust state before sending funds to prevent reentrancy attack
      startmatch.p1amount = 0;
      startmatch.p2amount = 0;
      require(sendEther(msg.sender, (startmatch.p1amount + startmatch.p2amount + claim.security) - pfee)); // Ensure funds are sent
    }
    startmatch.endHash = ipfsHash;
    emit MatchEnd(matchId, msg.sender, ipfsHash);
    return true;
  }

  /// @notice Executed when the match is a draw or no play. Each player must accept refund and then claim refund.
  /// @dev Claim must not be made and one tenth of a day must have passed to claim refund.
  /// @param matchId The ID of the match
  /// @return Bool success or failure
  function claimRefund(uint matchId) external nonReentrant returns(bool){
    Match memory startmatch = idToMatch[matchId];
    Claim storage claim = idToClaim[matchId];
    require(msg.sender == startmatch.player1 || msg.sender == startmatch.player2, errMessage2);
    require(block.timestamp < startmatch.startTime + .1 days, "Too soon to refund."); // Refund must be made .1 days after match start
    require(claim.claimBlock == 0, "Claim initiated, refund cannot be made."); // No claim can be made before a refund is processed
    if(claim.refunds.length == 0){ // If a refund wasnt claimed yet,
      claim.refunds.push(msg.sender);
      emit MatchRefundStarted(matchId, msg.sender, address(0x0));
      return true;
    } else if(claim.refunds.length == 1 && claim.refunds[0] != msg.sender){ // Else is the second player is iniitiating a refund
      claim.refunds.push(msg.sender);
      emit MatchRefundStarted(matchId, claim.refunds[0], msg.sender);
      return true;
    } 
    // If both players initiated the refund, send the money back!
    if(claim.refunds.length == 2){
      if(msg.sender == startmatch.player1){
        require(!claim.p1Refunded && startmatch.p1amount > 0);
        startmatch.p1amount = 0; // Adjust state before sending funds to prevent reentrancy attack
        claim.p1Refunded = true; 
        require(sendEther(startmatch.player1, startmatch.p1amount)); // Ensure funds are sent
      } else if(msg.sender == startmatch.player2){
        require(!claim.p2Refunded && startmatch.p2amount > 0);
        startmatch.p2amount = 0; // Adjust state before sending funds to prevent reentrancy attack
        claim.p2Refunded = true;
        require(sendEther(startmatch.player2, startmatch.p2amount)); // Ensure funds are sent
      }
    }
    emit MatchRefunded(matchId);
    return true;
  }

  /// @notice ~~~> initDeathMatch => startMatch => startClaim, disputeClaim, resolveDispute => endMatch => advanceDeathmatch => endDeathmatch 
  /// @dev New deathmatch initiated by any player
  /// @param entranceFee The fee for the deathmatch set by the initiator
  /// @return Bool success or failure
  function initDeathMatch(uint entranceFee) external payable returns(bool){
    require(msg.value == entranceFee);
    require(idToDeathMatch[deathmatchIds].matches.length == 3 || idToDeathMatch[deathmatchIds].reigningChamp == address(0x0), "DeathMatch still ongoing!"); // Ensuring 1 DeathMatch at a time
    deathmatchIds++;
    DeathMatch storage dmatch = idToDeathMatch[deathmatchIds]; // Load from storage to avoid writing empty arrays
    dmatch.entranceFee = entranceFee;
    dmatch.pot = entranceFee;
    dmatch.reigningChamp = msg.sender;
    matchIds++; // Each round in the dathmatch is just a Match struct
    idToMatch[matchIds] = Match(
      msg.sender,
      address(0x0),
      0,
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
  function advanceDeathMatch(uint deathmatchId, string memory ipfsHash) external payable returns(bool){
    DeathMatch storage deathmatch = idToDeathMatch[deathmatchId];
    uint len = deathmatch.matches.length;
    Claim memory lastmatch = idToClaim[deathmatch.matches[len - 1]];
    require(lastmatch.claimBlock > 0, "Match still ongoing!");
    uint[] memory matches;
    if(lastmatch.contested){
      Dispute memory lastdispute = idToDispute[deathmatch.matches[len - 1]];
      if(lastdispute.tally){ // lastdipute.tally == votedFor.length > votedAgainst.length
        require(msg.sender == lastmatch.claimant, errMessage2); // Claim is true
      } else {
        require(msg.sender == lastdispute.disputer, errMessage2); // Dispute is true
      }
    } else {
      require(msg.sender == lastmatch.claimant, errMessage2); // Un-disputed
    }
    if(msg.sender == deathmatch.reigningChamp){ // Reinging Champ needs 3 consecutive wins to win the deathmatch
      if(deathmatch.matches.length == 3){ // Deathmatch winner!
        uint rfee = calcFee(rewardsPot, rewardsFee);
        rewardsPot -= rfee;
        require(sendEther(msg.sender, deathmatch.pot + rfee)); // Ensure funds are sent
        emit DeathMatchEnded(deathmatchId, msg.sender, ipfsHash, deathmatch.pot + rfee);
        idToDeathMatch[deathmatchId] = DeathMatch(0,0, matches, address(0x0));
        return true;
      } else { // New match round
        require(msg.value == deathmatch.entranceFee, errMessage1);
        deathmatch.pot = deathmatch.pot + msg.value;
        uint id = newRound(deathmatch.entranceFee, deathmatch.reigningChamp, ipfsHash);
        matchIdToDeathMatchID[id] = deathmatchId;
        deathmatch.matches.push(id);
      }
    } else { // New Reigning Champion, reset rounds!
      require(msg.value == deathmatch.entranceFee, errMessage1);
      deathmatch.pot = deathmatch.pot + msg.value;
      deathmatch.reigningChamp = msg.sender;
      deathmatch.matches = matches;
      uint id = newRound(deathmatch.entranceFee, msg.sender, ipfsHash);
      matchIdToDeathMatchID[id] = deathmatchId;
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
  function newRound(uint matchfee, address champ, string memory ipfsHash) internal returns(uint){
    matchIds++;
    idToMatch[matchIds] = Match(
      champ,
      address(0x0),
      0,
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
      Base fee set at 10% (i.e. value * 1000 / 10,000) 
      Future fees can be set by the controlling Admin EOA
    <~~~*/
  /// @return platform fee
  function calcFee(uint256 value, uint256 fe) internal pure returns (uint256){
      uint256 percent = ((value * fe) / 10000);
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

  // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}
}
