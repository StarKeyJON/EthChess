export const matchQ = `
{
    match(id: 1){
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
