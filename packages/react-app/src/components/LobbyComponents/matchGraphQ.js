export const matchQ = `
{
    matches(inProgress: false){
      id
      matchId
      player1 {
        id
      }
      player2 {
        id
      }
      startTime
      startHash
      endHash
      p1Amount
      p2Amount
      inProgress
    }
    deathMatches(inProgress: false){
      id
      matchId
      player1 {
        id
      }
      player2 {
        id
      }
      startTime
      startHash
      endHash
      p1Amount
      p2Amount
      inProgress
    }
  }`;
