// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    constructor() ERC721("MyNFT", "NFT") {
         uint256 tokenID = 20;
         _safeMint(msg.sender, tokenID);
    }

    function mint(address to, uint256 tokenID) public {
        // _approve(to, tokenID, msg.sender);
        _safeMint(to, tokenID);
        
    }

    function burn(uint256 tokenID) public {
        _burn(tokenID);
    }

}