import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  MatchInitiated,
  MatchSet,
  DeathMatchStarted,
  ClaimStarted,
  ClaimContested,
  DisputeVoted,
  DisputeResolved,
  MatchEnd,
  DeathMatchAdvanced,
  DeathMatchEnded,
  MatchRefunded,
  MatchRefundStarted
} from "../generated/YourContract/ETHChess";
import { Player, Match, DeathMatch, Claim, Dispute, Refund } from "../generated/schema";

export function handleMatchInitiated(event: MatchInitiated): void {
  let player1 = event.params.player1.toHexString();
  let matchId = event.params.matchId;
  let wager = event.params.amount;

  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;

  let p1 = Player.load(player1);
  if(p1 == null){
    p1 = new Player(player1);
    p1.address = player1;
    p1.wins = BigInt.fromI32(0);
    p1.losses = BigInt.fromI32(0);
    p1.ratio = BigInt.fromI32(0);
    p1.matches?.push(match.id)
  }
  match.player1 = player1;
  match.p1Amount = BigInt.fromI32(wager);

  p1.save();
  match.save();
}

export function handleMatchSet(event: MatchSet): void {
  let player1 = event.params.player1.toHexString();
  let player2 = event.params.player2.toHexString();
  let matchId = event.params.matchId;
  
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;
  match.player1 = player1;
  match.player2 = player2;
  match.startHash = event.params.ipfsHash;
  match.startTime = event.params.startTime;
  
  let p1 = Player.load(player1);
  let p2 = Player.load(player2);
  if(p1 == null){
    p1 = new Player(player1);
    p1.address = player1;
    p1.wins = BigInt.fromI32(0);
    p1.losses = BigInt.fromI32(0);
    p1.ratio = BigInt.fromI32(0);
    p1.matches?.push(match.id)
  }
  if(p2 == null){
    p2 = new Player(player2);
    p2.address = player2;
    p2.wins = BigInt.fromI32(0);
    p2.losses = BigInt.fromI32(0);
    p2.ratio = BigInt.fromI32(0);
    p2.matches?.push(match.id)
  }
  match.save();
  p1.save();
  p2.save();
}

export function handleDeathMatchStarted(event: DeathMatchStarted): void {
  let player1 = event.params.reign.toHexString();
  let matchId = event.params.id;
  
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;
  
  let p1 = Player.load(player1);
  if(p1 == null){
    p1 = new Player(player1);
    p1.address = player1;
    p1.wins = BigInt.fromI32(0);
    p1.losses = BigInt.fromI32(0);
    p1.ratio = BigInt.fromI32(0);
    p1.matches?.push(matchId.toString());
  }

  let deathmatch = DeathMatch.load(matchId.toString());
  if(deathmatch == null) {
    deathmatch = new DeathMatch(matchId.toString());
  }
  deathmatch.matchId = matchId;
  deathmatch.entranceFee = event.params.entranceFee;
  deathmatch.pot = event.params.entranceFee;
  deathmatch.reign = player1;
  deathmatch.matches?.push(matchId.toString());

  match.save();
  p1.save();
  deathmatch.save();
}

export function handleClaimStarted(event: ClaimStarted): void {
  let matchId = event.params.matchId;
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;

  let security = event.params.security;
  let startIpfs = event.params.startIpfsHash;
  let endIpfs = event.params.endIpfsHash;

  let claim = Claim.load(matchId.toString());
  if(claim == null){
    claim = new Claim(matchId.toString());
  }
  claim.matchId = matchId;
  claim.claimBlock = event.block.number;
  claim.security = security;
  claim.claimant = event.transaction.from.toHexString();
  claim.startHash = startIpfs;
  claim.endHash = endIpfs;
  claim.contested = false;
  claim.p1Refunded = false;
  claim.p2Refunded = false;

  claim.save();
  match.save();
}

export function handleClaimContested(event: ClaimContested): void {
  let matchId = event.params.matchId;
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;

  let claim = Claim.load(matchId.toString());
  if(claim == null){
    claim = new Claim(matchId.toString());
  }

  claim.contested = true;

  let dispute = Dispute.load(matchId.toString());
  if(dispute == null) {
    dispute = new Dispute(matchId.toString());
  }

  dispute.matchId = matchId;
  dispute.claimStart = event.block.number;
  dispute.security = event.params.security;
  dispute.disputer = event.transaction.from.toHexString();
  dispute.startHash = event.params.startIpfsHash;
  dispute.endHash = claim.endHash;
  dispute.contestedHash = event.params.endIpfsHash;

  match.save();
  claim.save();
  dispute.save();
}

export function handleDisputeVoted(event: DisputeVoted): void {
  let matchId = event.params.matchId;
  let dispute = Dispute.load(matchId.toString());
  if(dispute == null) {
    dispute = new Dispute(matchId.toString());
  }
  let vote = event.params.vote;
  let voter = event.params.voter;
  if(vote){
    dispute.votedFor?.push(voter.toHexString());
  } else {
    dispute.votedAgainst?.push(voter.toHexString());
  }
  dispute.save();
}

export function handleDisputeResolved(event: DisputeResolved): void {
  let matchId = event.params.matchId;
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;

  let dispute = Dispute.load(matchId.toString());
  if(dispute == null) {
    dispute = new Dispute(matchId.toString());
  }
  dispute.tally = event.params.truth;

  dispute.save();
  match.save();
}

export function handleMatchEnd(event: MatchEnd): void {
  let matchId = event.params.matchId;
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  let winner = event.params.winner.toHexString();
  let player1 = match.player1;
  let player2 = match.player2;

  let p1 = Player.load(player1);
    if(p1 == null){
      p1 = new Player(player1);
      p1.address = player1;
      p1.wins = BigInt.fromI32(0);
      p1.losses = BigInt.fromI32(0);
      p1.ratio = BigInt.fromI32(0);
      p1.matches?.push(matchId.toString());
    }

  let p2 = Player.load(player2);
    if(p2 == null){
      p2 = new Player(player2);
      p2.address = player2;
      p2.wins = BigInt.fromI32(0);
      p2.losses = BigInt.fromI32(0);
      p2.ratio = BigInt.fromI32(0);
      p2.matches?.push(matchId.toString());
    }

  if(winner == player1){
    if(p1.wins == null){
      p1.wins = BigInt.fromI32(1);
    } else {
      p1.wins = p1.wins.plus(BigInt.fromI32(1));
    }
    if(p1.losses == null){
      p1.ratio = p1.wins.div(BigInt.fromI32(0));
    } else {
      p1.ratio = p1.wins.div(p1.losses);
    }

    if(p2.losses == null){
      p2.losses = BigInt.fromI32(1);
    } else {
      p2.losses = p2.losses.plus(BigInt.fromI32(1));
    }
    if(p2.wins == null){
      p2.ratio = BigInt.fromI32(0);
    } else {
      p2.ratio = p2.wins.div(p2.losses);
    }
  } else {
    
    if(p1.losses == null){
      p1.losses = BigInt.fromI32(1);
    } else {
      p1.losses = p1.losses.plus(BigInt.fromI32(1));
    }
    if(p1.wins == null){
      p1.ratio = BigInt.fromI32(0);
    } else {
      p1.ratio = p1.wins.div(p1.losses);
    }

    if(p2.wins == null){
      p2.wins = BigInt.fromI32(1);
    } else {
      p2.wins = p2.wins.plus(BigInt.fromI32(1));
    }
    if(p2.losses == null){
      p2.ratio = p2.wins.div(BigInt.fromI32(0));
    } else {
      p2.ratio = p2.wins.div(p2.losses);
    }
  }
  p1.save();
  p2.save();
  
  match.matchId = matchId;
  match.winner = winner;
  match.endHash = event.params.ipfsHash;
  match.save();
}

export function handleDeathMatchAdvanced(event: DeathMatchAdvanced): void {
  let matchId = event.params.id;
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;

  let player1 = event.params.winner.toHexString();
  let p1 = Player.load(player1);
  if(p1 == null){
    p1 = new Player(player1);
    p1.address = player1;
    p1.wins = BigInt.fromI32(0);
    p1.losses = BigInt.fromI32(0);
    p1.ratio = BigInt.fromI32(0);
    p1.matches?.push(matchId.toString());
  }

  let advanceFee = event.params.entranceFee;
  let deathmatch = DeathMatch.load(matchId.toString());
  if(deathmatch == null) {
    deathmatch = new DeathMatch(matchId.toString());
    deathmatch.matchId = matchId;
  }
  deathmatch.reign = event.params.winner.toHexString();
  if(deathmatch.pot == null){
    deathmatch.pot = advanceFee;
  } else {
    deathmatch.pot = deathmatch.pot?.plus(advanceFee);
  }
  deathmatch.matches?.push(matchId.toString());

  deathmatch.save();
  match.save();
}

export function handleDeathMatchEnded(event: DeathMatchEnded): void {
  let matchId = event.params.id;
  let deathmatch = DeathMatch.load(matchId.toString());
  if(deathmatch == null) {
    deathmatch = new DeathMatch(matchId.toString());
    deathmatch.matchId = matchId;
  }
  deathmatch.winner = event.params.winner.toHexString();
  deathmatch.winnings = event.params.winnings;
  deathmatch.endHash = event.params.ipfsHash;
  deathmatch.save();
}

export function handleMatchRefundStarted(event: MatchRefundStarted): void {
  let matchId = event.params.matchId;
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;
  let player1 = event.params.refundStarted;

  let refund = Refund.load(matchId.toString());
  if(refund == null){
    refund = new Refund(matchId.toString());
    refund.matchId = matchId;
  }
  if(match.player1 == player1.toHexString()){
    refund.player1 = true;
  } else {
    refund.player2 = true;
  }
  refund.save();
  match.save();
}

export function handleMatchRefunded(event: MatchRefunded): void {
  let matchId = event.params.matchId;
  let match = Match.load(matchId.toString());
  if(match == null) {
    match = new Match(matchId.toString());
  }
  match.matchId = matchId;
  let refund = Refund.load(matchId.toString());
  if(refund == null){
    refund = new Refund(matchId.toString());
    refund.matchId = matchId;
  }
  refund.refunded = true;
  
  refund.save();
  match.save();
}