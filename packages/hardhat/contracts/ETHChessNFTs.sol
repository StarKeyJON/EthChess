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

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ETHChessNFTs is ERC721, AccessControl {

    bytes32 public constant USER_OWNER_ROLE = keccak256("USER_OWNER");

    uint256 public ids;
    uint256 public supply;
    uint256 public mintPrice = 1e16;
    string public baseUri;

    constructor(address userOwnerAddress, address controllerAddress, string memory _baseUri) ERC721("ETH-Chess", "ETH-CHESS") {
      _grantRole(DEFAULT_ADMIN_ROLE, controllerAddress);
      _grantRole(USER_OWNER_ROLE, userOwnerAddress);
      baseUri = _baseUri;
      supply = 60000;
    }

    function safeMint(address to, uint amount) public payable {
      require(msg.value == amount * mintPrice, "Insufficient Value");
      require(supply >= ids + amount, "Not enough left");
      require(amount <= 10, "Amount must be <= 10");
      for(uint i; i < amount; i++){
        ids++;
        _safeMint(to, ids);
      }
    }

    function setMintPrice(uint price) public onlyRole(USER_OWNER_ROLE) returns(bool){
      mintPrice = price;
      return true;
    }

    function setSupply(uint totalAmount) public onlyRole(USER_OWNER_ROLE) returns(bool){
      require(totalAmount >= supply);
      supply = totalAmount;
      return true;
    }
    
    function setBaseUri(string memory _baseUri) public onlyRole(USER_OWNER_ROLE) {
        baseUri = _baseUri;
    }
    
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(baseUri, Strings.toString(_tokenId), ".json"));
    }

    function withdraw() public onlyRole(USER_OWNER_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, AccessControl)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}