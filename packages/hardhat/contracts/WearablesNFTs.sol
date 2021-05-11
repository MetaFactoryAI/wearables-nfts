pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol
import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";

contract WearablesNFTs is ERC1155 {
  event SetPurpose(address sender, string purpose);

  string public purpose = "Building Unstoppable Apps";
  mapping (uint256 => string) private _uris;
  uint256 _tokenCount = 0;

  constructor() ERC1155("Single Metadata URI Is Not Used") {
  }

  function setPurpose(string memory newPurpose) public {
    purpose = newPurpose;
    console.log(msg.sender, "set purpose to", purpose);
    emit SetPurpose(msg.sender, purpose);
  }

  function mint(address recipient, uint256 amount, string memory metadata, bytes memory data) public virtual {
    _tokenCount += 1;
    uint256 id = _tokenCount;
    _mint(recipient, id, amount, data);
    setURI(metadata, id);
  }

  function uri(uint256 tokenId) public view virtual override returns (string memory) {
    return _uris[tokenId];
  }

  function setURI(string memory newuri, uint256 tokenId) internal virtual {
    // require something to prevent unauthorized access?
    _uris[tokenId] = newuri;
    emit URI(newuri, tokenId);
  }

  function tokenCount() public view returns (uint256) {
    return _tokenCount;
  }
}