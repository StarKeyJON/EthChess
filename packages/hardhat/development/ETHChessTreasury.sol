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
// ~~~ Fans can bet on players and receive portions of payouts ~~~

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ETHChessTreasury is ReentrancyGuard {
    
    uint public holdings;
    address private DEV;
    address public Matches;

    event Transfer(address indexed to, uint256 value);
    
    constructor(address devAdd, address matches){
      DEV = devAdd;
      Matches = matches;
    }

    modifier isDev(){
        require(msg.sender == DEV, "DOES NOT HAVE DEV ROLE");
      _;
    }
    modifier isContract(){
        require(msg.sender == Matches, "DOES NOT HAVE Contract ROLE");
      _;
    }

  function disperseWinnings(address recipient, uint amount) public isContract returns(bool){
    require(holdings > amount);
    require(sendEther(recipient, amount));
    holdings -= amount;
    emit Transfer(msg.sender, amount);
    return true;
  }

  function viewHoldings() public view returns(uint){
    return holdings;
  }

  function returnToSender(address sender, uint ethvalue) public isDev returns(bool){
    sendEther(sender, ethvalue);
    emit Transfer(msg.sender, ethvalue);
    return true;
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
  receive() external payable {holdings+=msg.value;}
  fallback() external payable {}

}