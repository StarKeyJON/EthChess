//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

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
          -@@*:            @treeguyjon             .=#@*                      
          -@@+.                                     -#@*                      
    .+****#@@%**************************************#@@%****+-                
    =%@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@*.               
  .=@@*:.................................................=%@#.               
    =@@%################################################*#%@@#.               
    :*#######################################################=   
 */

interface IETHChess {
  function fetchOfferId(uint marketId) external returns(uint);
  function refundOffer(uint itemID, uint offerId) external returns (bool);
}

interface IETHTreasury {
  function viewHoldings() external view returns(uint);
  function disperseWinnings(address recipient, uint amount) external returns(bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

interface IETHLeagues {
  function fetchLeague(uint leaguId) external returns(bool);
  function fetchLeagueData(uint leagueId) external returns(address[] memory members, uint id);
  function canTour(address player) external returns(bool); 
  function fetchPlayerLeagueId(address player) external returns(uint leagueId);
  function updateLeague(uint leagueId, bool inTour, uint tours, uint wins, uint losses) external returns(bool);
}