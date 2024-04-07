// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MyToken} from "./MyToken.sol";
import {MyNFT} from "./MyNFT.sol";

contract TokenSale {

    uint256 public ratio;
    uint256 public price;
    MyToken public paymentToken; // location of token contract
    MyNFT public nftCollection; // location of nft contract

    constructor(uint256 _ratio, uint256 _price, MyToken _paymentToken, MyNFT _nftCollection) {
        ratio = _ratio;
        price = _price;
        paymentToken = _paymentToken;
        nftCollection = _nftCollection;
    }
    
    function buyTokens() external payable {
        
        paymentToken.mint(msg.sender, msg.value * ratio);
    }

    function returnTokens(uint256 amount) external {
        
        paymentToken.burnFrom(msg.sender, amount); 
        payable(msg.sender).transfer(amount / ratio);    
    }

    function buyNFTs(uint256 tokenID) external payable {
        
        paymentToken.mint(msg.sender, msg.value / price);
        nftCollection.mint(msg.sender, tokenID);
        payable(msg.sender).transfer(msg.value);

        // nftCollection.safeTransferFrom(msg.sender, to, tokenID);
        
    }

    function returnNFTs(uint256 tokenID) external payable {

        nftCollection.burn(tokenID);
    }

}