pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol
import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";

contract WearablesNFTs is ERC1155 {
  mapping (uint256 => string) private _uris;
  uint256 _tokenCount = 0;

  constructor() ERC1155("Single Metadata URI Is Not Used") {
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

  function setURI(string memory newuri, uint256 tokenId) public virtual {
    // require something to prevent unauthorized access?
    _uris[tokenId] = newuri;
    emit URI(newuri, tokenId);
  }

  function tokenCount() public view returns (uint256) {
    return _tokenCount;
  }

  function distributeSingles(
    address from,
    address[] memory to,
    uint256 id,
    bytes memory data
  ) public virtual {
    require(
      from == _msgSender() || isApprovedForAll(from, _msgSender()),
      "ERC1155: caller is not owner nor approved"
    );
    for (uint256 i = 0; i < to.length; ++i) {
      _safeTransferFrom(from, to[i], id, 1, data);
    }
  }
}