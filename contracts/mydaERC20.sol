// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.1.0/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.1.0/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts@4.1.0/access/Ownable.sol";

contract ItheumTokenMYDA is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("Itheum Token", "MYDA") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
