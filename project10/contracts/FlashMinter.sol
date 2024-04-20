// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ERC20} from "./ERC20.sol";
import {ERC20FlashMint} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract MyFlashMinter is ERC20FlashMint, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    address public immutable receiver;
    uint256 public immutable fee;

    constructor(
        string memory name,
        string memory symbol,
        address receiver_,
        uint256 fee_
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        receiver = receiver_;
        fee = fee_;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function flashFee(address token, uint256 amount)
        public
        view
        override
        returns (uint256)
    {
        require(token == address(this), "FlashMinter: Unsupported currency");
        return _flashFee(token, amount);
    }

    function _flashFee(address, uint256 amount)
        internal
        view 
        override
        returns (uint256)
    {
        return (amount * fee) / 10000;
    }

    function _flashFeeReceiver() internal view override returns (address) {
        return receiver;
    }
}